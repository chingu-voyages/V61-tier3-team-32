require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);

// Enable CORS for frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Pass io to routes if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Basic Healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FoodRescue API is running' });
});

// Routes placeholders
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/listings', require('./routes/listings'));
// app.use('/api/claims', require('./routes/claims'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/stats', require('./routes/stats'));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
