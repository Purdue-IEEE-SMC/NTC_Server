const faker = require('faker');

const generateCSVData = (rows) => {
  let csvContent = 'ch1,ch2,ch3,ch4,ch5,ch6,ch7,ch8,Timestamps\n';

  for (let i = 0; i < rows; i += 1) {
    // Generate each field using faker, ensuring to match the structure of your data
    const rowData = [
      faker.datatype.float({ min: -200000, max: 200000, precision: 0.00000001 }),
      faker.datatype.float({ min: -200000, max: 200000, precision: 0.00000001 }),
      faker.datatype.float({ min: -200000, max: 200000, precision: 0.00000001 }),
      faker.datatype.float({ min: -200000, max: 200000, precision: 0.00000001 }),
      faker.datatype.float({ min: -200000, max: 200000, precision: 0.00000001 }),
      faker.datatype.float({ min: -200000, max: 200000, precision: 0.00000001 }),
      faker.datatype.float({ min: -200000, max: 200000, precision: 0.00000001 }),
      faker.datatype.float({ min: -200000, max: 200000, precision: 0.00000001 }),
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
    originalname: `${faker.random.word()}.csv`,
    encoding: '7bit',
    mimetype: 'text/csv',
    buffer: csvBuffer,
    size: csvBuffer.length,
  };
};

const genModelFile = () => {
  const bufferSize = faker.datatype.number({ min: 1024, max: 10240 });
  const buffer = Buffer.alloc(bufferSize, faker.datatype.number({ min: 0, max: 255 }));

  return {
    fieldname: 'files',
    originalname: `${faker.random.word()}.cpkt`,
    encoding: '7bit',
    mimetype: 'application/octet-stream',
    buffer,
    size: buffer.length,
  };
};

const dataOne = genDataFile(faker.datatype.number({ min: 1, max: 600 }));
const dataTwo = genDataFile(faker.datatype.number({ min: 1, max: 600 }));
const dataThree = genDataFile(faker.datatype.number({ min: 1, max: 600 }));

const modelOne = genModelFile();
const modelTwo = genModelFile();
const modelThree = genModelFile();

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
};
