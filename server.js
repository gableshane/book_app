const express = require('express');
const ejs = require('ejs');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();


let books = [];
const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3000;

// INIT SQL
const client = new pg.Client(`${DATABASE_URL}`);
client.on('error', error => console.error(error));
client.connect();

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

app.get('/', ( req , res) => {
  let SQL = 'SELECT * FROM books';
  const booksData = [];
  client.query(SQL).then( sqlData => {
    console.log(sqlData.rows);
    if (sqlData.rows.length > 0) {
      sqlData.rows.forEach( val => {
        booksData.push(new Book(val.image_url, val.title, val.author, val.description));
      });
    }
  });
  res.render('pages/index', { booksData : booksData});
});
app.post('/show', ( req , res ) => {
  superagent.get(`https://www.googleapis.com/books/v1/volumes?q=${req.body.searchType}+in${req.body.searchType}:${req.body.query}`).then( data => {
    books = [];
    for (let i = 0; i < 10; i++) {
      books.push(data.body.items[i]);
    }
    const results = books.map( book => {
      return new Book(book.volumeInfo.imageLinks.smallThumbnail, book.volumeInfo.title, book.volumeInfo.authors, book.volumeInfo.description);
    });
    res.render('pages/searches/show', { results : results });
  })
    .catch( error => {
      console.log(error);
      res.render('pages/error');
      res.status(500).send(error.message);
    })
})

function Book(img_url='public/styles/images/placeholderbook.png', title='Title', author='Unknown', description='No description') {
  this.img_url = img_url;
  this.title = title;
  this.author = author;
  this.description = description;
}

app.listen(PORT, () => {
  console.log('listening on', PORT);
});
