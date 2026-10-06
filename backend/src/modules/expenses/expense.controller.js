const mongoose = require('mongoose');
const apiResponse = require('../../utils/apiResponse');
const service = require('./expense.service');
const { ALLOWED_CATEGORIES } = require('./expense.validation');

const create = async (req, res, next) => {
  try {
    const expense = await service.createExpense(req.body);
    return apiResponse.created(res, expense, 'Expense created successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return apiResponse.badRequest(res, err.message, err.details || null);
    }
    return next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { category, department } = req.query;
    if (category && !ALLOWED_CATEGORIES.includes(category)) {
      return apiResponse.badRequest(res, 'Invalid category filter', [
        'Category must be one of the allowed expense categories'
      ]);
    }
    const expenses = await service.listExpenses({ category, department });
    return apiResponse.success(res, expenses, 'Expenses retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const summary = async (req, res, next) => {
  try {
    const data = await service.getSummary();
    return apiResponse.success(res, data, 'Expense summary retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid expense ID');
    }
    const expense = await service.getExpenseById(req.params.id);
    if (!expense) {
      return apiResponse.notFound(res, 'Expense not found');
    }
    return apiResponse.success(res, expense, 'Expense retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid expense ID');
    }
    const expense = await service.updateExpense(req.params.id, req.body);
    if (!expense) {
      return apiResponse.notFound(res, 'Expense not found');
    }
    return apiResponse.success(res, expense, 'Expense updated successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return apiResponse.badRequest(res, err.message, err.details || null);
    }
    return next(err);
  }
};

module.exports = { create, list, summary, getById, update };
