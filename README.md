# Movie API

## Overview

The Movie API serves as a backend for an application that allows users with access to information about movies, genres and directors. Users are able to register/un-register, update their user profile, and create a list of their favorite movies. All of these are saved in the database. This RESTful API is built with Node.js, Express.js and a MongoDB database.This is an API which provides users.

## Api Documentation
[Fill free to check the endpoints](http://myflix01025.herokuapp.com/documentation.html)

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

## Built with

The API is built with a REST architecture. The business logic is modeled with Mongoose. It meets basic data security regulations and uses JWT-based authentication.

- [MongoDB](https://docs.mongodb.com/)
- [Express.js](http://expressjs.com/)
- [Node.js](https://nodejs.org/en/docs/)
- [Mongoose](https://mongoosejs.com/docs/)
- [Heroku](https://devcenter.heroku.com/categories/reference)
- [NPM](https://docs.npmjs.com/)

## Authentication

The app uses JWT (token-based) authentication with the help of passport.js.
