const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role, city } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        city
      }
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city },
      token
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Logged in successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city },
      token
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logged out successfully. Please remove token from client.' });
};

const getMe = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { signup, login, logout, getMe };
