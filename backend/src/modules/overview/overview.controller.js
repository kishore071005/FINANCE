const apiResponse = require('../../utils/apiResponse');
const service = require('./overview.service');

const get = async (req, res, next) => {
  try {
    const overview = await service.getOverview();
    return apiResponse.success(res, overview, 'Overview retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

module.exports = { get };
