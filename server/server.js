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

mongoose.connect(process.env.URL_DB, { useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true }, (err) => {
  if (err) throw err;

  console.log('Database is ONLINE');
});

app.listen(process.env.PORT, () => {
  console.log('Listening port: ', process.env.PORT);
});