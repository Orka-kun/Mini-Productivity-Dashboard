const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://productivity-dashboard-frontend.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('MongoDB connected successfully'))
//   .catch(err => {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
//   });

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/goals', require('./routes/goals'));

// Cache for storing the quote
let cachedQuote = null;
let lastFetched = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

app.get('/api/quote', async (req, res) => {
  try {
    // Check for refresh query parameter to bypass cache
    const bypassCache = req.query.refresh === 'true';

    // If not bypassing cache and cached quote is still valid, return
    if (!bypassCache && cachedQuote && lastFetched && (Date.now() - lastFetched < CACHE_DURATION)) {
      return res.json(cachedQuote);
    }

    // Fetching quotes from ZenQuotes API
    const response = await axios.get('https://zenquotes.io/api/random');
    if (!response.data || !response.data[0] || !response.data[0].q || !response.data[0].a) {
      throw new Error('Invalid quote data from API');
    }
    cachedQuote = { quote: response.data[0].q, author: response.data[0].a };
    lastFetched = Date.now();
    res.json(cachedQuote);
  } catch (error) {
    console.error('Quote API error:', error.message);
    // If there's a cached quote, return it even if the API fails
    if (cachedQuote) {
      return res.json(cachedQuote);
    }
    // Fallback if no cached quote is available
    res.status(500).json({
      message: 'Error fetching quote',
      error: error.message,
      quote: 'Stay motivated, keep pushing forward!',
      author: 'Unknown'
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
