const Joi = require('joi');

const fileValidation = {
  uploadFile: {
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
    query: {
      limit: Joi.number().optional().min(1),
      page: Joi.number().optional().min(1),
    },
  },

  getFile: {
    params: {
      filename: Joi.string()
        .required()
        .regex(/^[\w,\s-]+\.[A-Za-z]{3,4}$/),
    },
  },

  deleteFile: {
    params: {
      filename: Joi.string()
        .required()
        .regex(/^[\w,\s-]+\.[A-Za-z]{3,4}$/),
    },
  },
};

module.exports = fileValidation;
