const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const dataValidation = require('../../validations/data.validation');
const dataController = require('../../controllers/data.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(dataValidation.uploadData), dataController.uploadData)
  .get(auth(), validate(dataValidation.listData), dataController.listData);

router
  .route('/:filename')
  .get(auth(), validate(dataValidation.getData), dataController.getData)
  .delete(auth(), validate(dataValidation.deleteData), dataController.deleteData);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Data
 *   description: Data management and retrieval
 */
