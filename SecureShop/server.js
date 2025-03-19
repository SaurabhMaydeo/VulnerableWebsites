const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Basic middleware without security features
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Disable security headers for demonstration
app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.removeHeader('X-Content-Type-Options');
  res.removeHeader('X-XSS-Protection');
  next();
});

// In-memory data store with XSS payloads
const products = [
  { 
    id: 1, 
    name: 'Smartphone X',
    price: 699.99,
    category: 'Electronics',
    description: 'The latest smartphone with advanced features.'
  },
  { 
    id: 2, 
    name: 'Laptop Pro', 
    price: 1299.99,
    category: 'Electronics',
    description: 'High-performance laptop for professionals.'
  },
  { 
    id: 3, 
    name: 'Wireless Headphones',
    price: 199.99,
    category: 'Electronics',
    description: 'Premium wireless headphones with noise cancellation.'
  }
];

const reviews = [];
let nextReviewId = 1;

// Sanitization helper
const sanitizeInput = (input) => {
  return sanitizeHtml(input, {
    allowedTags: ['b', 'i', 'em', 'strong'],
    allowedAttributes: {}
  });
};

// API Endpoints
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.json(product);
});

// API Endpoint: Get reviews for a product
app.get('/api/products/:id/reviews', (req, res) => {
  const productId = parseInt(req.params.id);
  const productReviews = reviews.filter(r => r.productId === productId);
  
  // Sanitize reviews before sending
  const sanitizedReviews = productReviews.map(review => ({
    ...review,
    username: xss(review.username),
    comment: xss(review.comment)
  }));
  
  res.json(sanitizedReviews);
});

// VULNERABLE API Endpoint: Add a review (No sanitization)
app.post('/api/products/:id/reviews', (req, res) => {
  const productId = parseInt(req.params.id);
  const { username, rating, comment } = req.body;
  
  // No input validation or sanitization
  const newReview = {
    id: nextReviewId++,
    productId,
    username: username, // Vulnerable to XSS
    rating: parseInt(rating),
    comment: comment,  // Vulnerable to XSS
    createdAt: new Date().toISOString()
  };
  
  reviews.push(newReview);
  res.status(201).json(newReview);
});

// VULNERABLE API Endpoint: Search products (XSS Vulnerability #1 - Reflected XSS)
app.get('/api/search', (req, res) => {
  const query = req.query.q || '';
  
  const results = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.description.toLowerCase().includes(query.toLowerCase())
  );
  
  // Vulnerable to XSS - directly reflecting user input
  res.json({
    query: query, // XSS vulnerability here - query parameter is reflected without sanitization
    results: results
  });
});

// VULNERABLE API Endpoint: Add product review (XSS Vulnerability #2 - Stored XSS)
app.post('/api/products/:id/reviews', (req, res) => {
  const productId = parseInt(req.params.id);
  const { username, comment } = req.body;
  
  // No input validation or sanitization
  const newReview = {
    id: reviews.length + 1,
    productId,
    username, // XSS vulnerability here - stored without sanitization
    comment,  // XSS vulnerability here - stored without sanitization
    date: new Date().toISOString()
  };
  
  reviews.push(newReview);
  res.status(201).json(newReview);
});

// Get reviews for a product (returns unsanitized data)
app.get('/api/products/:id/reviews', (req, res) => {
  const productId = parseInt(req.params.id);
  const productReviews = reviews.filter(r => r.productId === productId);
  res.json(productReviews);
});

// Route for the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for product details page
app.get('/product/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).send('Product not found');
  }
  
  res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

// Routes for other pages
app.get('/categories', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'categories.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
