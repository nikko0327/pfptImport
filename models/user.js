const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const UserDetail = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = new mongoose.model('UserDetails', UserDetail);
module.exports = UserDetails;
