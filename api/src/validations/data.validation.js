const Joi = require('joi');

const dataValidation = {
  uploadData: {
    files: Joi.array()
      .items(
        Joi.object({
          fieldname: Joi.string().required(),
          originalname: Joi.string()
            .required()
            .regex(/\.csv$/),
          encoding: Joi.string().required(),
          mimetype: Joi.string().required().valid('text/csv'),
          buffer: Joi.binary().required(),
          size: Joi.number().required(),
        })
      )
      .min(1)
      .required(),
  },

  listData: {
    query: {
      limit: Joi.number().optional().min(1),
      page: Joi.number().optional().min(1),
    },
  },

  getData: {
    params: {
      filename: Joi.string()
        .required()
        .regex(/^[\w,\s-]+\.[A-Za-z]{3,4}$/),
    },
  },

  deleteData: {
    params: {
      filename: Joi.string()
        .required()
        .regex(/^[\w,\s-]+\.[A-Za-z]{3,4}$/),
    },
  },
};

module.exports = dataValidation;
