const jwt = require('jsonwebtoken');
const config = require('../config')
const Role = require('../models/Role');

exports.authorizeUser = (permission) => async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userRole = decoded.role;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (permission) {
    const roleCount = await Role.findOne({ role: req.userRole, permissions: permission });
    if (!roleCount) return res.status(401).json({ message: 'Permission denied' });
  }

  next();
};