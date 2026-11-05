const express = require('express');
const router = express.Router();
const {
  register,
  login,
  changePassword,
  getStudents
} = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const allow = require('../middleware/role.middleware');
const {
  validateRegister,
  validateLogin,
  validateChangePassword
} = require('../middleware/validate.middleware');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.put('/change-password', authMiddleware, validateChangePassword, changePassword);
router.get('/users', authMiddleware, allow('admin'), getStudents);

module.exports = router;

