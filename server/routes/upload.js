const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const User = require('../models/user');
const Product = require('../models/product');

const fs = require('fs');
const path = require('path');

app.use(fileUpload({ useTempFiless: true }));

app.put('/upload/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'No files were uploaded.'
      }
    });
  }

  let validTypes = ['products', 'users'];

  if (!validTypes.includes(type)) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Valid types are ' + validTypes.join(', ')
      }
    });
  }

  const file = req.files.file;
  const fileNameParts = file.name.split('.');
  const extension = fileNameParts[fileNameParts.length - 1];

  let validExtensions = ['png', 'jpg', 'gif', 'jpeg'];

  if (!validExtensions.includes(extension)) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Valid extensions are ' + validExtensions.join(', '),
        ext: extension
      }
    });
  }

  const fileName = `${id}-${new Date().getMilliseconds()}.${extension}`;
  try {
    await file.mv(`uploads/${type}/${fileName}`);
    if (type === 'users') {
      updateUserImage(id, fileName, res);
    } else {
      updateProductImage(id, fileName, res);
    }
  } catch (err) {
    return res.status(500).json({
      ok: false,
      err
    });
  }
});

async function updateUserImage(id, fileName, res) {  
  try {
    const userDB = await User.findById(id);

    if (!userDB) {
      deleteImage(fileName, 'users');
      return res.status(400).json({
        ok: false,
        err: {
          message: 'User does not exist'
        }
      });  
    }

    deleteImage(userDB.img, 'users');

    userDB.img = fileName;

    await userDB.save();

    res.json({
      ok: true,
      user: userDB,
      img: fileName
    });
  } catch (err) {
    deleteImage(fileName, 'users');
    return res.status(400).json({
      ok: false,
      err
    });
  }
}

async function updateProductImage(id, fileName, res) {
  try {
    const productDb = await Product.findById(id);

    if (!productDb) {
      deleteImage(fileName, 'products');
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Product does not exist'
        }
      });  
    }

    deleteImage(productDb.img, 'products');

    productDb.img = fileName;

    await productDb.save();

    res.json({
      ok: true,
      product: productDb,
      img: fileName
    });
  } catch (err) {
    deleteImage(fileName, 'products');
    return res.status(400).json({
      ok: false,
      err
    });
  }
}

function deleteImage(fileName, type) {
  const imagePath = path.resolve(__dirname, `../../uploads/${type}/${fileName}`);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
}

module.exports = app;