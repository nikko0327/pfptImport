//jshint esversion: 6

const express = require('express');
const bodyParser = require('body-parser');
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);
const app = express();

// set so we dont have to type .ejs all the time when routing
app.set("view engine", "ejs");

// used so we can make a public folder that contains stylesheet and js, and be able to access it
app.use(express.static("public"));

// used to take user inputs to backend
app.use(bodyParser.urlencoded({ extended: true }));

// session to store user state
app.use(session({
  secret: "P@ssw0rd",
  resave: true,
  saveUninitialized: true,
 }));
const port = process.env.PORT || 3000;

//entry point of the app
app.get("/", (req, res) => {
  res.redirect("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

//index page navigation
app.get("/index", isLoggedIn, (req, res) => {
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
  console.log("Serialized.\n" + user.id + "\n" + user.username)
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    console.log("DE-Serialized.")
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
  passport.authenticate('local', { failureRedirect: '/' }),
  function(req, res) {
    console.log("Successfully logged in as " + req.user.username);
    res.redirect('/index');
  });

  app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//check if user is logged in or not.
function isLoggedIn(req, res, next) {
  // do any checks you want to in here

  // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
  // you can do this however you want with whatever variables you set up
  if (req.isAuthenticated())
      return next();

  // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
  res.redirect('/login');
}
