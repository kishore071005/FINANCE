const mongoose = require('mongoose');
const apiResponse = require('../../utils/apiResponse');
const service = require('./budget.service');
const { ALLOWED_DEPARTMENTS } = require('./budget.validation');

const create = async (req, res, next) => {
  try {
    const budget = await service.createBudget(req.body);
    return apiResponse.created(res, budget, 'Budget created successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return apiResponse.badRequest(res, err.message, err.details || null);
    }
    return next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { department } = req.query;
    if (department && !ALLOWED_DEPARTMENTS.includes(department)) {
      return apiResponse.badRequest(res, 'Invalid department filter', [
        'Department must be one of: HR, Sales, Marketing, Operations, Technology, Other'
      ]);
    }
    const budgets = await service.listBudgets({ department });
    return apiResponse.success(res, budgets, 'Budgets retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const summary = async (req, res, next) => {
  try {
    const data = await service.getSummary();
    return apiResponse.success(res, data, 'Budget summary retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid budget ID');
    }
    const budget = await service.getBudgetById(req.params.id);
    if (!budget) {
      return apiResponse.notFound(res, 'Budget not found');
    }
    return apiResponse.success(res, budget, 'Budget retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid budget ID');
    }
    const budget = await service.updateBudget(req.params.id, req.body);
    if (!budget) {
      return apiResponse.notFound(res, 'Budget not found');
    }
    return apiResponse.success(res, budget, 'Budget updated successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return apiResponse.badRequest(res, err.message, err.details || null);
    }
    return next(err);
  }
};

module.exports = { create, list, summary, getById, update };
