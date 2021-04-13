const express = require('express');
const morgan= require('morgan');
const bodyParser=require('body-parser');


const mongoose = require("mongoose");
const Models = require('./models.js');

const Movies= Models.Movie;
const Users = Models.User;


mongoose.connect('mongodb://localhost:27017/myFlixDB',
{ useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));


app.get('/',(req, res)=>{
  res.send('Welcome to MyFlix!');
});

//Returnig all movies
app.get('/movies', (req, res) => {
  Movies.find().then((movies)=>{
    res.status(200).json(movies);
  }).catch((err)=>{
    console.error(err);
    res.status(500).send('Error: + err');
  });
});

//  return movies according to title

app.get('/movies/:title', (req, res) => {
  Movies.findOne({Title :req.params.title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//  return movies according to genre

app.get("/movies/genre/:name", (req, res) => {

    Movies.findOne({"Genre.Name" :req.params.name}).then((genreName) =>
    {
        res.status(200).json(genreName.Genre)
    })
    .catch((error) =>{
      console.log(error);
        res.status(500).send("Error 500: " + error)
    })
});

//  return movies according to director
app.get("/movies/directors/:name", (req, res) => {
    let director = req.params.name;
    Movies.findOne({"Director.Name" : director}).then((directorName) =>
    {
        res.status(200).json(directorName.Director)
    }).catch((error) =>
    {
        console.log(error);
        res.status(500).send("Error 500: " + error)
    })
});

//returning all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// Adding a new user
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//Updating user's data

app.put('/users/:username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.username }, { $set:
    {
      Username: req.body.username,
      Password: req.body.password,
      Email: req.body.email,
      Birthday: req.body.birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});
//Adding user a favourite movie
app.post('/users/:username/movies/:movieId', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.username }, {
     $addToSet: { FavoriteMovies: req.params.movieId }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Deleting username's favourite movie

app.delete("/users/:username/movies/:movieId", (req, res) => {
    Users.findOneAndRemove({Username: req.params.username},
    { $pull:
        {
        FavoriteMovies : req.params.movieId
        }
}).then((user) =>
    {
        if (!user)
        {
            res.status(400).send(req.params.movieId+ ' was not found');
        } else
        {
            res.status(200).send(req.params.movieId + ' was deleted.');
        }
    }).catch((error) =>
    {
        console.log(error);
        res.status(500).send("Error: " + error)
    })
})

// Deleting a username
app.delete('/users/:username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + ' was not found');
      } else {
        res.status(200).send(req.params.username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
