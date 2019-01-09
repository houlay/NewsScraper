var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var logger = require("morgan");

// Run on dynamic port
var PORT = process.env.PORT || 3000;

var db = require("./models");
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// Initiate express
var app = express();
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Register handlebars as view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Routes
app.get('/', function (req, res) {
    res.render('home');
});

app.get("/scrape", function(req, res) {
    axios.get("https://www.cbc.ca/news/thenational").then(function(response) {
        var $ = cheerio.load(response.data);
        $("a").each(function(i, element) {
            var result = {};
            result.title = $(this)
                .children(".contentWrapper")
                .children(".card-content")
                .children(".card-content-top")
                .children(".headline")
                .text();            
            result.description = $(this)
                .children(".contentWrapper")
                .children(".card-content")
                .children(".card-content-top")
                .children(".description")
                .text();
            if ($(this).attr("href").includes("http")) {
                result.link = $(this)
                .attr("href");
            } else {
                result.link = "https://www.cbc.ca" + $(this)
                .attr("href");
            };
            
            // Do not save duplicate to db
            db.Articles.count({ title: result.title}, function(err, count) {
                if (count > 0) {
                    console.log("Article already exists in database, skipping...")
                } else {
                    db.Articles.create(result)
                    .then(function(dbArticles) {
                        console.log(dbArticles);
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
                }
            });
        });
        res.send("Scrape complete");
    })
});

app.get("/articles", function(req, res) {
    db.Articles.find({})
        .then(function(dbArticles) {
            res.json(dbArticles);
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.get("/articles/:id", function(req, res) {
    db.Articles.findOne({ _id: req.params.id })
        .populate("notes")
        .then(function(dbArticles) {
            res.json(dbArticles);
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.post("/articles/:id", function(req, res) {
    db.Notes.create(req.body)
        .then(function(dbNotes) {
            return db.Articles.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNotes._id } }, { new: true });
        })
        .then(function(dbArticles) {
            res.json(dbArticles);
        })
        .catch(function(err) {
            res.json(err);
        });
});

// Start the server
app.listen(PORT, function(){
    console.log("App running on port " + PORT + "!");
});