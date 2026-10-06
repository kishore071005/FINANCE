const express = require('express');
const controller = require('./domain.controller');

const router = express.Router();

router.get('/', controller.list);
router.get('/summary', controller.summary);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.patch('/:id', controller.update);

module.exports = router;
