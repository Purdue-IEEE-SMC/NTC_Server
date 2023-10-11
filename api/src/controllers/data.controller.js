const httpStatus = require('http-status');
const path = require('path');
const multer = require('multer');
const { pipeline } = require('stream');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const { dataService } = require('../services');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const pipelineAsync = promisify(pipeline);

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.csv') {
      return cb(new ApiError(httpStatus.BAD_REQUEST, 'Only CSV files are allowed'));
    }
    return cb(null, true);
  },
});

const uploadData = catchAsync(async (req, res) => {
  upload.array('files', 10)(req, res, async (err) => {
    if (err || !req.files) {
      res.status(httpStatus.BAD_REQUEST).send(err);
      return;
    }
    dataService
      .encryptAndSaveData(req.files, req.user)
      .then((result) => {
        res.status(httpStatus.CREATED).send({ result });
      })
      .catch((funcerr) => {
        res.status(funcerr.statusCode).send(funcerr.message);
      });
  });
});

const listData = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['filename', 'owner', 'size']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await dataService.queryData(filter, options);
  res.send(result);
});

const getData = catchAsync(async (req, res) => {
  const data = await dataService.decryptAndDownloadData(req.params.filename);
  if (!data) {
    res.status(httpStatus.NOT_FOUND).send();
    return;
  }
  res.setHeader('Content-Disposition', `attachment; filename=${req.params.filename}`);
  res.setHeader('Content-Transfer-Encoding', 'binary');
  await pipelineAsync(data, res);
});

const deleteData = catchAsync(async (req, res) => {
  const file = await dataService.deleteDataById(req.params.filename, req.user);
  if (!file) {
    res.status(httpStatus.NO_CONTENT).send();
    return;
  }
  res.status(httpStatus.OK).send(file);
});

module.exports = {
  uploadData,
  listData,
  getData,
  deleteData,
};
