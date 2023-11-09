const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');

describe('Auth routes', () => {
  describe('GET /api/v1/docs', () => {
    test('should return 404 not running in development', async () => {
      await request(app).get('/api/v1/docs').send().expect(httpStatus.NOT_FOUND);
    });
  });
});
