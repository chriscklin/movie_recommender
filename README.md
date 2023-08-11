# Movie Recommendation API

This is a Node.js API for a movie recommendation system. It provides endpoints to retrieve movie information, get recommendations based on a movie name, and upload movie data via a CSV file.

## Getting Started

To get started with the API, make sure you have Node.js and MongoDB installed on your system.

1. Clone this repository:
   
git clone https://github.com/chriscklin/movie_recommender

cd movie_recommender/

2. Install the dependencies:

npm install

3. Create a MongoDB Atlas cluster and obtain your connection URI.
4. Run the server

## Endpoints

### GET /api/movies

Retrieves a list of all movies available in the database.

Example request:

GET /api/movies


Example response:
```json
[
  {
    "title": "The Shawshank Redemption",
    "genres": ["Drama"],
    "actors": ["Tim Robbins", "Morgan Freeman"],
    "directors": ["Frank Darabont"],
    "rating": 9.3
  },
  // ...
]
```

### GET /api/recommend/:movieName

Retrieves a list of recommended movies based on a given movie name.

Example request:

GET /api/recommend/The%20Shawshank%20Redemption

Example response:
```json
[
  {
    "title": "The Godfather",
    "genres": ["Crime", "Drama"],
    "actors": ["Marlon Brando", "Al Pacino"],
    "directors": ["Francis Ford Coppola"],
    "rating": 9.2
  },
  // ...
]
```

### POST /api/upload

Uploads movie data from a CSV file and adds it to the database.

Example request (using cURL):

curl -X POST -F "csvFile=@path/to/movies.csv" http://localhost:3000/api/upload

Example response:
```json
{
  "message": "Data inserted successfully"
}
```
Make sure to replace path/to/movies.csv with the actual path to your CSV file.
