const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

const fileRouter = require('./routes/files');

const app = express();

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use('/files', fileRouter);

module.exports = app;
