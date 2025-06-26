const express = require('express');
const { body } = require('express-validator');
const validateFields = require('../middleware/validateFields');

const {
  login,
  register,
  forgotPassword,
  resetPassword,
  verificarCuenta,
  reenviarVerificacion
} = require('../controllers/authController');

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

// ✅ Ruta para verificación de cuenta por token
router.post('/verificar', verificarCuenta);
router.post('/reenviar-verificacion', reenviarVerificacion);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
