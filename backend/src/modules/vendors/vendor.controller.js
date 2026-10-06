const mongoose = require('mongoose');
const apiResponse = require('../../utils/apiResponse');
const service = require('./vendor.service');

const create = async (req, res, next) => {
  try {
    const vendor = await service.createVendor(req.body);
    return apiResponse.created(res, vendor, 'Vendor created successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return apiResponse.badRequest(res, err.message, err.details || null);
    }
    return next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { name } = req.query;
    const vendors = await service.listVendors({ name });
    return apiResponse.success(res, vendors, 'Vendors retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid vendor ID');
    }
    const vendor = await service.getVendorById(req.params.id);
    if (!vendor) {
      return apiResponse.notFound(res, 'Vendor not found');
    }
    return apiResponse.success(res, vendor, 'Vendor retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid vendor ID');
    }
    const vendor = await service.updateVendor(req.params.id, req.body);
    if (!vendor) {
      return apiResponse.notFound(res, 'Vendor not found');
    }
    return apiResponse.success(res, vendor, 'Vendor updated successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return apiResponse.badRequest(res, err.message, err.details || null);
    }
    return next(err);
  }
};

const addPayment = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid vendor ID');
    }
    const vendor = await service.addPayment(req.params.id, req.body);
    if (!vendor) {
      return apiResponse.notFound(res, 'Vendor not found');
    }
    return apiResponse.created(res, vendor, 'Payment recorded successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return apiResponse.badRequest(res, err.message, err.details || null);
    }
    return next(err);
  }
};

const listPayments = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid vendor ID');
    }
    const payments = await service.listPayments(req.params.id);
    if (!payments) {
      return apiResponse.notFound(res, 'Vendor not found');
    }
    return apiResponse.success(res, payments, 'Payment history retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

module.exports = { create, list, getById, update, addPayment, listPayments };
