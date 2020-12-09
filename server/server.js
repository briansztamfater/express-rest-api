require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

app.use(require('./routes/user'));

mongoose.connect('mongodb://localhost:27017/cafe', { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if (err) throw err;

  console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => {
  console.log('Listening port: ', process.env.PORT);
});