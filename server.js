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

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/nytimes");

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
                .create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, send it to the client
                    res.json(err);
                });
        }); 
        res.send("articles scraped successfuly"); 
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
            console.log(dbComment);
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
        })
        .then(function(dbArticle) {
            res.json(dbArticle)
        }).catch(function(err) {
            res.json(err);
        });
});

app.get("/comments/:id", function(req, res) {
    db.Article
        .findOne({ _id: req.params.id })
        .populate("comment")
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});