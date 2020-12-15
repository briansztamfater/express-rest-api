const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { verifyGoogleSignInToken } = require('../utils/authUtils');
const User = require('../models/user');
const { json } = require('body-parser');

const app = express();

app.post('/login', async (req, res) => {
  const body = req.body;
  try {
    const userDb = await User.findOne({ email: body.email });

    if (!userDb || !bcrypt.compareSync(body.password, userDb.password)) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'User or password incorrect'
        }
      })
    }

    const token = jwt.sign({
      user: userDb
    }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRATION });
  
    return res.json({
      ok: true,
      user: userDb,
      token
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      err
    });
  }
});

app.post('/google', async (req, res) => {
  const { idtoken } = req.body;
  const googleUser = await verifyGoogleSignInToken(idtoken)
        .catch(err => {
          return res.status(403).json({
            ok: false,
            err
          });
        });

  try {
    let userDb = await User.findOne({ email: googleUser.email });

    if (userDb) {
      if (!userDb.google) {
        return res.status(400).json({
          ok: false,
          err: {
            message: 'Use normal authentication'
          }
        });  
      }
    } else {
      // User doesn't exist in the database, let's create a new one
      const newUser = new User({
        name: googleUser.name,
        email: googleUser.email,
        password: ':)',
        img: googleUser.picture,
        google: true
      });
      userDb = await newUser.save();
    }
    
    const token = jwt.sign({
      user: userDb
    }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRATION });

    return res.json({
      ok: true,
      user: userDb,
      token
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      err
    });
  }
});

module.exports = app;