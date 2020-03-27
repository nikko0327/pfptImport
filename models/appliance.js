const mongoose = require('mongoose');

const ApplianceSchema = new mongoose.Schema({
  ip: {
    type: String,
    unique: true,
    required: true
  },
  current: {
    type: String,
    unique: false,
    required: false
  },
  previous: {
    type: String,
    unique: false,
    required: false
  },
  version: {
    type: String,
    unique: false,
    required: false
  },
  updatedDate: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    unique: false,
    required: false
  }
});

mongoose.model('Appliance', ApplianceSchema);
