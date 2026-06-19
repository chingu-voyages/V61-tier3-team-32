const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const verifyToken = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, city: true, latitude: true, longitude: true }
    });

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const isDonor = (req, res, next) => {
  if (req.user && req.user.role === 'donor') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a donor' });
  }
};

const isClaimer = (req, res, next) => {
  if (req.user && req.user.role === 'claimer') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a claimer' });
  }
};

module.exports = { verifyToken, isDonor, isClaimer };
