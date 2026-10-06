const mongoose = require('mongoose');
const apiResponse = require('../../utils/apiResponse');
const service = require('./domain.service');

const create = async (req, res, next) => {
  try {
    const domain = await service.createDomain(req.body);
    return apiResponse.created(res, domain, 'Domain record created successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return apiResponse.badRequest(res, err.message, err.details || null);
    }
    return next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { registrar } = req.query;
    const domains = await service.listDomains({ registrar });
    return apiResponse.success(res, domains, 'Domain records retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const summary = async (req, res, next) => {
  try {
    const data = await service.getSummary();
    return apiResponse.success(res, data, 'Domain summary retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid domain record ID');
    }
    const domain = await service.getDomainById(req.params.id);
    if (!domain) {
      return apiResponse.notFound(res, 'Domain record not found');
    }
    return apiResponse.success(res, domain, 'Domain record retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid domain record ID');
    }
    const domain = await service.updateDomain(req.params.id, req.body);
    if (!domain) {
      return apiResponse.notFound(res, 'Domain record not found');
    }
    return apiResponse.success(res, domain, 'Domain record updated successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return apiResponse.badRequest(res, err.message, err.details || null);
    }
    return next(err);
  }
};

module.exports = { create, list, summary, getById, update };
