const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Serve static files
app.use(express.static('public'));

// Basic products data
const products = [
  { id: 1, name: 'Smartphone X', price: 699.99 },
  { id: 2, name: 'Laptop Pro', price: 1299.99 },
  { id: 3, name: 'Wireless Headphones', price: 199.99 }
];

// API endpoint
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
