const request = require('supertest');
const { faker } = require('@faker-js/faker');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Project } = require('../../src/models');
const { userOne, admin, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');
const { projectOne, insertProjects, projectTwo, projectThree } = require('../fixtures/project.fixture');
const { insertFiles, dataOne, dataTwo, modelOne, modelTwo } = require('../fixtures/file.fixture');

setupTestDB();
let filesCollection;

beforeAll(async () => {
  filesCollection = await mongoose.connection.db.collection('files.files');
});

describe('Project routes', () => {
  describe('POST /api/v1/projects', () => {
    let newProject;

    beforeEach(() => {
      newProject = {
        name: faker.lorem.word(),
      };
    });

    test('should return 201 and successfully create new project if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newProject)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        name: newProject.name,
      });

      const dbProject = await Project.findById(res.body.id);
      expect(dbProject).toBeDefined();
      expect(dbProject).toMatchObject({
        name: newProject.name,
      });
    });

    test('should return 400 error if name is invalid', async () => {
      await insertUsers([admin]);

      newProject.name = '';

      await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newProject)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if name is already used', async () => {
      await insertUsers([admin]);
      await insertProjects([projectOne]);
      newProject.name = projectOne.name;

      await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newProject)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/api/v1/projects').send(newProject).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if logged user is not admin', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newProject)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('GET /api/v1/projects', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertProjects([projectOne, projectTwo]);

      const res = await request(app).get('/api/v1/projects').expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]).toEqual({
        id: projectOne._id.toHexString(),
        name: projectOne.name,
        fileCount: 0,
        modelFileCount: 0,
        dataFileCount: 0,
      });
    });

    test('should show fileCount, modelFileCount, dataFileCount', async () => {
      await insertProjects([projectOne]);
      await insertFiles([dataOne, dataTwo, modelOne, modelTwo], projectOne._id, userOne._id);

      const res = await request(app).get('/api/v1/projects').expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]).toEqual({
        id: projectOne._id.toHexString(),
        name: projectOne.name,
        fileCount: 4,
        modelFileCount: 2,
        dataFileCount: 2,
      });
    });

    test('should correctly apply filter on name field', async () => {
      await insertProjects([projectOne, projectTwo]);

      const res = await request(app).get('/api/v1/projects').query({ name: projectOne.name }).expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(projectOne._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertProjects([projectOne, projectTwo]);

      const res = await request(app).get('/api/v1/projects').query({ sortBy: 'name:desc' }).expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);

      const expectedOrder = [projectOne, projectTwo].sort((a, b) => (a.name > b.name ? -1 : 1));
      expectedOrder.forEach((project, index) => {
        expect(res.body.results[index].id).toBe(project._id.toHexString());
      });
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertProjects([projectOne, projectTwo]);

      const res = await request(app).get('/api/v1/projects').query({ sortBy: 'name:asc' }).expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);

      const expectedOrder = [projectOne, projectTwo].sort((a, b) => (a.name < b.name ? -1 : 1));
      expectedOrder.forEach((project, index) => {
        expect(res.body.results[index].id).toBe(project._id.toHexString());
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertProjects([projectOne, projectTwo, projectThree]);

      const res = await request(app).get('/api/v1/projects').query({ limit: 2 }).expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(projectOne._id.toHexString());
      expect(res.body.results[1].id).toBe(projectTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertProjects([projectOne, projectTwo, projectThree]);

      const res = await request(app).get('/api/v1/projects').query({ page: 2, limit: 2 }).expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(projectThree._id.toHexString());
    });
  });

  describe('GET /api/v1/projects/:projectId', () => {
    test('should return 200 and the project object if data is ok', async () => {
      await insertProjects([projectOne]);

      const res = await request(app).get(`/api/v1/projects/${projectOne._id}`).expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: projectOne._id.toHexString(),
        name: projectOne.name,
        fileCount: 0,
        modelFileCount: 0,
        dataFileCount: 0,
      });
    });

    test('should return 404 error if project is not found', async () => {
      await insertProjects([projectTwo]);

      await request(app).get(`/api/v1/projects/${projectOne._id}`).expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /api/v1/projects/:projectId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([admin]);
      await insertProjects([projectOne]);

      await request(app)
        .delete(`/api/v1/projects/${projectOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NO_CONTENT);

      const dbProject = await Project.findById(projectOne._id);
      expect(dbProject).toBeNull();
    });

    test('should delete all files in project', async () => {
      await insertUsers([admin]);
      await insertProjects([projectOne]);
      await insertFiles([dataOne, dataTwo, modelOne, modelTwo], projectOne._id, userOne._id);

      await request(app)
        .delete(`/api/v1/projects/${projectOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NO_CONTENT);

      const dbProject = await Project.findById(projectOne._id);
      expect(dbProject).toBeNull();
      const dbFiles = await filesCollection.find({ 'metadata.projectId': projectOne._id }).toArray();
      expect(dbFiles).toHaveLength(0);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertProjects([projectOne]);

      await request(app).delete(`/api/v1/projects/${projectOne._id}`).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to delete project', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne]);

      await request(app)
        .delete(`/api/v1/projects/${projectOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if projectId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/api/v1/projects/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if admin is trying to delete project that is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/api/v1/projects/${projectOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /api/v1/projects/:projectId', () => {
    test('should return 200 and successfully update project if data is ok', async () => {
      await insertUsers([admin]);
      await insertProjects([projectOne]);

      const res = await request(app)
        .patch(`/api/v1/projects/${projectOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: 'newProjectName' })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: projectOne._id.toHexString(),
        name: 'newProjectName',
      });

      const dbProject = await Project.findById(projectOne._id);
      expect(dbProject).toBeDefined();
      expect(dbProject).toMatchObject({ name: 'newProjectName' });
    });

    test('should return 401 if access token is missing', async () => {
      await insertProjects([projectOne]);

      await request(app)
        .patch(`/api/v1/projects/${projectOne._id}`)
        .send({ name: 'newProjectName' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user is trying to update project', async () => {
      await insertUsers([userOne]);
      await insertProjects([projectOne]);

      await request(app)
        .patch(`/api/v1/projects/${projectOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ name: 'newProjectName' })
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 if name is invalid', async () => {
      await insertUsers([admin]);
      await insertProjects([projectOne]);

      await request(app)
        .patch(`/api/v1/projects/${projectOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: '' })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if name is already taken', async () => {
      await insertUsers([admin]);
      await insertProjects([projectOne, projectTwo]);

      await request(app)
        .patch(`/api/v1/projects/${projectTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: projectOne.name })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should not return 400 if name is current name', async () => {
      await insertUsers([admin]);
      await insertProjects([projectOne]);

      await request(app)
        .patch(`/api/v1/projects/${projectOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: projectOne.name })
        .expect(httpStatus.OK);
    });

    test('should return 404 if admin is trying to update project that is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .patch(`/api/v1/projects/${projectOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: 'newProjectName' })
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 if projectId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .patch('/api/v1/projects/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: 'newProjectName' })
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
