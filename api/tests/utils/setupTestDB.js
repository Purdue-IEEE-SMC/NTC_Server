const mongoose = require('mongoose');
const config = require('../../src/config/config');

const setupTestDB = () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    try {
      await mongoose.connection.db.createCollection('files.files');
      await mongoose.connection.db.createCollection('files.chunks');
    } catch (err) {
      // Collection already exists
    }
  });

  beforeEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany())
    );
    const files = await mongoose.connection.db.collection('files.files').find({}).toArray();
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'files',
    });
    await Promise.all(files.map((file) => bucket.delete(file._id)));
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
};

module.exports = setupTestDB;
