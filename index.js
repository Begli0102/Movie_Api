const express = require('express');
const morgan= require('morgan');

const app = express();



let topTenMovies=[
  {
    title:'The Shawshank Redemption',
    director: 'Frank Darabont',
    year:1994
  },

  {
    title:'The Godfather',
    director: 'Francis Ford Coppola',
    year:1972
  },

  {
    title:'The Lord of the Rings: The Return of the King ',
    director: 'Peter Jackson',
    year:2003
  },

  {
    title:'Forrest Gump ',
    director:'Robert Zemeckis',
    year:1994
  },

  {
    title:'The Matrix ',
    director:'Lana Wachowski, Lilly Wachowski',
    year:1999
  },

  {
    title:'The Green Mile',
    director:'Frank Darabont',
    year:1999
  },

  {
    title:'The Pianist ',
    director:'Roman Polanski',
    year:2002
  },

  {
    title:'Gladiator',
    director:'Ridley Scott',
    year:2000
  },

  {
    title:'Joker',
    director:'Todd Phillips',
    year:2019
  },

  {
    title:'Finding Nemo',
    director:'Andrew Stanton, Lee Unkrich',
    year:2003
  },
]
app.use(morgan('common'));


app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('<h1>Welcome to the world of movies!</h1>');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});


app.get('/movies', (req, res) => {
  res.json(topTenMovies);
});


app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
