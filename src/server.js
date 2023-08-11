const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const config = require("../config")

// Connect to MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('Mongoose connection error:', error);
});

db.once('open', () => {
  console.log('Mongoose connected to movie_rec');
});

// Routes
const moviesRoute = require('./routes/movies');
app.use('/api', moviesRoute);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
