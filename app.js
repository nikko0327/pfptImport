//jshint esversion: 6

const express = require('express');
const app = express();


// set so we dont have to type .ejs all the time when routing
app.set("view engine", "ejs");
// used so we can make a public folder that contains stylesheet and js, and be able to access it
app.use(express.static("public"));

const port = 3000;

app.get("/", (req, res) => {
  res.render("appliances");
});

app.listen(port, () => {
  console.log("Connected to " + port);
});
