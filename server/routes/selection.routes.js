const express = require('express');
const router = express.Router();
const {
  submitSelection,
  getAvailability,
  getMySelection,
  getHeadcount,
  getStudentList,
  getOverview
} = require('../controllers/selection.controller');
const authMiddleware = require('../middleware/auth.middleware');
const allow = require('../middleware/role.middleware');

router.post('/', authMiddleware, allow('student'), submitSelection);
router.get('/availability', authMiddleware, getAvailability);
router.get('/my', authMiddleware, allow('student'), getMySelection);
router.get('/headcount', authMiddleware, allow('mess1', 'mess2', 'admin'), getHeadcount);
router.get('/list', authMiddleware, allow('mess1', 'mess2', 'admin'), getStudentList);
router.get('/overview', authMiddleware, allow('admin'), getOverview);

module.exports = router;

