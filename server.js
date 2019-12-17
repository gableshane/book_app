const express = require('express');
const ejs = require('ejs');
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;

const app =   express();
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

app.set('view engine', 'ejs');

app.get('/', ( req , res) => {
  res.render('pages/index');
});
app.post('/results', ( req , res ) => {
  console.log(req.body);
})

app.listen(PORT, () => {
  console.log('listening on', PORT);
});

