const httpStatus = require('http-status');
const fs = require('fs');
const path = require('path');
const ApiError = require('../utils/ApiError');
const File = require('../models/file.model');
const { roleRights } = require('../config/roles');

const saveFiles = async (files, user) => {
  const uploads = files.map(async (file, index) => {
    return File.create({
      filename: files[index].originalname,
      owner: user._id,
      size: files[index].size,
      path: path.resolve(__dirname, '../../uploads', 'files', `${file.originalname}`),
    });
  });

  return Promise.all(uploads);
};

const queryFiles = async (filter, options) => {
  return File.paginate(filter, options);
};

const downloadFile = async (filename) => {
  const file = await File.findOne({ filename });
  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }

  if (!fs.existsSync(file.path)) {
    file.remove();
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }

  return fs.createReadStream(file.path);
};

const deleteFile = async (filename, user) => {
  const file = await File.findOne({ filename });
  if (!file) {
    return null;
  }

  if (`${file.owner}` !== `${user._id}`) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = userRights.includes('manageData');
    if (!hasRequiredRights) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }
  }

  fs.access(file.path, async (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        await file.remove();
        return null;
      }
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An unknown error occurred');
    }

    // File exists, attempt to delete
    fs.unlink(file.path, async (delerr) => {
      if (delerr) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not delete file');
      }
      await file.remove();
    });
  });
  return file;
};

module.exports = {
  saveFiles,
  queryFiles,
  downloadFile,
  deleteFile,
};
