const mongoose = require('mongoose');

const rolesSchema = new mongoose.Schema({
    role: {
      type: String,
      required: true,
      enum: [
        "admin",
        "clerk",
        "doctor",
        "nurse",
        "radiologist",
        "pathologist"
      ],
    },
    permissions: {
      type: [String],
      default: []
    },
});

module.exports = mongoose.model('Role', rolesSchema);