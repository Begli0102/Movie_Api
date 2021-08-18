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


 app.use(cors());

 require('./auth')(app);

 
app.get('/', (req, res) => {
  res.sendFile('/public/documentation.html');
});

/**
 * This method makes a call to the movies endpoint,
 * authenticates the user using passport and jwt
 * and returns an array of movies objects.
 * @method getMovies
 * @param {string} moviesEndpoint - https://myflix01025.herokuapp.com/movies
 * @param {func} passportAuthentication - Authenticates JavaScript Web Token using the passport node package.
 * @param {func} callback - Uses Movies schema to find list of movies.
 * @returns {Array} - Returns array of movie objects.
 */
app.get('/movies',passport.authenticate('jwt', { session: false }),(req, res) => {

  Movies.find().then((movies)=>{
    console.log(movies);
    res.status(200).json(movies);
  }).catch((err)=>{
    console.error(err);
    res.status(500).send('Error: + err');

  });
});

/**
 * This method makes a call to the movie title endpoint,
 * authenticates the user using passport and jwt
 * and returns a single movies object.
 * @method getMovieByTitle
 * @param {string} movieEndpoint - https://myflix01025.herokuapp.com/movies:title
 * @param {func} passportAuthentication - Authenticates JavaScript Web Token using the passport node package.
 * @param {func} callback - Uses Movies schema to find one movie by title.
 * @returns {Object} - Returns single movie object.
 */

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

/**
 * This method makes a call to the movie genre name endpoint,
 * authenticates the user using passport and jwt
 * and returns a genre object.
 * @method getGenreByName
 * @param {string} genreEndpoint - https://myflix01025.herokuapp.com/movies/genres/:name
 * @param {func} passportAuthentication - Authenticates JavaScript Web Token using the passport node package.
 * @param {func} callback - Uses Movies schema to find genre by name.
 * @returns {Object} - Returns genre info object.
 */
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



 /**This method makes a call to the movie director name endpoint,
* authenticates the user using passport and jwt
* and returns a director object.
* @method getDirectorByName
* @param {string} directorEndpoint - https://myflix01025.herokuapp.com/movies/directors/:name
* @param {func} passportAuthentication - Authenticates JavaScript Web Token using the passport node package.
* @param {func} callback - Uses Movies schema to find director by name.
* @returns {Object} - Returns director info object.
*/
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


/**
* This method makes a call to the users endpoint,
* validates the object sent through the request
* and creates a user object.
* @method getUser
* @param {string} usersEndpoint - https://myflix01025.herokuapp.com/users
* @param {Array} expressValidator - Validate form input using the express-validator package.
* @param {func} callback - Uses Users schema to register user.
 */
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


/**
* This method makes a call to the users endpoint,
* validates the object sent through the request
* and creates a user object.
* @method addUser
* @param {string} usersEndpoint - https://myflix01025.herokuapp.com/users
* @param {Array} expressValidator - Validate form input using the express-validator package.
* @param {func} callback - Uses Users schema to register user.
 */
app.post('/users',
[
 check('Username', 'Username must be at least 5 characters').isLength({min: 6}),
 check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
 check('Password', 'Password is required').not().isEmpty(),
 check('Email', 'Email does not appear to be valid').isEmail(),
check("Birthday", 'Birthday doesn\'t appear to be valid').isDate({format:"YYYY-MM-DD"})
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

/**
* Update a user's info, by username.
* @method updateUser
* @param {string} userNameEndpoint - https://myflix01025.herokuapp.com/users/:username
* @param {Array} expressValidator - Validate form input using the express-validator package.
* @param {func} callback - Uses Users schema to update user's info by username.
 */

app.put("/users/:username",
[check('Username', 'Username is required').isLength({min: 6}),
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

/**
* This method makes a call to the users endpoint,
* validates the object sent through the request
* and creates a user object.
* @method getUser
* @param {string} usersEndpoint - https://myflix01025.herokuapp.com/users/:username
* @param {Array} expressValidator - Validate form input using the express-validator package.
* @param {func} callback - Uses Users schema to register user.
 */
app.get('/users/:username', passport.authenticate('jwt',{session:false}), (req, res) => {
  Users.findOne({ Username: req.params.username })
   .then((user) => {
     res.json(user);
   })
   .catch((err) => {
     console.error(err);
     res.status(500).send('Error: ' + err);
   });
});


/**
* This method makes a call to the user's movies endpoint,
* and pushes the movieID in the FavoriteMovies array.
* @method addToFavorites
* @param {string} userNameMoviesEndpoint - https://myflix01025.herokuapp.com/users/:username/movies/:movieID
* @param {Array} expressValidator - Validate form input using the express-validator package.
* @param {func} callback - Uses Users schema to add movieID to list of favorite movies.
 */
app.put('/users/:username/movies/:movieId', passport.authenticate('jwt', {session: false}), ( req, res ) =>{ 
  Users.findOneAndUpdate({ Username: req.params.username }, {
     $addToSet: { FavoriteMovies: req.params.movieId }
   },
    { new: true }) // This line makes sure that the updated document is returned
    .then( updatedUser => {
      if( !updatedUser ) return res.status(400).send({'message': 'Could not find user...'})
      res.status(200).json(updatedUser)
    }).catch( err => {
      res.status(500).send(`Error: ${ err.stack }`)
    })
});

/**
  * This method makes a call to the user's movies endpoint,
  * and deletes the movieID from the FavoriteMovies array.
  * @method removeFromFavorites
  * @param {string} userNameMoviesEndpoint - https://myflix01025.herokuapp.com/users/:username/movies/:movieID
  * @param {Array} expressValidator - Validate form input using the express-validator package.
  * @param {func} callback - Uses Users schema to remove movieID from list of favorite movies.
   */

app.delete("/users/:username/movies/:movieId",passport.authenticate('jwt',{session:false}), (req, res) => {
    Users.findOneAndUpdate({Username: req.params.username},
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

/**
 * DELETE request to delete a user (by username)
 */
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
