const express = require('express');
const router = express.Router();
const { submitSurplus, getSurplusReports } = require('../controllers/surplus.controller');
const authMiddleware = require('../middleware/auth.middleware');
const allow = require('../middleware/role.middleware');
const { validateSurplus } = require('../middleware/validate.middleware');

router.post('/', authMiddleware, allow('mess1', 'mess2'), validateSurplus, submitSurplus);
router.get('/', authMiddleware, allow('admin', 'mess1', 'mess2'), getSurplusReports);

module.exports = router;

