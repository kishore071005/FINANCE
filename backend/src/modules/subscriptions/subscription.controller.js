const mongoose = require('mongoose');
const apiResponse = require('../../utils/apiResponse');
const service = require('./subscription.service');
const { ALLOWED_STATUSES, ALLOWED_CYCLES } = require('./subscription.validation');

const create = async (req, res, next) => {
  try {
    const subscription = await service.createSubscription(req.body);
    return apiResponse.created(res, subscription, 'Subscription created successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return apiResponse.badRequest(res, err.message, err.details || null);
    }
    return next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { status, billingCycle } = req.query;
    if (status && !ALLOWED_STATUSES.includes(status)) {
      return apiResponse.badRequest(res, 'Invalid status filter', [
        'Status must be Active or Inactive'
      ]);
    }
    if (billingCycle && !ALLOWED_CYCLES.includes(billingCycle)) {
      return apiResponse.badRequest(res, 'Invalid billing cycle filter', [
        'Billing cycle must be Monthly or Annual'
      ]);
    }
    const subscriptions = await service.listSubscriptions({ status, billingCycle });
    return apiResponse.success(res, subscriptions, 'Subscriptions retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const summary = async (req, res, next) => {
  try {
    const data = await service.getSummary();
    return apiResponse.success(res, data, 'Subscription summary retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid subscription ID');
    }
    const subscription = await service.getSubscriptionById(req.params.id);
    if (!subscription) {
      return apiResponse.notFound(res, 'Subscription not found');
    }
    return apiResponse.success(res, subscription, 'Subscription retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid subscription ID');
    }
    const subscription = await service.updateSubscription(req.params.id, req.body);
    if (!subscription) {
      return apiResponse.notFound(res, 'Subscription not found');
    }
    return apiResponse.success(res, subscription, 'Subscription updated successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return apiResponse.badRequest(res, err.message, err.details || null);
    }
    return next(err);
  }
};

module.exports = { create, list, summary, getById, update };
