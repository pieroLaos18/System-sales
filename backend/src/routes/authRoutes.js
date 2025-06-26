const express = require('express');
const { login, register, forgotPassword, resetPassword } = require('../controllers/authController');
const { body, validationResult } = require('express-validator');
const validateFields = require('../middlewares/validateFields');

const router = express.Router();

router.post('/login', login);

router.post(
  '/register',
  [
    body('correo_electronico').isEmail().withMessage('Correo electrónico inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    validateFields
  ],
  register
);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
