//jshint esversion: 6

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const LocalStrategy = require('passport-local').Strategy;
const app = express();
const flash = require('connect-flash');
app.use(flash());

// set so we dont have to type .ejs all the time when routing
app.set("view engine", "ejs");

// used so we can make a public folder that contains stylesheet and js, and be able to access it
app.use(express.static("public"));

// used to take user inputs to backend
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

/* MONGOOSE SETUP */
mongoose.connect('mongodb://localhost/ImportCenter', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const db = mongoose.connection;

//using sessions for tracking logins
app.use(session({
    secret: "work hard",
    resave: false,
    saveUninitialized: false,
    cookie: {
        //maxAge: 30 * 24 * 60 * 60 * 1000 // 1 month
    },
    store: new MongoStore({
        mongooseConnection: db
    })
}));

//We enebled the Listener
db.on('error', () => {
    console.error('Error occured in db connection');
});

db.on('open', () => {
    console.log('DB Connection established successfully');
});

const Schema = mongoose.Schema;
const UserDetail = new Schema({
      username: String,
      password: String
    });
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');


/*  PASSPORT SETUP  */
app.use(passport.initialize());
app.use(passport.session());
const passportLocalMongoose = require("passport-local-mongoose")

app.get('/success', (req, res) => res.send("Welcome "+req.query.username+"!!"));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  console.log("Serialized.\n" + "UID: " + user.id + "\n" + "Username: " + user.username)
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  UserDetails.findById(id, function(err, user) {
    console.log("DE-Serialized.")
    console.log("Check ID: " + user.username);
    cb(err, user);
  });
});

/* PASSPORT LOCAL AUTHENTICATION */

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
      console.log("AUTH")
  }
));

//entry point of the app
app.get("/", (req, res) => {
  res.redirect("index");
});

//login route
app.get("/login", (req, res) => {
  res.render("login", { fail: false });
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


app.post('/',
  passport.authenticate('local', { failureRedirect: '/' }),
  function(req, res) {
    console.log("Successfully logged in as " + req.user.username);
    res.redirect('/index');
  });

  app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
  console.log("Logged out")
});

//submit login
app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/index',
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: 'Welcome to ImportCenter!'})
);

//check if user is logged in or not.
function isLoggedIn(req, res, next) {
  // do any checks you want to in here
  // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
  // you can do this however you want with whatever variables you set up
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()){
      return next();
  }
  // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
  res.redirect('/login');
}
