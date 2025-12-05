const express = require('express');
const cookierParser = require('cookie-parser');
const app = express();
const productRoutes = require('./routes/product.routes');

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookierParser());
app.use('/api/products', productRoutes);






module.exports = app;