const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const User = require('../models/user');
const { verifyToken, verifyAdminRole } = require('../middlewares/authentication');

const app = express();

app.get('/user', verifyToken, async (req, res) => {
  let from = req.query.from || 0;
  from = Number(from);

  let limit = req.query.limit || 5;
  limit = Number(limit);

  try {
    const conditions = { status: true };
    const users = await User.find(conditions, 'name email role status google').skip(from).limit(limit).exec();
    const count = await User.countDocuments(conditions);
    return res.json({
      ok: true,
      users,
      count
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      err
    });
  }
});

app.post('/user', [verifyToken, verifyAdminRole], async (req, res) => {
  const body = req.body;
  const user = new User({
    name: body.name,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role
  });

  try {
    const userDB = await user.save();
    return res.json({
      ok: true,
      user: userDB
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      err
    });
  }
});

app.put('/user/:id', [verifyToken, verifyAdminRole], async (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, [ 'name', 'email', 'img', 'role' ]);
  
  try {
    const userDB = await User.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' });
    return res.json({
      ok: true,
      user: userDB
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      err
    });
  }
});

app.delete('/user/:id', [verifyToken, verifyAdminRole], async (req, res, next) => {
  const id = req.params.id;

  try {
    const conditions = { _id: id, status: true };
    const userChanges = { status: false };
    const deletedUser = await User.findOneAndUpdate(conditions, userChanges, { new: true });

    if (!deletedUser) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'User not found'
        }
      });  
    }

    return res.json({
      ok: true,
      user: deletedUser
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      err
    });
  }
});

module.exports = app;