const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const { Readable } = require('stream');

const storage = multer.memoryStorage();
const upload = multer({storage: storage})

// Get all movies
router.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find().lean();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/upload', upload.single('csvFile'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const rows = [];
    const csvData = req.file.buffer.toString();
    
    // Create a readable stream from the CSV data buffer
    const stream = Readable.from(csvData);
    
    // Process the CSV data
    stream
      .pipe(csvParser())
      .on('data', (row) => {
        const movieData = {
            title: row.Title,
            genres: row.Genre.split(', '), // Assuming genres are comma-separated
            actors: row.Actors.split(', '), // Assuming actors are comma-separated
            directors: row.Director.split(', '), // Assuming directors are comma-separated
            rating: parseFloat(row.imdbRating),
        };

        rows.push(movieData);
      })
      .on('end', async () => {
        // res.json(rows);
        await Movie.insertMany(rows);
        res.json({ message: 'Data inserted successfully' });
      });
  });

  router.get('/recommend', async (req, res) => {
    try {
      const movies = await Movie.find().lean();
      res.json(movies);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/recommend/:targetMovieTitle', async (req, res) => {
    const targetMovieTitle = req.params.targetMovieTitle;
  
    try {
      const recommendations = await contentBasedFiltering(targetMovieTitle);

      const filteredRecommendations = recommendations.filter(recommendation => recommendation.similarity > 0);

      const sortedFilteredRecommendations = filteredRecommendations.sort((a, b) => (b.similarity * b.rating) - (a.similarity * a.rating));

      res.json({ sortedFilteredRecommendations });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while generating recommendations.' });
    }
  });
  
  // Calculate cosine similarity between two vectors
  function cosineSimilarity(genreVec1, genreVec2, actorVec1, actorVec2, directorVec1, directorVec2) {
    // Convert genre lists to sets for easy intersection and calculation
    // console.log("Vectors:", genreVec1, genreVec2, actorVec1, actorVec2, directorVec1, directorVec2)

    const genreSet1 = new Set(genreVec1);
    const genreSet2 = new Set(genreVec2);
    const actorSet1 = new Set(actorVec1);
    const actorSet2 = new Set(actorVec2);
    const directorSet1 = new Set(directorVec1);
    const directorSet2 = new Set(directorVec2);
    
    const set1 = new Set([...genreSet1, ...actorSet1, ...directorSet1]);
    const set2 = new Set([...genreSet2, ...actorSet2, ...directorSet2]);
    
    // Calculate the intersection of genres
    const intersection = [...set1].filter(data => set2.has(data));
    
    // Calculate dot product (number of common genres)
    const dotProduct = intersection.length;
    
    // Calculate magnitudes
    const magnitude1 = Math.sqrt(genreVec1.length + actorVec1.length + directorVec1.length);
    const magnitude2 = Math.sqrt(genreVec2.length + actorVec2.length + directorVec2.length);
    
    // Handle zero vectors
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }
  
    return dotProduct / (magnitude1 * magnitude2);
  }
  
  // Retrieve movie data from MongoDB
  async function getMovies() {
    return await Movie.find().lean();
  }
  
  // Perform content-based filtering recommendation
  async function contentBasedFiltering(targetMovieTitle) {
    const movies = await getMovies();
    // console.log("Movies:" , movies)
    const targetMovie = movies.find(movie => movie.title === targetMovieTitle);
  
    if (!targetMovie) {
      throw new Error('Movie not found.');
    }
  
    // Calculate cosine similarity between the target movie and other movies
    const recommendations = movies
      .filter(movie => movie.title !== targetMovie.title)
      .map(movie => ({
        title: movie.title,
        similarity: cosineSimilarity(targetMovie.genres, movie.genres, targetMovie.actors, movie.actors, targetMovie.directors, movie.directors),
        rating: movie.rating,
      }));
  
    return recommendations;
  }

module.exports = router;
