require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const routes = require('./routes');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

// Routes global config
app.use(routes);

// Public global config
app.use(express.static(path.resolve(__dirname, '../public')));

mongoose.connect(process.env.URL_DB, { useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false }, (err) => {
  if (err) throw err;

  console.log('Database is ONLINE');
});

app.listen(process.env.PORT, () => {
  console.log('Listening port: ', process.env.PORT);
});