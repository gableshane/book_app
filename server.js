// DEPENDENCIES
const express = require('express');
const ejs = require('ejs');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();
const app = express();
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

// GLOBAL VARIABLES
let books = [];
const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3000;

// INIT SQL
const client = new pg.Client(`${DATABASE_URL}`);
client.on('error', error => console.error(error));
client.connect();


app.get('/', ( req , res) => {
  let SQL = 'SELECT * FROM books';
  const booksData = [];
  client.query(SQL).then( sqlData => {
    if (sqlData.rows.length > 0) {
      sqlData.rows.forEach( val => {
        booksData.push(new Book(val.id, val.image_url, val.title, val.author, val.description, val.isbn, val.bookshelf));
      });
    }
    res.render('pages/index', { booksData : booksData, count : sqlData.rows.length });
  });
});

app.post('/search', ( req , res ) => {
  superagent.get(`https://www.googleapis.com/books/v1/volumes?q=${req.body.searchType}+in${req.body.searchType}:${req.body.query}`).then( data => {
    books = [];
    for (let i = 0; i < 10; i++) {
      books.push(data.body.items[i]);
    }
    const results = books.map( book => {
      let isbn = Object.values(book.volumeInfo.industryIdentifiers[0]).reduce( (a , b ) => a + ' ' + b);
      return new Book(null, book.volumeInfo.imageLinks.smallThumbnail, book.volumeInfo.title, book.volumeInfo.authors, book.volumeInfo.description, isbn);
    });
    res.render('pages/searches/search', { results : results });
  })
    .catch( error => {
      console.log(error);
      res.render('pages/error');
      res.status(500).send(error.message);
    })
})

app.get('/books/:id', ( req, res ) => {
  let query = [req.params.id];
  let SQL = 'SELECT * FROM books WHERE id=$1'
  client.query(SQL, query).then( sql => {
    let obj = sql.rows[0];
    res.render('pages/detail', { oneBook : obj })
  })
});

app.post('/books', (req , res ) => {
  let SQL = 'INSERT INTO books ( author, title, isbn, image_url, description, bookshelf) VALUES ($1, $2, $3, $4, $5, $6)'
  let data = [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.description, req.body.bookshelf]
  client.query(SQL, data).then( sql => {
    client.query('SELECT * FROM books WHERE title=$1 LIMIT 1',[data[1]]).then( book => {
      res.redirect(`/books/${book.rows[0].id}`);
    });
  })
});

// BOOK CONSTRUCTOR FUNCTION
function Book( id=null, img_url='public/styles/images/placeholderbook.png', title='Title', author='Unknown', description='No description', isbn=null,bookshelf=null) {
  this.id = id;
  this.img_url = img_url;
  this.title = title;
  this.author = author;
  this.description = description;
  this.isbn = isbn;
  this.bookshelf = bookshelf;
}


// SERVER LISTENS
app.listen(PORT, () => {
  console.log('listening on', PORT);
});
