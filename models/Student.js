const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  cgpa: Number,
  branch: String,
  backlogs: Number,
  status: {
    type: String,
    default: "Applied"
  }
});

module.exports = mongoose.model('Student', studentSchema);