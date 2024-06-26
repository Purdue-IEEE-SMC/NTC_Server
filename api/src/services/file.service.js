const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const projectService = require('./project.service');

let bucket;
let coll;
let upload;

const setupUpload = () => {
  const storage = new GridFsStorage({
    db: mongoose.connection, // Would like to use existing connection
    file: async (req, file) => {
      return {
        filename: `${Date.now()}-${file.originalname}`,
        bucketName: 'files',
        metadata: {
          uploaderId: req.user._id,
          projectId: new mongoose.Types.ObjectId(req.params.projectId),
          type: req.body.type,
        },
      };
    },
  });

  upload = multer({
    storage,
    fileFilter: async (req, file, callback) => {
      const project = await projectService.getProjectById(req.params.projectId);
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
};

mongoose.connection.on('connected', () => {
  setupUpload();
});

/**
 * Get files GridFS Bucket
 * @returns {GridFSBucket}
 */
const getBucket = () => {
  if (!bucket) {
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'files',
    });
  }
  return bucket;
};

/**
 * Get files GridFS Collection
 * @returns {Collection<DefaultSchema>}
 */
const getColl = () => {
  if (!coll) {
    return mongoose.connection.db.collection('files.files');
  }
  return coll;
};

/**
 * Query for documents with pagination
 * @param {Object} [filter] - Mongo filter
 * @param {Object} [options] - Query options
 * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
 * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const paginateFile = async (filter, options) => {
  let sort = {};
  if (options.sortBy) {
    options.sortBy.split(',').forEach((sortOption) => {
      const [key, order] = sortOption.split(':');
      sort[key] = order === 'desc' ? -1 : 1;
    });
  } else {
    sort = { uploadDate: 1 };
  }

  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const skip = (page - 1) * limit;
  const newFilter = {};
  Object.keys(filter).forEach((key) => {
    if (key === 'type') {
      newFilter[`metadata.${key}`] = filter[key];
    } else if (key === 'projectId' || key === 'uploaderId') {
      newFilter[`metadata.${key}`] = new mongoose.Types.ObjectId(filter[key]);
    } else {
      newFilter[key] = filter[key];
    }
  });

  const countPromise = getColl().countDocuments(newFilter);
  const docsPromise = getColl().find(newFilter).sort(sort).skip(skip).limit(limit).toArray();

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

/**
 * Query for files with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryFiles = async (filter, options) => {
  return paginateFile(filter, options);
};

/**
 *
 * @param projectId
 * @param filename
 * @returns {Promise<any>}
 */
const getFileByFilename = async (projectId, filename) => {
  const file = await getColl().findOne({ filename, 'metadata.projectId': new mongoose.Types.ObjectId(projectId) });
  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }
  return file;
};

/**
 * Get download stream
 * @param {ObjectId} id
 * @returns {Promise<GridFSBucketReadStream>}
 */
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

/**
 * Delete file by id
 * @param {ObjectId} id
 * @returns {Promise<void>}
 */
const deleteFile = async (id) => {
  await getBucket().delete(id, (err) => {
    if (err) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Error deleting file');
    }
  });
};

/**
 * Delete all files by project id
 * @param {ObjectId} projectId
 * @returns {Promise<void>}
 */
const deleteFilesByProjectId = async (projectId) => {
  const files = await getColl()
    .find({ 'metadata.projectId': new mongoose.Types.ObjectId(projectId) })
    .toArray();
  await Promise.all(
    files.map((file) =>
      deleteFile(file._id).catch((err) => {
        if (err) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Error deleting file');
        }
      })
    )
  );
};

module.exports = {
  get upload() {
    if (!upload) {
      throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'File upload service unavailable');
    }
    return upload;
  },
  queryFiles,
  getFileByFilename,
  getDownloadStream,
  deleteFile,
  deleteFilesByProjectId,
};
