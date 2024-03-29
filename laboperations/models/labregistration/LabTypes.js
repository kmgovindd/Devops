const mongoose = require('mongoose');

const labTypes = new mongoose.Schema({
  labtypeid: {
    type: Number,
    required: true,
    unique: true
  },
  description: {
    type: String,
    minLength: 2,
    required: true,
  },
});

module.exports = mongoose.model('LabTypes', labTypes);