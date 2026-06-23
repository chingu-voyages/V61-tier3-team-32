require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const specs = require('./swagger');

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

// Swagger API Documentation - serves UI from CDN (required for Vercel serverless)
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

app.get('/api-docs', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>FoodRescue API Docs</title>
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js"></script>
        <script>
          window.onload = function () {
            SwaggerUIBundle({
              url: '/api-docs/swagger.json',
              dom_id: '#swagger-ui',
              presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
              layout: 'StandaloneLayout',
            });
          };
        </script>
      </body>
    </html>
  `);
});


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
