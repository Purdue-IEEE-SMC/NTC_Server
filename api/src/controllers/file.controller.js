const httpStatus = require('http-status');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const { fileService } = require('../services');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const pipelineAsync = promisify(pipeline);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve('uploads', 'files'));
    },
    filename: (req, file, cb) => {
      const filePath = path.resolve('uploads', 'files', file.originalname);

      // Check if file already exists
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
          // File exists. Send an error callback.
          cb(new ApiError(httpStatus.CONFLICT, 'File already exists'), file.originalname);
        } else {
          // File doesn't exist. Continue storing the file.
          cb(null, file.originalname);
        }
      });
    },
  }),
});

const uploadFiles = catchAsync(async (req, res) => {
  upload.array('files', 10)(req, res, async (err) => {
    if (err || !req.files) {
      if (err && err instanceof ApiError) {
        res.status(err.statusCode).send(err.message);
        return;
      }
      res.status(httpStatus.BAD_REQUEST).send(err);
      return;
    }
    fileService
      .saveFiles(req.files, req.user)
      .then((result) => {
        res.status(httpStatus.CREATED).send({ result });
      })
      .catch((funcerr) => {
        if (funcerr instanceof ApiError) {
          res.status(funcerr.statusCode).send(funcerr.message);
        } else {
          res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Couldn't upload file");
        }
      });
  });
});

const listFiles = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['filename', 'owner', 'size']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await fileService.queryFiles(filter, options);
  res.status(httpStatus.OK).send(result);
});

const getFile = catchAsync(async (req, res) => {
  const file = await fileService.downloadFile(req.params.filename);
  res.setHeader('Content-Disposition', `attachment; filename=${req.params.filename}`);
  res.setHeader('Content-Transfer-Encoding', 'binary');
  await pipelineAsync(file, res);
});

const deleteFile = catchAsync(async (req, res) => {
  const file = await fileService.deleteFile(req.params.filename, req.user);
  if (!file) {
    res.status(httpStatus.NO_CONTENT).send();
    return;
  }
  res.status(httpStatus.OK).send(file);
});

module.exports = {
  uploadFiles,
  listFiles,
  getFile,
  deleteFile,
};
