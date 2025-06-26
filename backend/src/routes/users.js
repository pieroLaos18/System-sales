const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');
const userController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueName = `user_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Obtener todos los usuarios activos
router.get('/', authenticate, authorizeRole('admin', 'supervisor'), userController.getAllUsers);

// Obtener cantidad de usuarios activos
router.get('/activos', authenticate, authorizeRole('admin', 'supervisor'), userController.getActiveUserCount);

// Verificar contraseña del usuario antes de editar perfil
router.post('/verify-password', authenticate, userController.verifyPassword);

router.put('/:id/profile', authenticate, userController.updateUserProfile);

router.put('/:id/profile', authenticate, upload.single('image'), userController.updateUserProfile);


// Actualizar rol de un usuario
router.put('/:id', authenticate, authorizeRole('admin'), userController.updateUserRole);

// Desactivar usuario (el nombre correcto es deleteUser)
router.delete('/:id', authenticate, authorizeRole('admin'), userController.deleteUser);

// Actualizar actividad del usuario autenticado
router.post('/activity', authenticate, userController.updateActivity);

// Cerrar sesión del usuario autenticado (nombre correcto es logout)
router.post('/logout', authenticate, userController.logout);

// Cerrar sesión a usuarios inactivos por más de 10 minutos
router.post('/logout-inactivos', userController.logoutInactiveUsers);

// Verificar si el usuario está activo
router.get('/:id/active', userController.isUserActive);

module.exports = router;
