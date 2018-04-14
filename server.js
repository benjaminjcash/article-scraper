// Require packages
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models")

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended : true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set Handlebars
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to deployed database if available, otherwise use the local "nytimes" database.
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/nytimes";
// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to MongoDB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Check connection to MongoDB
const database = mongoose.connection;
database.on("error", function(err) {
    console.log("Mongoose Error: " + err);
});
database.once("open", function() {
    console.log("Mongoose connection successful.");
});

//------------------------------------//
//--------------Routes----------------//
//------------------------------------//

app.get("/", function (req, res) {
    res.render("index", {});
});

app.get("/scrape", function(req, res) {
    axios.get("https://www.washingtonpost.com/business/technology/?nid=top_nav_tech&utm_term=.bb32021150b9")
    .then(function(response) {

        const $ = cheerio.load(response.data);
        let results = [];

        // Finds all elements with the class "theme-summary" and locates an anchor tag under that element.
        // For each such tag, gathers targeted data and assembles in "result" object and pushes to "results."
        $(".story-body").each(function(i, element) {
            let result = {};
            result.title = $(this).find("h3").text().trim();            
            result.link = $(this).find("h3").find("a").attr("href");
            result.summary = $(this).find("p").text();
            results.push(result);
        });

        console.log(results);
        
        const promises = results.map(result => {
                            db.Article
                                .create(result)
                                .catch(err => (err))
                        });

        Promise.all(promises).then(function(dbArticles) {
            res.json(dbArticles);
        })      
                        
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

// Initialize server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});