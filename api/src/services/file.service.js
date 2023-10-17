const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const projectService = require('./project.service');

let bucket;
let coll;

const getBucket = () => {
  if (!bucket) {
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'files',
    });
  }
  return bucket;
};

const getColl = () => {
  if (!coll) {
    return mongoose.connection.db.collection('files.files');
  }
  return coll;
};

const storage = new GridFsStorage({
  url: config.mongoose.url, // Would like to use existing connection
  file: async (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: 'files',
      metadata: {
        owner: req.user._id,
        projectId: (await projectService.getProjectById(req.params.projectId))._id,
        type: req.body.type,
      },
    };
  },
});

const upload = multer({
  storage,
  fileFilter: async (req, file, callback) => {
    let project;
    try {
      project = await projectService.getProjectById(req.params.projectId);
    } catch (error) {
      return callback(new ApiError(httpStatus.NOT_FOUND, 'Project not found'));
    }
    if (!project) {
      return callback(new ApiError(httpStatus.NOT_FOUND, 'Project not found'));
    }
    if (!req.body.type || !(req.body.type === 'data' || req.body.type === 'model')) {
      return callback(new ApiError(httpStatus.BAD_REQUEST, 'Invalid type'));
    }
    if (req.body.type === 'data' && file.mimetype !== 'text/csv') {
      return callback(new ApiError(httpStatus.BAD_REQUEST, 'Data files must be CSV'));
    }
    if (req.body.type === 'model' && !file.originalname.match(/\.(keras|ckpt)$/)) {
      return callback(new ApiError(httpStatus.BAD_REQUEST, 'Invalid model file type'));
    }
    return callback(null, true);
  },
});

const queryFiles = async (projectId) => {
  return getColl().find({ 'metadata.project': projectId }).toArray();
};

const getFileById = async (projectId, fileId) => {
  const file = await getColl().findOne({ _id: fileId, 'metadata.project': projectId });
  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }
  return file;
};

const getFileByFilename = async (projectId, filename) => {
  const file = await getColl().findOne({ filename, 'metadata.project': projectId });
  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }
  return file;
};

const getDownloadStream = async (id) => {
  let downloadStream;
  try {
    downloadStream = getBucket().openDownloadStream(id);
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Error initializing download stream');
  }
  downloadStream.on('error', () => {
    throw new ApiError(httpStatus.NOT_FOUND, 'Error initializing download stream');
  });

  return downloadStream;
};

const deleteFile = async (id) => {
  await getBucket().delete(id, (err) => {
    if (err) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Error deleting file');
    }
  });
};

module.exports = {
  upload,
  queryFiles,
  getFileById,
  getFileByFilename,
  getDownloadStream,
  deleteFile,
};
