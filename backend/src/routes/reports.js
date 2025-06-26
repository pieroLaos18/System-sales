const express = require('express');
const authenticate = require('../middleware/authenticate');
const { getSalesByDate } = require('../controllers/reportController');

const router = express.Router();

router.get('/by-date', authenticate, getSalesByDate);

module.exports = router;
