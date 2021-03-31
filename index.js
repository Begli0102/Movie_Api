const express = require('express');
const morgan= require('morgan');
const bodyParser=require('body-parser');
const uuid=require('uuid');
const app = express();

app.use(bodyParser.json());

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



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// GET method

app.get('/topTenMovies', (req, res, next) => {
  res.json(topTenMovies);
});


app.get('/topTenMovies/:title', (req, res) => {
    res.json(req.params.title)

  });

  app.get('/topTenMovies/:director', (req, res) => {
      res.json(req.params.director)
    });

    app.get('/topTenMovies/:year', (req, res) => {
        res.send(req.params.year)
      });

// POST mehod
app.post('/users',(req, res)=>{
  res.send('The user has been added successfully');
})

app.post('/topTenMovies',(req, res)=>{
  res.send('The favourite movie has been added successfully');
})

// PUT method

app.put('/users',(req,res)=>{
  res.send('The user has been updated successfully');
})

//Delete method
app.delete('/topTenMovies',(req,res)=>{
  res.send('The movie has been deleted');
})

app.delete('/users',(req,res)=>{
  res.send('The user has been deleted');
})


app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
