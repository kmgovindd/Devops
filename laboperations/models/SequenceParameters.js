const mongoose = require('mongoose');

const sequenceParameters = new mongoose.Schema({  
  parameter: {
    type: String,
    required: true,
    unique: true
  },
  sequence: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('sequenceParameters', sequenceParameters);