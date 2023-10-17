const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const projectSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
projectSchema.plugin(toJSON);
projectSchema.plugin(paginate);

/**
 * Check if name is taken
 * @param {string} name - The project's name
 * @param {ObjectId} [excludeProjectId] - The id of the project to be excluded
 * @returns {Promise<boolean>}
 */
projectSchema.statics.isNameTaken = async function (name, excludeProjectId) {
  const project = await this.findOne({ name, _id: { $ne: excludeProjectId } });
  return !!project;
};

/**
 * @typedef Project
 */
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
