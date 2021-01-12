const express = require('express');

const fs = require('fs');
const path = require('path');

let { verifyTokenForImage } = require('../middlewares/authentication');

const app = express();

app.get('/image/:type/:img', verifyTokenForImage, (req, res) => {
  const type = req.params.type;
  const img = req.params.img;

  const imagePath = path.resolve(__dirname, `../../uploads/${type}/${img}`);

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    const noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
    res.sendFile(noImagePath);
  }
});

module.exports = app;