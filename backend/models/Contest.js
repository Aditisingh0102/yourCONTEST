const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Mock', 'Assessment'],
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Live', 'Upcoming', 'Ended'],
    default: 'Upcoming'
  },
  participants: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contest', ContestSchema);
