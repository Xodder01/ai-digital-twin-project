const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 13,
    max: 100
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  user_type: {
    type: String,
    enum: ['Undergraduate', 'Postgraduate', 'Researcher', 'Professional', 'Educator', 'Other'],
    required: true
  },
  password_hash: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  auth_provider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  }
});

module.exports = mongoose.model('User', userSchema);
