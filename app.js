const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

const fileRouter = require('./routes/files');

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use('/files', fileRouter);

module.exports = app;
