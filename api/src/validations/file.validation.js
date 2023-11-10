const Joi = require('joi');
const { objectId } = require('./custom.validation');

const fileValidation = {
  uploadFile: {
    params: {
      projectId: Joi.string().custom(objectId).required(),
    },
    type: Joi.string().valid('data', 'model').required(),
    files: Joi.array()
      .items(
        Joi.object({
          fieldname: Joi.string().required(),
          originalname: Joi.string().required(),
          encoding: Joi.string().required(),
          mimetype: Joi.string().required(),
          buffer: Joi.binary().required(),
          size: Joi.number().required(),
        })
      )
      .min(1)
      .required(),
  },

  listFiles: {
    params: {
      projectId: Joi.string().custom(objectId).required(),
    },
    query: Joi.object().keys({
      type: Joi.string().valid('data', 'model'),
      filename: Joi.string(),
      uploaderId: Joi.string().custom(objectId),
      size: Joi.number().integer(),
      sortBy: Joi.string(),
      limit: Joi.number().integer(),
      page: Joi.number().integer(),
    }),
  },

  getFile: {
    params: {
      projectId: Joi.string().custom(objectId).required(),
      filename: Joi.string().required(),
    },
  },

  deleteFile: {
    params: {
      projectId: Joi.string().custom(objectId).required(),
      filename: Joi.string().required(),
    },
  },
};

module.exports = fileValidation;
