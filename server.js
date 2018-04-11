const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const db = require("./models")

const PORT = 3000;
const app = express();

const axios = require("axios");
const cheerio = require("cheerio");

app.use(bodyParser.urlencoded({ extended : false }));
app.use(express.static("public"));

app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//checking which database to connect to.

const localDbUri = "mongodb://localhost/nytimes";
if(process.env.MOGODB_URI) {
    mongoose.connect(MONGODB_URI);    
} else {
    mongoose.connect(localDbUri);
}

//checking connection to MongoDB.

const database = mongoose.connection;
database.on("error", function(err) {
    console.log("Mongoose Error: " + err);
});
database.once("open", function() {
    console.log("Mongoose connection successful.");
});

//Routes

app.get("/", function (req, res) {
    res.render("index", {});
});

app.get("/scrape", function(req, res) {
    axios.get("https://www.nytimes.com/section/technology?action=click&pgtype=Homepage&region=TopBar&module=HPMiniNav&contentCollection=Tech&WT.nav=page")
    .then(function(response) {
        const $ = cheerio.load(response.data);
        $(".theme-summary a").each(function(i, element) {
            //gather scraped article into a result object.
            let result = {};
            result.title = $(this).find("h2").text().trim();            
            result.link = $(this).attr("href");
            result.summary = $(this).find(".summary").text();
            

            //adds scraped article to database using Article model.
            db.Article
                .findOne({ title: result.title })
                .then(function(match) {
                    if(match) {
                        res.end();
                    } else {
                        db.Article
                            .create(result)
                            .then(function () {
                                res.end();
                            });
                    };
                });
                
        }); 
    }); 
});

app.get("/display", function(req, res) {
    db.Article
        .find({})
        .then(function(articles) {
            res.render("articles", {articles});
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.post("/articles/:id", function(req, res) {
    db.Comment
        .create(req.body)
        .then(function(dbComment) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comments: dbComment._id }}, { new: true });
        })
        .then(function(dbArticle) {
            res.json(dbArticle)
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.get("/comments/:id", function(req, res) {
    // console.log(req.params.id);
    db.Article
        .findOne({ _id: req.params.id })
        .populate("comments")
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.delete("/comments/:id", function(req, res) {
    db.Comment
        .findByIdAndRemove(req.params.id, (err, comment) => {
        const response = {
            message: "Comment successfully deleted",
            id: comment._id
        };
        res.status(200).send(response);
    });
})

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});