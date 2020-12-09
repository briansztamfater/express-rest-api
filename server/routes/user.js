const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const User = require('../models/user');

const app = express();

app.get('/user', (req, res) => {
  res.json('get user');
});

app.post('/user', async (req, res) => {
  const body = req.body;
  const user = new User({
    name: body.name,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role
  });

  try {
    const userDB = await user.save();
    res.json({
      ok: true,
      user: userDB
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      err
    });
  }
});

app.put('/user/:id', async (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, [ 'name', 'email', 'img', 'role' ]);
  
  try {
    const userDB = await User.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    res.json({
      ok: true,
      userDB
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      err
    });
  }
});

app.delete('/user', (req, res) => {
  res.json('delete user');
});

module.exports = app;