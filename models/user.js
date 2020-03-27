const mongoose = require('mongoose');

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


mongoose.model('UserDetails', UserDetail);
