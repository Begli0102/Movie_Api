

# Overview

This is an API which provides users with access to information about movies, genres and directors. Users are able to register/un-register, update their user profile, and create a list of their favorite movies.

## Endpoints

### A full list of endpoints are below:
- To get all movies `app.get('/movies')`
- To get one movie `app.get('/movies/:title')`
- To get one according to genre `app.get("/movies/genre/:name)`
- To get one according to director `app.get("/movies/directors/:name")`
- To get all users `app.get('/users')`
- To add a user `app.post('/users')`
- To update a user information `app.put("/users/:username")`
- To get a single user `app.get('/users/:username')`
- To add a movie to favourite `app.put('/users/:username/movies/:movieId')`
- To delete a movie from favourite `app.delete("/users/:username/movies/:movieId")`
- To delete a user `app.delete('/users/:username')`

## Features

- Return a list of ALL movies to the user
- Return data (description, genre, director, image URL) about a single movie by title to the user
- Return data about a genre (description) by name/title (e.g., “Thriller”)
- Return data about a director (bio, birth year, death year) by name
- Allow new users to register
- Allow users to update their user info (username, password, email, date of birth)
- Allow users to add a movie to their list of favorites
- Allow users to remove a movie from their list of favorites
- Allow existing users to deregister

## Core Back-End Technologies

- MongoDB
- Express.js
- Node.js
- Mongoose
- Heroku
- NPM

## Authentication

The app uses JWT (token-based) authentication with the help of passport.js.
