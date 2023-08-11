const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: String,
  genres: [String],
  actors: [String],
  directors: [String],
  rating: Number,
});

module.exports = mongoose.model('Movie', movieSchema);
