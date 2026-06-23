const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    default: 'Important'
  },
  author: {
    type: String,
    default: 'Faculty'
  },
  iconName: String,
  color: String,
  bg: String,
  borderColor: String
});

module.exports = mongoose.model('Notice', NoticeSchema);
