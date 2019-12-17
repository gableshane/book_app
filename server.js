const express = require('express');
const ejs = require('ejs');
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const books = [];

const app =   express();
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

app.set('view engine', 'ejs');

app.get('/', ( req , res) => {
  res.render('pages/index');
});
app.post('/show', ( req , res ) => {
  superagent.get(`https://www.googleapis.com/books/v1/volumes?q=${req.body.searchType}+in${req.body.searchType}:${req.body.query}`).then( data => {
    console.log(data)
    // console.log(data.body.items[0].volumeInfo.imageLinks.smallThumbnail);
    for (let i = 0; i < 10; i++) {
      books.push(data.body.items[i]);
    }
    const results = books.map( book => {
      return new Book(book.volumeInfo.imageLinks.smallThumbnail, book.volumeInfo.title, book.volumeInfo.authors, book.volumeInfo.description);
    });
    res.render('pages/searches/show', { results : results });
  });
})

function Book(img_url='public/styles/images/placeholderbook.png', title='Title', author='Author', description='No description') {
  this.img = img_url;
  this.title = title;
  this.author = author;
  this.description = description;
}

app.listen(PORT, () => {
  console.log('listening on', PORT);
});
