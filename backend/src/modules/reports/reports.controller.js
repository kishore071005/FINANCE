const apiResponse = require('../../utils/apiResponse');
const service = require('./reports.service');

const getAll = async (req, res, next) => {
  try {
    const data = await service.getAllReports();
    return apiResponse.success(res, data, 'Reports retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

const getByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const report = await service.getReportByType(type);
    if (!report) {
      return apiResponse.notFound(res, `Report type '${type}' not found`);
    }
    return apiResponse.success(res, report, `Report '${type}' retrieved successfully`);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAll,
  getByType
};
