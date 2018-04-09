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

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/nytimes");

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
        res.end();
    });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
})

