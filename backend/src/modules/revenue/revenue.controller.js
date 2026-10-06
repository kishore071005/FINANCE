const mongoose = require('mongoose');
const apiResponse = require('../../utils/apiResponse');
const service = require('./revenue.service');
const { ALLOWED_STATUSES } = require('./revenue.validation');

const create = async (req, res, next) => {
  try {
    const invoice = await service.createInvoice(req.body);
    return apiResponse.created(res, invoice, 'Invoice created successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return apiResponse.badRequest(res, err.message, err.details || null);
    }
    return next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { paymentStatus, customer } = req.query;
    if (paymentStatus && !ALLOWED_STATUSES.includes(paymentStatus)) {
      return apiResponse.badRequest(
        res,
        'Invalid payment status filter',
        [`Payment Status must be one of: ${ALLOWED_STATUSES.join(', ')}`]
      );
    }
    const invoices = await service.listInvoices({ paymentStatus, customer });
    return apiResponse.success(res, invoices, 'Invoices retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid invoice ID');
    }
    const invoice = await service.getInvoiceById(req.params.id);
    if (!invoice) {
      return apiResponse.notFound(res, 'Invoice not found');
    }
    return apiResponse.success(res, invoice, 'Invoice retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return apiResponse.badRequest(res, 'Invalid invoice ID');
    }
    const invoice = await service.updateInvoice(req.params.id, req.body);
    if (!invoice) {
      return apiResponse.notFound(res, 'Invoice not found');
    }
    return apiResponse.success(res, invoice, 'Invoice updated successfully');
  } catch (err) {
    if (err.statusCode === 400) {
      return apiResponse.badRequest(res, err.message, err.details || null);
    }
    return next(err);
  }
};

module.exports = { create, list, getById, update };
