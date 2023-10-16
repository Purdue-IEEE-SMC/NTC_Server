const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');

const getBucket = () => {
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'files',
  });
};

const getColl = () => {
  return mongoose.connection.db.collection('files.files');
};

const storage = new GridFsStorage({
  url: config.mongoose.url, // Would like to use existing connection
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: 'files',
      metadata: {
        owner: req.user._id,
      },
    };
  },
});
const upload = multer({ storage });

const queryFiles = async () => {
  return getColl().find({}).toArray();
};

const getSingleFile = async (filename) => {
  const file = await getColl().findOne({ filename });
  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }
  return file;
};

const getDownloadStream = async (id) => {
  const downloadStream = getBucket().openDownloadStream(id);
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
  getSingleFile,
  getDownloadStream,
  deleteFile,
};
