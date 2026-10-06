const express = require('express');
const controller = require('./subscription.controller');

const router = express.Router();

router.get('/', controller.list);
router.get('/summary', controller.summary);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.patch('/:id', controller.update);

module.exports = router;
