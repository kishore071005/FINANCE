const express = require('express');
const controller = require('./vendor.controller');

const router = express.Router();

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.patch('/:id', controller.update);
router.post('/:id/payments', controller.addPayment);
router.get('/:id/payments', controller.listPayments);

module.exports = router;
