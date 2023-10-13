const httpStatus = require('http-status');
const crypto = require('crypto');
const { Readable } = require('stream');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const Data = require('../models/data.model');
const { roleRights } = require('../config/roles');

const encryptAndSaveData = async (files, user) => {
  // check if any files exist already on the server
  const existingFiles = await Data.find({ filename: { $in: files.map((file) => file.originalname) } });
  if (existingFiles.length > 0) {
    throw new ApiError(httpStatus.CONFLICT, 'File already exists');
  }

  // Encrypt each file asynchronously
  const encryptedFilesPromises = files.map(async (file) => {
    const outputPath = path.resolve('uploads', 'data', `${file.originalname}.enc`);

    // Generate a random IV and salt
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(32);

    // Generate a key
    const key = crypto.scryptSync(config.encryptionKey, salt, 32);

    // Create a cipher
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    const input = Buffer.from(file.buffer);
    const encrypted = Buffer.concat([salt, iv, cipher.update(input), cipher.final()]);

    // Asynchronously write the encrypted file
    await fs.promises.writeFile(outputPath, encrypted);

    return outputPath;
  });

  const encryptedFiles = await Promise.all(encryptedFilesPromises);

  const uploads = encryptedFiles.map(async (file, index) => {
    return Data.create({
      filename: files[index].originalname,
      owner: user._id,
      size: files[index].size,
      path: file,
    });
  });

  return Promise.all(uploads);
};

const queryData = async (filter, options) => {
  return Data.paginate(filter, options);
};

const decryptAndDownloadData = async (filename) => {
  const file = await Data.findOne({ filename });
  if (!file) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }

  if (!fs.existsSync(file.path)) {
    await file.remove();
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }

  const input = await fs.promises.readFile(file.path);
  const salt = input.subarray(0, 32);
  const iv = input.subarray(32, 48);
  const fileContent = input.subarray(48);

  const key = crypto.scryptSync(config.encryptionKey, salt, 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  const decipherStream = new Readable({
    read() {
      this.push(decipher.update(fileContent));
      this.push(decipher.final());
      this.push(null); // indicates the end of the stream
    },
  });

  return decipherStream;
};

const deleteDataById = async (filename, user) => {
  const file = await Data.findOne({ filename });
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
  encryptAndSaveData,
  queryData,
  decryptAndDownloadData,
  deleteDataById,
};
