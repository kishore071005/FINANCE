const express = require('express');
const controller = require('./overview.controller');

const router = express.Router();

router.get('/', controller.get);

module.exports = router;
