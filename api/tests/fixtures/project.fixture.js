const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const { Project } = require('../../src/models');

const baseTimestamp = new Date();

const projectOne = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.lorem.word(),
};

const projectTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.lorem.word(),
};

const projectThree = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.lorem.word(),
};

const insertProjects = async (projects) => {
  await Project.insertMany(
    projects.map((project, index) => ({
      ...project,
      createdAt: new Date(baseTimestamp.getTime() + index),
      updatedAt: new Date(baseTimestamp.getTime() + index),
    }))
  );
};

module.exports = {
  projectOne,
  projectTwo,
  projectThree,
  insertProjects,
};
