const request = require('supertest');
const { faker } = require('@faker-js/faker');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { userOne, insertUsers, userTwo, admin } = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');
const { projectOne, insertProjects, projectTwo } = require('../fixtures/project.fixture');
const {
  genDataFile,
  insertFiles,
  dataOne,
  dataTwo,
  modelOne,
  modelTwo,
  genFilenameRegex,
} = require('../fixtures/file.fixture');

setupTestDB();
let filesCollection;

beforeAll(async () => {
  filesCollection = await mongoose.connection.db.collection('files.files');
});

describe('File routes', () => {
  describe('POST /api/v1/projects/:projectId/files', () => {
    let newFile;

    beforeEach(() => {
      newFile = genDataFile(faker.number.int({ min: 1, max: 600 }));
    });

    test('should return 201 and successfully upload data file', async () => {
      await insertProjects([projectOne]);
      await insertUsers([userOne]);
      console.log("A")

      const res = await request(app)
        .post(`/api/v1/projects/${projectOne._id}/files`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .set('Content-Type', 'multipart/form-data')
        .field('type', 'data')
        .attach('files', newFile.buffer, newFile.originalname)
        .expect(httpStatus.CREATED);

      console.log("B")
      expect(res.body).toHaveProperty('files');
      expect(res.body.files).toEqual(expect.any(Array));
      expect(res.body.files[0]).toEqual(expect.stringMatching(genFilenameRegex(newFile.originalname)));
      console.log("C")

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

      console.log("D")
    });

    test('should return 201 and successfully upload multiple data files', async () => {
      await insertProjects([projectOne]);
      await insertUsers([userOne]);

      const newFile2 = genDataFile(faker.number.int({ min: 1, max: 600 }));
      const newFile3 = genDataFile(faker.number.int({ min: 1, max: 600 }));

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
      expect(res.body.files).toEqual(
        expect.arrayContaining([
          expect.stringMatching(genFilenameRegex(newFile.originalname)),
          expect.stringMatching(genFilenameRegex(newFile2.originalname)),
          expect.stringMatching(genFilenameRegex(newFile3.originalname)),
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
        files.push(genDataFile(faker.number.int({ min: 1, max: 600 })));
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

    test('should return 404 error if project is not found', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post(`/api/v1/projects/${projectOne._id}/files`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .set('Content-Type', 'multipart/form-data')
        .field('type', 'data')
        .attach('files', newFile.buffer, newFile.originalname)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 error if project is unspecificed', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post(`/api/v1/projects//files`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .set('Content-Type', 'multipart/form-data')
        .field('type', 'data')
        .attach('files', newFile.buffer, newFile.originalname)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /api/v1/projects/:projectId/files', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne]);
      await insertFiles([dataOne], projectOne._id, userOne._id);
      await insertFiles([dataTwo, modelOne, modelTwo], projectOne._id, userOne._id);

      const res = await request(app).get(`/api/v1/projects/${projectOne._id}/files`).expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 4,
      });
      expect(res.body.results).toHaveLength(4);
      expect({
        ...res.body.results[0],
        metadata: {
          ...res.body.results[0].metadata,
        },
      }).toMatchObject({
        length: dataOne.size,
        contentType: dataOne.mimetype,
        filename: dataOne.originalname,
        metadata: {
          uploaderId: userOne._id.toHexString(),
          projectId: projectOne._id.toHexString(),
          type: 'data',
        },
      });
    });

    test('should correctly apply filter on filename field', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne]);
      await insertFiles([dataOne, dataTwo, modelOne, modelTwo], projectOne._id, userOne._id);

      const res = await request(app)
        .get(`/api/v1/projects/${projectOne._id}/files`)
        .query({ filename: dataOne.originalname })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect({
        ...res.body.results[0],
        metadata: {
          ...res.body.results[0].metadata,
        },
      }).toMatchObject({
        length: dataOne.size,
        contentType: dataOne.mimetype,
        filename: dataOne.originalname,
        metadata: {
          uploaderId: userOne._id.toHexString(),
          projectId: projectOne._id.toHexString(),
          type: 'data',
        },
      });
    });

    test('should correctly apply filter on type field', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne]);
      await insertFiles([dataOne, modelOne], projectOne._id, userOne._id);

      const res = await request(app)
        .get(`/api/v1/projects/${projectOne._id}/files`)
        .query({ type: 'data' })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect({
        ...res.body.results[0],
        metadata: {
          ...res.body.results[0].metadata,
        },
      }).toMatchObject({
        length: dataOne.size,
        contentType: dataOne.mimetype,
        filename: dataOne.originalname,
        metadata: {
          uploaderId: userOne._id.toHexString(),
          projectId: projectOne._id.toHexString(),
          type: 'data',
        },
      });
    });

    test('should correctly apply filter on projectId field', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne, projectTwo]);

      await insertFiles([dataOne], projectOne._id, userOne._id);
      await insertFiles([dataTwo], projectTwo._id, userOne._id);

      const res = await request(app).get(`/api/v1/projects/${projectOne._id}/files`).expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });

      expect(res.body.results).toHaveLength(1);
      expect({
        ...res.body.results[0],
        metadata: {
          ...res.body.results[0].metadata,
        },
      }).toMatchObject({
        length: dataOne.size,
        contentType: dataOne.mimetype,
        filename: dataOne.originalname,
        metadata: {
          uploaderId: userOne._id.toHexString(),
          projectId: projectOne._id.toHexString(),
          type: 'data',
        },
      });
    });

    test('should correctly apply filter on uploaderId field', async () => {
      await insertUsers([userOne, userTwo]);
      await insertProjects([projectOne]);

      await insertFiles([dataOne], projectOne._id, userOne._id);
      await insertFiles([dataTwo], projectOne._id, userTwo._id);

      const res = await request(app)
        .get(`/api/v1/projects/${projectOne._id}/files`)
        .query({ uploaderId: userOne._id.toHexString() })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect({
        ...res.body.results[0],
        metadata: {
          ...res.body.results[0].metadata,
        },
      }).toMatchObject({
        length: dataOne.size,
        contentType: dataOne.mimetype,
        filename: dataOne.originalname,
        metadata: {
          uploaderId: userOne._id.toHexString(),
          projectId: projectOne._id.toHexString(),
          type: 'data',
        },
      });
    });

    test('should correctly sort returned array if descending sort param is specified', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne]);
      await insertFiles([dataOne, dataTwo, modelOne, modelTwo], projectOne._id, userOne._id);

      const res = await request(app)
        .get(`/api/v1/projects/${projectOne._id}/files`)
        .query({ sortBy: 'filename:desc' })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 4,
      });
      expect(res.body.results).toHaveLength(4);
      const expectedOrder = [dataTwo, dataOne, modelTwo, modelOne].sort((a, b) =>
        a.originalname > b.originalname ? -1 : 1
      );
      expectedOrder.forEach((file, index) => {
        expect(res.body.results[index].filename).toEqual(file.originalname);
      });
    });

    test('should correctly sort returned array if ascending sort param is specified', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne]);
      await insertFiles([dataOne, dataTwo, modelOne, modelTwo], projectOne._id, userOne._id);

      const res = await request(app)
        .get(`/api/v1/projects/${projectOne._id}/files`)
        .query({ sortBy: 'filename:asc' })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 4,
      });
      expect(res.body.results).toHaveLength(4);
      const expectedOrder = [dataTwo, dataOne, modelTwo, modelOne].sort((a, b) =>
        a.originalname > b.originalname ? 1 : -1
      );
      expectedOrder.forEach((file, index) => {
        expect(res.body.results[index].filename).toEqual(file.originalname);
      });
    });

    test('should correctly sort returned array if multiple sorting criteria are specified', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne]);
      await insertFiles([dataOne, dataTwo, modelOne, modelTwo], projectOne._id, userOne._id);

      const res = await request(app)
        .get(`/api/v1/projects/${projectOne._id}/files`)
        .query({ sortBy: 'type:desc,filename:asc' })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 4,
      });
      expect(res.body.results).toHaveLength(4);
      const expectedOrder = [modelTwo, modelOne, dataTwo, dataOne].sort((a, b) => {
        if (a.type === b.type) {
          return a.originalname > b.originalname ? 1 : -1;
        }
        return a.type > b.type ? -1 : 1;
      });
      expectedOrder.forEach((file, index) => {
        expect(res.body.results[index].filename).toEqual(file.originalname);
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne]);
      await insertFiles([dataOne, dataTwo, modelOne, modelTwo], projectOne._id, userOne._id);

      const res = await request(app)
        .get(`/api/v1/projects/${projectOne._id}/files`)
        .query({ limit: 2 })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 4,
      });
      expect(res.body.results).toHaveLength(2);
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne]);
      await insertFiles([dataOne, dataTwo, modelOne, modelTwo], projectOne._id, userOne._id);

      const res = await request(app)
        .get(`/api/v1/projects/${projectOne._id}/files`)
        .query({ page: 2, limit: 2 })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 4,
      });
      expect(res.body.results).toHaveLength(2);
    });

    test('should return 400 error if type is invalid', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne]);

      await request(app)
        .get(`/api/v1/projects/${projectOne._id}/files`)
        .query({ type: 'invalid' })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/v1/projects/:projectId/files/:filename', () => {
    test('should return 200 and the file object if data file belongs to project', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne]);
      await insertFiles([dataOne], projectOne._id, userOne._id);

      const res = await request(app)
        .get(`/api/v1/projects/${projectOne._id}/files/${dataOne.originalname}`)
        .expect(httpStatus.OK);

      // test file download
      expect(res.headers['content-type']).toEqual(dataOne.mimetype);
      expect(res.headers['content-disposition']).toContain(dataOne.originalname);
      expect(res.body).toBeDefined();
    });

    test('should return 200 and the file object if model file belongs to project', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne]);
      await insertFiles([modelOne], projectOne._id, userOne._id);

      const res = await request(app)
        .get(`/api/v1/projects/${projectOne._id}/files/${modelOne.originalname}`)
        .expect(httpStatus.OK);

      // test file download
      expect(res.headers['content-type']).toEqual(modelOne.mimetype);
      expect(res.headers['content-disposition']).toContain(modelOne.originalname);
      expect(res.body).toBeDefined();
    });

    test('should return 404 error if file is not found', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne]);

      await request(app)
        .get(`/api/v1/projects/${projectOne._id}/files/${dataOne.originalname}`)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 error if file belongs to another project', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne, projectTwo]);
      await insertFiles([dataOne], projectOne._id, userOne._id);

      await request(app)
        .get(`/api/v1/projects/${projectTwo._id}/files/${dataOne.originalname}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /api/v1/projects/:projectId/files/:filename', () => {
    test('should return 204 if data file is deleted', async () => {
      await insertUsers([userOne, admin]);
      await insertProjects([projectOne]);
      await insertFiles([dataOne], projectOne._id, userOne._id);

      await request(app)
        .delete(`/api/v1/projects/${projectOne._id}/files/${dataOne.originalname}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NO_CONTENT);

      const dbFile = await filesCollection.findOne({ filename: dataOne.originalname });
      expect(dbFile).toBeNull();
    });

    test('should return 404 if file is not found', async () => {
      await insertUsers([admin]);
      await insertProjects([projectOne]);

      await request(app)
        .delete(`/api/v1/projects/${projectOne._id}/files/${dataOne.originalname}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 if file belongs to another project', async () => {
      await insertUsers([userOne, admin]);
      await insertProjects([projectOne, projectTwo]);
      await insertFiles([dataOne], projectOne._id, userOne._id);

      await request(app)
        .delete(`/api/v1/projects/${projectTwo._id}/files/${dataOne.originalname}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 401 if access token is missing', async () => {
      await insertProjects([projectOne]);
      await insertFiles([dataOne], projectOne._id, userOne._id);

      await request(app)
        .delete(`/api/v1/projects/${projectOne._id}/files/${dataOne.originalname}`)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user is not admin', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne]);
      await insertFiles([dataOne], projectOne._id, userOne._id);

      await request(app)
        .delete(`/api/v1/projects/${projectOne._id}/files/${dataOne.originalname}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.FORBIDDEN);
    });
  });
});
