const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { fileService } = require('../services');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');

const uploadFiles = catchAsync(async (req, res) => {
  fileService.upload.array('files', 10)(req, res, async (err) => {
    if (err || !req.files) {
      if (err && err instanceof ApiError) {
        res.status(err.statusCode).send(err.message);
        return;
      }
      res.status(httpStatus.BAD_REQUEST).send(err);
      return;
    }
    res.status(httpStatus.CREATED).send({ files: req.files.map((file) => file.filename) });
  });
});

const listFiles = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['type']);
  filter.projectId = req.params.projectId;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const files = await fileService.queryFiles(filter, options);
  res.send(files);
});

const getFile = catchAsync(async (req, res) => {
  const file = await fileService.getFileByFilename(req.params.projectId, req.params.filename);
  res.setHeader('Content-Type', file.contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${file.filename}`);
  const downloadStream = await fileService.getDownloadStream(file._id);
  res.status(httpStatus.OK);
  downloadStream.pipe(res);
});

const deleteFile = catchAsync(async (req, res) => {
  const file = await fileService.getFileByFilename(req.params.projectId, req.params.filename);
  await fileService.deleteFile(file._id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  uploadFiles,
  listFiles,
  getFile,
  deleteFile,
};
