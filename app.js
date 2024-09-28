const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/database');
const routes = require('./routes/index');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
