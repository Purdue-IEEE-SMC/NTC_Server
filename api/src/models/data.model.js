const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const dataSchema = mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      index: true,
    },
    size: {
      type: Number,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
dataSchema.plugin(toJSON);
dataSchema.plugin(paginate);

/**
 * @typedef Data
 */
const Data = mongoose.model('Data', dataSchema);

module.exports = Data;
