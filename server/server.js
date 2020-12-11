require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const routes = require('./routes');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

// Routes global config
app.use(routes);

mongoose.connect(process.env.URL_DB, { useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true }, (err) => {
  if (err) throw err;

  console.log('Database is ONLINE');
});

app.listen(process.env.PORT, () => {
  console.log('Listening port: ', process.env.PORT);
});