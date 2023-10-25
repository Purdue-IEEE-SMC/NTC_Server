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

projectSchema.virtual('fileCount').get(function () {
  const coll = mongoose.connection.db.collection('files.files');
  return coll.countDocuments({ 'metadata.projectId': this._id });
});

projectSchema.virtual('dataFileCount').get(function () {
  const coll = mongoose.connection.db.collection('files.files');
  return coll.countDocuments({ 'metadata.projectId': this._id, 'metadata.type': 'data' });
});

projectSchema.virtual('modelFileCount').get(function () {
  const coll = mongoose.connection.db.collection('files.files');
  return coll.countDocuments({ 'metadata.projectId': this._id, 'metadata.type': 'model' });
});

/**
 * @typedef Project
 */
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
