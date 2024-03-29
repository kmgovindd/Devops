const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true },
  name: { type: String },
  email: { type: String },
  address: { type: String },
  phoneNumber: { type: Number },
  dob: { type: Date },
  gender: { type: String },
  //Personal Medical History Info
  medicalHistory: {
    allergies: [
      {
        type: String,
        default: "none",
      },
    ],
    knownIllness: [
      {
        type: String,
        default: "none",
      },
    ],
  },
});

const patient = mongoose.model("patient", patientSchema);

module.exports = patient;