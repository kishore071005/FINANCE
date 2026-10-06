const express = require('express');
const controller = require('./reports.controller');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:type', controller.getByType);

module.exports = router;
