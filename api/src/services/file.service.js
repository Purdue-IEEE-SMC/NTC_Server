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

const paginateFile = async (filter, options) => {
  let sort = {};
  if (options.sortBy) {
    options.sortBy.split(',').forEach((sortOption) => {
      const [key, order] = sortOption.split(':');
      sort[key] = order === 'desc' ? -1 : 1;
    });
  } else {
    sort = { uploadDate: -1 };
  }

  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const skip = (page - 1) * limit;
  const metadataFilter = {};
  Object.keys(filter).forEach((key) => {
    metadataFilter[`metadata.${key}`] = filter[key];
  });
  metadataFilter['metadata.projectId'] = mongoose.Types.ObjectId(filter.projectId);

  const countPromise = getColl().countDocuments(metadataFilter);
  let docsPromise = getColl().find(metadataFilter).sort(sort).skip(skip).limit(limit).toArray();

  if (options.populate) {
    options.populate.split(',').forEach((populateOption) => {
      docsPromise = docsPromise.populate(
        populateOption
          .split('.')
          .reverse()
          .reduce((a, b) => ({ path: b, populate: a }))
      );
    });
  }

  return Promise.all([countPromise, docsPromise]).then((values) => {
    const [totalResults, results] = values;
    const totalPages = Math.ceil(totalResults / limit);
    const result = {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
    return Promise.resolve(result);
  });
};

const storage = new GridFsStorage({
  url: config.mongoose.url, // Would like to use existing connection
  file: async (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: 'files',
      metadata: {
        uploaderId: req.user._id,
        projectId: mongoose.Types.ObjectId(req.params.projectId),
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

const queryFiles = async (filter, options) => {
  return paginateFile(filter, options);
};

const getFileById = async (projectId, fileId) => {
  const file = await getColl().findOne({ _id: fileId, 'metadata.projectId': mongoose.Types.ObjectId(projectId) });
  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }
  return file;
};

const getFileByFilename = async (projectId, filename) => {
  const file = await getColl().findOne({ filename, 'metadata.projectId': mongoose.Types.ObjectId(projectId) });
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
