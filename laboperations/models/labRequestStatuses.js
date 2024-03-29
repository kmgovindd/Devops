const mongoose = require('mongoose');

const labRequestStatuses = new mongoose.Schema({  
  reqstatusid: {
    type: Number,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('LabRequestStatuses', labRequestStatuses);