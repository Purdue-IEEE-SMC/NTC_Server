const mongoose = require('mongoose');
const faker = require('faker');
const { Project } = require('../../src/models');

const baseTimestamp = new Date();

const projectOne = {
  _id: mongoose.Types.ObjectId(),
  name: faker.random.word(),
};

const projectTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.random.word(),
};

const projectThree = {
  _id: mongoose.Types.ObjectId(),
  name: faker.random.word(),
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
