const express = require('express');
const _ = require('lodash');

let { verifyToken } = require('../middlewares/authentication');

let app = express();

let Product = require('../models/product');

app.get('/product', verifyToken, async (req, res) => {
  let from = req.query.from || 0;
  from = Number(from);

  let limit = req.query.limit || 5;
  limit = Number(limit);

  try {
    const products = await Product.find({ available: true }).skip(from).limit(limit).collation({ locale: "en" }).sort('name').populate('category', 'description').populate('user', 'name email').exec();
    const count = await Product.countDocuments({ available: true });
    return res.json({
      ok: true,
      products,
      count
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      err
    });
  }
});

app.get('/product/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id).populate('category', 'description').populate('user', 'name email').exec();
    return res.json({
      ok: true,
      product,
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      err
    });
  }
});

app.get('/product/search/:term', verifyToken, async (req, res) => {
  let from = req.query.from || 0;
  from = Number(from);

  let limit = req.query.limit || 5;
  limit = Number(limit);

  const term = req.params.term;
  const regex = new RegExp(term, 'i')

  try {
    const products = await Product.find({ name: regex, available: true }).skip(from).limit(limit).collation({ locale: "en" }).sort('name').populate('category', 'description').populate('user', 'name email').exec();
    const count = await Product.countDocuments({ name: regex, available: true });
    return res.json({
      ok: true,
      products,
      count
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      err
    });
  }
});

app.post('/product', verifyToken, async (req, res) => {
  const { body, user } = req;
  const { name, price, description, available, categoryId } = body;
  try {
    const product = new Product({
      name,
      price,
      description,
      available,
      user: user._id,
      category: categoryId
    });
    const productDb = await product.save({ new: true });
    await Product.populate(productDb, { path: 'user' });
    await Product.populate(productDb, { path: 'category' });
    return res.status(201).json({
      ok: true,
      product: productDb,
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      err
    });
  }
});

app.put('/product/:id', verifyToken, async (req, res) => {
  const { user, params } = req;
  const id = params.id;
  const body = _.pick(req.body, [ 'name', 'price', 'description', 'available', 'categoryId' ]);
  if (body.categoryId) {
    body.category = body.categoryId;
  }
  
  try {
    if (user.role !== 'ADMIN_ROLE') {
      return res.status(401).json({
        ok: false,
        err: {
          message: 'Unauthorized'
        }
      });  
    }

    const updatedProductDB = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }).populate('category', 'description').populate('user', 'name email');

    if (updatedProductDB) {
      return res.json({
        ok: true,
        product: updatedProductDB
      });  
    } else {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Product not found'
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

app.delete('/product/:id', verifyToken, async (req, res) => {
  const { user, params } = req;
  const id = params.id;
  
  try {
    if (user.role !== 'ADMIN_ROLE') {
      return res.status(401).json({
        ok: false,
        err: {
          message: 'Unauthorized'
        }
      });  
    }

    const conditions = { _id: id, available: true };
    const productChanges = { available: false };
    const deletedProductDB = await Product.findOneAndUpdate(conditions, productChanges, { new: true, runValidators: true, context: 'query' }).populate('category', 'description').populate('user', 'name email');

    if (deletedProductDB) {
      return res.json({
        ok: true,
        product: deletedProductDB
      });  
    } else {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Product not found'
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