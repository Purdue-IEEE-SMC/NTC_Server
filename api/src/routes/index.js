const express = require('express');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('../config/config');
const { jwtStrategy } = require('../config/passport');
const { authLimiter } = require('../middlewares/rateLimiter');
const routes = require('./v1');
const { errorConverter, errorHandler } = require('../middlewares/error');
const ApiError = require('../utils/ApiError');

const router = express.Router();

// parse json request body
router.use(express.json());

// parse urlencoded request body
router.use(express.urlencoded({ extended: true }));

// sanitize request data
router.use(xss());
router.use(mongoSanitize());

// gzip compression
router.use(compression());

// enable cors
router.use(cors());
router.options('*', cors());

// jwt authentication
router.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  router.use('/v1/auth', authLimiter);
}

// v1 api routes
router.use('/v1', routes);

// send back a 404 error for any unknown api request
router.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
router.use(errorConverter);

// handle error
router.use(errorHandler);

module.exports = router;
