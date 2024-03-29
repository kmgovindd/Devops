const mongoose = require('mongoose');

const labRegistrations = new mongoose.Schema({
  registrationid: {
    type: Number,
    required: true,
    unique: true,
  },
  patientid: {
    type: String,
    required: true
  },
  labtypeid: {
    type: Number,
    required: true
  },
  reqstatusid: {
    type: Number,
    required: true
  },
  bookeddate: {
    type: Date,
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  modifiedAt: {
    type: Date,
    default: Date.now
  },
  labRemarks: {
    type: String
  },
  labReports: {
    type: String
  },
  reportBy: {
    type: String
  }
});

module.exports = mongoose.model('LabRegistrations', labRegistrations);