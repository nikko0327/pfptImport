//jshint esversion: 6

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// set so we dont have to type .ejs all the time when routing
app.set("view engine", "ejs");
// used so we can make a public folder that contains stylesheet and js, and be able to access it
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

//entry point of the app
app.get("/", (req, res) => {
  res.render("login");
});

//index page navigation
app.get("/index", (req, res) => {
  res.render("index");
});

//appliance page navigation
app.get("/appliance", (req, res) => {
  res.render("appliances");
});

app.listen(port, () => {
  console.log("Connected to " + port);
});
