const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    minLength: 6,
    required: true,
  },
  role: {
    type: String,
    enum: [
      "admin",
      "clerk",
      "doctor",
      "nurse",
      "radiologist"
    ],
    default: "doctor",
  },
  isDisabled: {
    type: Boolean
  }
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  const hash = await bcrypt.hash(user.password, 8);
  user.password = hash;
  next();
});

userSchema.methods.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);