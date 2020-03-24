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


/*  PASSPORT SETUP  */

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

app.get('/success', (req, res) => res.send("Welcome "+req.query.username+"!!"));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
});

/* MONGOOSE SETUP */

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ImportCenter', { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;
const UserDetail = new Schema({
      username: String,
      password: String
    });
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

/* PASSPORT LOCAL AUTHENTICATION */

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
      UserDetails.findOne({
        username: username
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        if (user.password != password) {
          return done(null, false);
        }
        return done(null, user);
      });
  }
));

app.post('/',
  passport.authenticate('local', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/success?username='+req.user.username);
  });
