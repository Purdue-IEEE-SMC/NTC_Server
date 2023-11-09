const faker = require('faker');
const { Project } = require('../../../src/models');

describe('Project model', () => {
  describe('Project validation', () => {
    let newProject;
    beforeEach(() => {
      newProject = {
        name: faker.random.word(),
      };
    });

    test('should correctly validate a valid project', async () => {
      await expect(new Project(newProject).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if name is invalid', async () => {
      newProject.name = '';
      await expect(new Project(newProject).validate()).rejects.toThrow();
    });
  });
});
