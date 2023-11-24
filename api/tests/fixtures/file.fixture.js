const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');

let gfs;

const getGridFSBucket = () => {
  if (!gfs) {
    gfs = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'files',
    });
  }
  return gfs;
};

const generateCSVData = (rows) => {
  let csvContent = 'ch1,ch2,ch3,ch4,ch5,ch6,ch7,ch8,Timestamps\n';

  for (let i = 0; i < rows; i += 1) {
    // Generate each field using faker, ensuring to match the structure of your data
    const rowData = [
      faker.number.float({ min: -200000, max: 200000, precision: 0.00000001 }),
      faker.number.float({ min: -200000, max: 200000, precision: 0.00000001 }),
      faker.number.float({ min: -200000, max: 200000, precision: 0.00000001 }),
      faker.number.float({ min: -200000, max: 200000, precision: 0.00000001 }),
      faker.number.float({ min: -200000, max: 200000, precision: 0.00000001 }),
      faker.number.float({ min: -200000, max: 200000, precision: 0.00000001 }),
      faker.number.float({ min: -200000, max: 200000, precision: 0.00000001 }),
      faker.number.float({ min: -200000, max: 200000, precision: 0.00000001 }),
      Date.now(), // Timestamp in milliseconds
    ];

    // Join the row data and add a new line
    csvContent += `${rowData.join(',')}\n`;
  }

  return csvContent;
};

const genDataFile = (rows) => {
  const csvData = generateCSVData(rows); // Assuming this function returns a CSV string
  const csvBuffer = Buffer.from(csvData);

  return {
    fieldname: 'files',
    originalname: `${faker.lorem.word()}.csv`,
    encoding: '7bit',
    mimetype: 'text/csv',
    buffer: csvBuffer,
    size: csvBuffer.length,
    metadata: {
      type: 'data',
    },
  };
};

const genModelFile = () => {
  const bufferSize = faker.number.int({ min: 1024, max: 10240 });
  const buffer = Buffer.alloc(bufferSize, faker.number.int({ min: 0, max: 255 }));

  return {
    fieldname: 'files',
    originalname: `${faker.lorem.word()}.cpkt`,
    encoding: '7bit',
    mimetype: 'application/octet-stream',
    buffer,
    size: buffer.length,
    metadata: {
      type: 'model',
    },
  };
};

const dataOne = genDataFile(faker.number.int({ min: 1, max: 600 }));
const dataTwo = genDataFile(faker.number.int({ min: 1, max: 600 }));
const dataThree = genDataFile(faker.number.int({ min: 1, max: 600 }));

const modelOne = genModelFile();
const modelTwo = genModelFile();
const modelThree = genModelFile();

const insertFiles = async (files, projectId, uploaderId) => {
  const gridFSBucket = getGridFSBucket(); // Get the GridFSBucket instance
  return Promise.all(
    files.map((file) => {
      return new Promise((resolve, reject) => {
        // Create a readable stream from the buffer
        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null); // No more data
        // Create an upload stream using GridFSBucket
        const uploadStream = gridFSBucket.openUploadStream(file.originalname, {
          contentType: file.mimetype,
          metadata: { ...file.metadata, projectId, uploaderId },
        });

        readableStream.pipe(uploadStream).on('error', reject).on('finish', resolve);
      });
    })
  );
};

// eslint-disable-next-line security/detect-non-literal-regexp
const genFilenameRegex = (filename) => new RegExp(`^\\d+-${filename.replace(/\./g, '\\.')}$`);

module.exports = {
  generateCSVData,
  genDataFile,
  dataOne,
  dataTwo,
  dataThree,
  genModelFile,
  modelOne,
  modelTwo,
  modelThree,
  insertFiles,
  genFilenameRegex,
};
