require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { swaggerUi, specs } = require('./swagger');

const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "validator.swagger.io"],
    },
  },
}));
app.use(morgan('dev'));
app.use(express.json());

// Supabase Realtime will be handled on the client side directly

// Root route for friendly browser testing
app.get('/', (req, res) => {
  res.send('Welcome to the FoodRescue API Server!  Go to /api-docs for documentation.');
});

// Swagger API Documentation Route
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui.min.css";
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { 
  customCssUrl: CSS_URL,
  customJs: [
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui-bundle.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui-standalone-preset.min.js"
  ]
}));

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API Healthcheck
 *     description: Returns the status of the API
 *     responses:
 *       200:
 *         description: Successful response
 */
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

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express API for Vercel Serverless
module.exports = app;
