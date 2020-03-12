//jshint esversion: 6

const express = require('express');
const app = express();
app.set('view engine', 'ejs');

const port = 3000;

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(port, () => {
  console.log("Connected to " + port);
});
