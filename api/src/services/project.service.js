const httpStatus = require('http-status');
const { Project } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a project
 * @param {Object} projectBody
 * @returns {Promise<Project>}
 */
const createProject = async (projectBody) => {
  if (await Project.isNameTaken(projectBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }
  return Project.create(projectBody);
};

/**
 * Query for projects
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryProjects = async (filter, options) => {
  const projects = await Project.paginate(filter, options);
  return projects;
};

/**
 * Get project by id
 * @param {ObjectId} id
 * @returns {Promise<Project>}
 */
const getProjectById = async (id) => {
  return Project.findById(id);
};

/**
 * Get project by name
 * @param {string} name
 * @returns {Promise<Project>}
 */
const getProjectByName = async (name) => {
  return Project.findOne({ name });
};

/**
 * Update project by id
 * @param {ObjectId} projectId
 * @param {Object} updateBody
 * @returns {Promise<Project>}
 */
const updateProjectById = async (projectId, updateBody) => {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }
  if (updateBody.name && (await Project.isNameTaken(updateBody.name, projectId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }
  Object.assign(project, updateBody);
  await project.save();
  return project;
};

/**
 * Delete project by id
 * @param {ObjectId} projectId
 * @returns {Promise<Project>}
 */
const deleteProjectById = async (projectId) => {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }
  await project.remove();
  return project;
};

module.exports = {
  createProject,
  queryProjects,
  getProjectById,
  getProjectByName,
  updateProjectById,
  deleteProjectById,
};
