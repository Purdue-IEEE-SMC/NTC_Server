const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { userOne, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken } = require('../fixtures/token.fixture');
const { projectOne, insertProjects } = require('../fixtures/project.fixture');
const { genDataFile } = require('../fixtures/file.fixture');

setupTestDB();
let filesCollection;

beforeAll(async () => {
  filesCollection = await mongoose.connection.db.collection('files.files');
});

describe('File routes', () => {
  describe('POST /api/v1/projects/:projectId/files', () => {
    let newFile;

    beforeEach(() => {
      newFile = genDataFile(faker.datatype.number({ min: 1, max: 600 }));
    });

    test('should return 201 and successfully upload data file', async () => {
      await insertProjects([projectOne]);
      await insertUsers([userOne]);

      const res = await request(app)
        .post(`/api/v1/projects/${projectOne._id}/files`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .set('Content-Type', 'multipart/form-data')
        .field('type', 'data')
        .attach('files', newFile.buffer, newFile.originalname)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('files');
      expect(res.body.files).toEqual(expect.any(Array));
      // eslint-disable-next-line security/detect-non-literal-regexp
      const filenameRegex = new RegExp(`^\\d+-${newFile.originalname.replace(/\./g, '\\.')}$`);
      expect(res.body.files[0]).toEqual(expect.stringMatching(filenameRegex));

      const dbFile = await filesCollection.findOne({ filename: res.body.files[0] });
      expect({
        ...dbFile,
        metadata: {
          ...dbFile.metadata,
          uploaderId: dbFile.metadata.uploaderId.toHexString(),
          projectId: dbFile.metadata.projectId.toHexString(),
        },
      }).toMatchObject({
        length: newFile.size,
        contentType: newFile.mimetype,
        metadata: {
          uploaderId: userOne._id.toHexString(),
          projectId: projectOne._id.toHexString(),
          type: 'data',
        },
      });
    });

    test('should return 201 and successfully upload multiple data files', async () => {
      await insertProjects([projectOne]);
      await insertUsers([userOne]);

      const newFile2 = genDataFile(faker.datatype.number({ min: 1, max: 600 }));
      const newFile3 = genDataFile(faker.datatype.number({ min: 1, max: 600 }));

      const res = await request(app)
        .post(`/api/v1/projects/${projectOne._id}/files`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .set('Content-Type', 'multipart/form-data')
        .field('type', 'data')
        .attach('files', newFile.buffer, newFile.originalname)
        .attach('files', newFile2.buffer, newFile2.originalname)
        .attach('files', newFile3.buffer, newFile3.originalname)
        .expect(httpStatus.CREATED);

      expect(res.body).toHaveProperty('files');
      expect(res.body.files).toEqual(expect.any(Array));
      expect(res.body.files).toHaveLength(3);
      // eslint-disable-next-line security/detect-non-literal-regexp
      const genRegex = (filename) => new RegExp(`^\\d+-${filename.replace(/\./g, '\\.')}$`);
      expect(res.body.files).toEqual(
        expect.arrayContaining([
          expect.stringMatching(genRegex(newFile.originalname)),
          expect.stringMatching(genRegex(newFile2.originalname)),
          expect.stringMatching(genRegex(newFile3.originalname)),
        ])
      );

      const dbFiles = await filesCollection.find({ filename: { $in: res.body.files } }).toArray();
      expect(dbFiles).toHaveLength(3);
      expect(dbFiles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            length: newFile.size,
            contentType: newFile.mimetype,
            metadata: {
              uploaderId: userOne._id,
              projectId: projectOne._id,
              type: 'data',
            },
          }),
          expect.objectContaining({
            length: newFile2.size,
            contentType: newFile2.mimetype,
            metadata: {
              uploaderId: userOne._id,
              projectId: projectOne._id,
              type: 'data',
            },
          }),
          expect.objectContaining({
            length: newFile3.size,
            contentType: newFile3.mimetype,
            metadata: {
              uploaderId: userOne._id,
              projectId: projectOne._id,
              type: 'data',
            },
          }),
        ])
      );
    });

    test('should return 400 error if type is invalid', async () => {
      await insertProjects([projectOne]);
      await insertUsers([userOne]);

      await request(app)
        .post(`/api/v1/projects/${projectOne._id}/files`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .set('Content-Type', 'multipart/form-data')
        .field('type', 'invalid')
        .attach('files', newFile.buffer, newFile.originalname)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if file is not CSV when type is data', async () => {
      const invalidFile = {
        fieldname: 'files',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.from('test'),
        size: 4,
      };
      await insertProjects([projectOne]);
      await insertUsers([userOne]);

      await request(app)
        .post(`/api/v1/projects/${projectOne._id}/files`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .set('Content-Type', 'multipart/form-data')
        .field('type', 'data')
        .attach('files', invalidFile.buffer, invalidFile.originalname)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if file is not Keras or TensorFlow when type is model', async () => {
      const invalidFile = {
        fieldname: 'files',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.from('test'),
        size: 4,
      };
      await insertProjects([projectOne]);
      await insertUsers([userOne]);

      await request(app)
        .post(`/api/v1/projects/${projectOne._id}/files`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .set('Content-Type', 'multipart/form-data')
        .field('type', 'model')
        .attach('files', invalidFile.buffer, invalidFile.originalname)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if more than 10 files are uploaded', async () => {
      await insertProjects([projectOne]);
      await insertUsers([userOne]);

      const files = [];
      for (let i = 0; i < 11; i += 1) {
        files.push(genDataFile(faker.datatype.number({ min: 1, max: 600 })));
      }

      await request(app)
        .post(`/api/v1/projects/${projectOne._id}/files`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .set('Content-Type', 'multipart/form-data')
        .field('type', 'data')
        .attach('files', files[0].buffer, files[0].originalname)
        .attach('files', files[1].buffer, files[1].originalname)
        .attach('files', files[2].buffer, files[2].originalname)
        .attach('files', files[3].buffer, files[3].originalname)
        .attach('files', files[4].buffer, files[4].originalname)
        .attach('files', files[5].buffer, files[5].originalname)
        .attach('files', files[6].buffer, files[6].originalname)
        .attach('files', files[7].buffer, files[7].originalname)
        .attach('files', files[8].buffer, files[8].originalname)
        .attach('files', files[9].buffer, files[9].originalname)
        .attach('files', files[10].buffer, files[10].originalname)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertProjects([projectOne]);
      await insertUsers([userOne]);

      await request(app)
        .post(`/api/v1/projects/${projectOne._id}/files`)
        .set('Content-Type', 'multipart/form-data')
        .field('type', 'data')
        .attach('files', newFile.buffer, newFile.originalname)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});
