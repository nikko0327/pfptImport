//jshint esversion: 6

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const LocalStrategy = require('passport-local').Strategy;
const Appliance = require("./models/appliance");
const User = require("./models/user");
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

//TEST User
// User.create({
//    username: "nlee",
//    password: "P@ssw0rd"
// }, function(err, cat){
//     if(err){
//         console.log(err);
//     } else {
//         console.log(cat);
//     }
// });

//TEST Appliance
// Appliance.create({
//    ip: "10.104.91.123",
//    current: "WORLEY3",
//    previous: "JACOBS",
//    version: "3.5.130",
//    updatedDate: Date.now(),
//    updatedBy: "nikkolee",
//    datacenter: "MARK"
// },
//  function(err, cat){
//     if(err){
//         console.log(err);
//     } else {
//         console.log(cat);
//     }
// });


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
  User.findById(id, function(err, user) {
    // console.log("DE-Serialized.")
    // console.log("Check ID: " + user.username);
    cb(err, user);
  });
});

/* PASSPORT LOCAL AUTHENTICATION */

passport.use(new LocalStrategy(
  function(username, password, done) {
      User.findOne({
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
app.get("/appliance", isLoggedIn, (req, res) => {
  Appliance.find({}, function(err, appliances){
    if(err){
        console.log(err);
    } else {
        res.render("appliances", {appliances: appliances});
    }
  })
});

app.listen(port, () => {
  console.log("Connected to " + port);
});

// create new appliances
app.post("/appliance/new", (req, res) => {
  Appliance.create(req.body)
    .then(result => {
      console.log(result)
    })
    .catch(error => console.error(error))
  console.log(req.body);
  res.redirect("/appliance");
});

// delete appliance
app.delete("/appliance/:id", isLoggedIn, (req, res) => {
  Appliance.deleteOne({
    _id: {
      $id: req.params.id
    }
  }, (err) => {
    if(err) {
        req.flash('error', err.message);
        res.redirect('/appliance');
    } else {
        Appliance.deleteOne( (err) => {
          if(err) {
              req.flash('error', err.message);
              return res.redirect('/appliance');
          }
          req.flash('error', 'Appliance deleted!');
          res.redirect('/appliance');
        });
    }
  })
});

// edit route for the appliance Modal
// app.get("/appliance/:id/edit", (req, res) => {
//   console.log("EDIT ROUTE INVOKED: " + res)
//   res.json({});
// });

//edit post route
app.put('/name/:id/edit', (req, res, next) => {
    // let id = {
    //   _id: ObjectID(req.params.id)
    // };
    //
    // dbase.collection("name").update({_id: id}, {$set:{'first_name': req.body.first_name, 'last_name': req.body.last_name}}, (err, result) => {
    //   if(err) {
    //     throw err;
    //   }
    //   res.send('user updated sucessfully');
    // });
    console.log("EDIT INVOKED")
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
  console.log("Authenticated user: " + req.isAuthenticated());
  if (req.isAuthenticated()){
      return next();
  }
  // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
  res.redirect('/login');
}
