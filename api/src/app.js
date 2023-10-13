const express = require('express');
const helmet = require('helmet');
const path = require('path');
const config = require('./config/config');
const morgan = require('./config/morgan');
const apiRoutes = require('./routes');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// Use api routes
app.use('/api', apiRoutes);

// Serve react app for non-api routes
app.use(express.static(path.join(__dirname, '../../client/build')));

module.exports = app;
