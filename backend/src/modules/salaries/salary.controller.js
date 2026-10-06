const mongoose = require('mongoose');
const apiResponse = require('../../utils/apiResponse');
const service = require('./salary.service');

const create = async (req, res, next) => {
  try {
    const salary = await service.createSalary(req.body);
    return apiResponse.created(res, salary, 'Salary record created successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return apiResponse.badRequest(res, err.message, err.details || null);
    }
    return next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { department, employee } = req.query;
    const salaries = await service.listSalaries({ department, employee });
    return apiResponse.success(res, salaries, 'Salary records retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const summary = async (req, res, next) => {
  try {
    const data = await service.getSummary();
    return apiResponse.success(res, data, 'Salary summary retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid salary record ID');
    }
    const salary = await service.getSalaryById(req.params.id);
    if (!salary) {
      return apiResponse.notFound(res, 'Salary record not found');
    }
    return apiResponse.success(res, salary, 'Salary record retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid salary record ID');
    }
    const salary = await service.updateSalary(req.params.id, req.body);
    if (!salary) {
      return apiResponse.notFound(res, 'Salary record not found');
    }
    return apiResponse.success(res, salary, 'Salary record updated successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return apiResponse.badRequest(res, err.message, err.details || null);
    }
    return next(err);
  }
};

module.exports = { create, list, summary, getById, update };
