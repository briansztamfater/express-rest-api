const jwt = require('jsonwebtoken');

// ===================
//  Verify Token
// ===================
const verifyToken = async (req, res, next) => {
  const token = req.get('Authorization');
  try {
    const decoded = await jwt.verify(token, process.env.SEED);
    if (decoded) {
      req.user = decoded.user;
    }
    next();
  } catch (err) {
    res.status(401).json({
      ok: false,
      err: {
        message: 'Invalid token'
      }
    });
  }
};

// ===================
//  Verify Token For Images
// ===================
const verifyTokenForImage = async (req, res, next) => {
  const token = req.query.token;
  try {
    const decoded = await jwt.verify(token, process.env.SEED);
    if (decoded) {
      req.user = decoded.user;
    }
    next();
  } catch (err) {
    res.status(401).json({
      ok: false,
      err: {
        message: 'Invalid token'
      }
    });
  }
};

// ===================
//  Verify Admin Role
// ===================
const verifyAdminRole = (req, res, next) => {
  const { role } = req.user;

  if (role === 'ADMIN_ROLE') {
    next();
  } else {
    res.status(401).json({
      ok: false,
      err: {
        message: 'Restricted operation'
      }
    });
  }
};

module.exports = { verifyToken, verifyAdminRole, verifyTokenForImage };