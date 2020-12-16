const express = require('express');
const _ = require('lodash');

let { verifyToken } = require('../middlewares/authentication');

let app = express();

let Category = require('../models/category');

app.get('/category', verifyToken, async (req, res) => {
  try {
    const categories = await Category.find().populate('user').exec();
    const count = await Category.countDocuments();
    return res.json({
      ok: true,
      categories,
      count
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      err
    });
  }
});

app.get('/category/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    const category = await Category.findById(id).populate('user').exec();
    return res.json({
      ok: true,
      category,
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      err
    });
  }
});

app.post('/category', verifyToken, async (req, res) => {
  const { body, user } = req;
  const { description } = body;
  try {
    const category = new Category({
      description,
      user
    });
    const categoryDb = await category.save({ new: true });
    await Category.populate(categoryDb, { path: 'user' });
    return res.json({
      ok: true,
      category: categoryDb,
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      err
    });
  }
});

app.put('/category/:id', verifyToken, async (req, res) => {
  const { user, params } = req;
  const id = params.id;
  const body = _.pick(req.body, [ 'description' ]);
  
  try {
    if (user.role !== 'ADMIN_ROLE') {
      return res.status(401).json({
        ok: false,
        err: {
          message: 'Unauthorized'
        }
      });  
    }

    const updatedCategoryDB = await Category.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' });

    if (updatedCategoryDB) {
      await Category.populate(updatedCategoryDB, { path: 'user' });
      return res.json({
        ok: true,
        category: updatedCategoryDB
      });  
    } else {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Category not found'
        }
      });
    }
  } catch (err) {
    return res.status(400).json({
      ok: false,
      err
    });
  }
});

app.delete('/category/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  const { user } = req;
  try {
    if (user.role !== 'ADMIN_ROLE') {
      return res.status(401).json({
        ok: false,
        err: {
          message: 'Unauthorized'
        }
      });  
    }
  
    const deletedCategoryDb = await Category.findByIdAndDelete(id);

    if (deletedCategoryDb) {
      await Category.populate(deletedCategoryDb, { path: 'user' });
      return res.json({
        ok: true,
        category: deletedCategoryDb
      });  
    } else {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Category not found'
        }
      });
    }
  } catch (err) {
    return res.status(400).json({
      ok: false,
      err
    });
  }
});

module.exports = app;