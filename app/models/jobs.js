var mongoose = require('mongoose');

var jobSchema = mongoose.Schema({
  title: String,
  date: Date,
  location: String,
  wage: Number,
  description: String,
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Job', jobSchema);
