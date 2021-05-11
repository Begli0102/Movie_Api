const express = require('express');
const morgan= require('morgan');
const bodyParser=require('body-parser');
const passport=require('passport');
require('./passport');
const cors=require('cors');
const { check, validationResult } = require('express-validator');
 require('dotenv').config();

console.log(process.env);

const mongoose = require("mongoose");
const Models = require('./models.js');


const Movies= Models.Movie;
const Users = Models.User;

 mongoose.connect(process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));
let auth = require('./auth')(app);
let allowedOrigins = ['http://localhost:8080','http://localhost:1234', 'http://testsite.com'];

 app.use(cors({origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}
));


app.get('/', (req, res) => {
  res.sendFile('/public/documentation.html');
});

//Returnig all movies
app.get('/movies',passport.authenticate('jwt', { session: false }),(req, res) => {

  Movies.find().then((movies)=>{
    console.log(movies);
    res.status(200).json(movies);
  }).catch((err)=>{
    console.error(err);
    res.status(500).send('Error: + err');

  });
});

//  return movies according to title

app.get('/movies/:title',passport.authenticate('jwt',{session:false}), (req, res) => {
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

app.get("/movies/genre/:name",passport.authenticate('jwt',{session:false}), (req, res) => {

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
app.get("/movies/directors/:name",passport.authenticate('jwt',{session:false}),(req, res) => {
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
app.get('/users',passport.authenticate('jwt',{session:false}), (req, res) => {
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
app.post('/users',
[
 check('Username', 'Username must be at least 5 characters').isLength({min: 5}),
 check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
 check('Password', 'Password is required').not().isEmpty(),
 check('Email', 'Email does not appear to be valid').isEmail(),
 check("Birthday", 'Birthday doesn\'t appear to be valid').isDate({format: "YYYY-MM-DD"})
], (req, res) => {

// check the validation object for errors
 let errors = validationResult(req);

 if (!errors.isEmpty()) {
   return res.status(422).json({ errors: errors.array() });
 }

 let hashedPassword = Users.hashPassword(req.body.Password);
 Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
   .then((user) => {
     if (user) {
       //If the user is found, send a response that it already exists
       return res.status(400).send(req.body.Username + ' already exists');
     } else {
       Users
         .create({
           Username: req.body.Username,
           Password: hashedPassword,
           Email: req.body.Email,
           Birthday: req.body.Birthday
         })
         .then((user) => { res.status(201).json(user) })
         .catch((error) => {
           console.error(error);
           res.status(500).send('Error: ' + error);
         });
     }
   })
   .catch((error) => {
     console.error(error);
     res.status(500).send('Error: ' + error);
   });
});

//Updating user's data

app.put("/users/:username",
[check('Username', 'Username is required').isLength({min: 5}),
 check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
 check('Password', 'Password is required').not().isEmpty(),
 check('Email', 'Email does not appear to be valid').isEmail(),
 check("Birthday", 'Birthday doesn\'t appear to be valid').isDate({format: "YYYY-MM-DD"})
],(req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
        {
            Username : req.params.username
        },
        {
            $set:
            {
                Name: req.body.Name,
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }
        },
        {
            new: true
        }
    ).then((updatedUser) =>
    {
        res.json(updatedUser)
    }).catch((err) =>
    {
        console.log(err);
        res.status(500).send("Error: " + err)
    })
});


//Adding user a favourite movie
app.post('/users/:username/movies/:movieId',passport.authenticate('jwt',{session:false}), (req, res) => {
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

app.delete("/users/:username/movies/:movieId",passport.authenticate('jwt',{session:false}), (req, res) => {
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
app.delete('/users/:username',passport.authenticate('jwt',{session:false}), (req, res) => {
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
