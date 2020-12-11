const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const app = express();

app.post('/login', async (req, res) => {
  const body = req.body;
  try {
    const userDb = await User.findOne({ email: body.email });

    if (!userDb || !bcrypt.compareSync(body.password, userDb.password)) {
      res.status(400).json({
        ok: false,
        err: {
          message: 'User or password incorrect'
        }
      })
    }

    const token = jwt.sign({
      user: userDb
    }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRATION });
  
    res.json({
      ok: true,
      user: userDb,
      token
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      err
    });
  }
});

module.exports = app;