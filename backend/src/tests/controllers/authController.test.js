// Mock de nodemailer antes de cualquier importación
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-message-id' })
  })
}));

// Mock del emailSender antes de importar el controller
jest.mock('../../utils/emailSender', () => ({
  enviarCorreoRecuperacion: jest.fn(),
  enviarCorreoVerificacion: jest.fn()
}));

// Mock de bcrypt
jest.mock('bcrypt');

// Mock de crypto
jest.mock('crypto');

// Mock de la base de datos
jest.mock('../../config/db', () => ({
  query: jest.fn()
}));

// Mock de JWT helper
jest.mock('../../utils/jwtHelper');

// Mock del session service
jest.mock('../../services/sessionService');

// Ahora importar el controller después de los mocks
const authController = require('../../controllers/authController');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pool = require('../../config/db');
const { generarToken } = require('../../utils/jwtHelper');
const { enviarCorreoRecuperacion, enviarCorreoVerificacion } = require('../../utils/emailSender');
const { registrarSesion } = require('../../services/sessionService');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      ip: '127.0.0.1',
      headers: { 'user-agent': 'Test User Agent' }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'testpass';
  });

  describe('login', () => {
    beforeEach(() => {
      req.body = {
        correo_electronico: 'test@example.com',
        password: 'password123'
      };
    });

    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        correo_electronico: 'test@example.com',
        password: 'hashedPassword',
        nombre: 'Test User',
        rol: 'admin',
        verificado: 1,
        activo: 1,
        imagen: null
      };
      const mockToken = 'mock-jwt-token';

      pool.query
        .mockResolvedValueOnce([[mockUser]]) // User query
        .mockResolvedValueOnce([{}]) // Update last_login
        .mockResolvedValueOnce([{}]); // Insert activity

      bcrypt.compare.mockResolvedValue(true);
      generarToken.mockReturnValue(mockToken);
      registrarSesion.mockResolvedValue();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: mockToken,
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          rol: 'admin',
          image: null
        }
      });
      expect(registrarSesion).toHaveBeenCalledWith({
        userId: 1,
        token: mockToken,
        ip: '127.0.0.1',
        userAgent: 'Test User Agent',
        expiracion: expect.any(Date)
      });
    });

    it('should return 404 if user not found', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('should return 403 if account not verified', async () => {
      const mockUser = {
        id: 1,
        correo_electronico: 'test@example.com',
        verificado: 0,
        activo: 1
      };

      pool.query.mockResolvedValueOnce([[mockUser]]);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tu cuenta aún no ha sido verificada. Revisa tu correo electrónico.'
      });
    });

    it('should return 403 if account not active', async () => {
      const mockUser = {
        id: 1,
        correo_electronico: 'test@example.com',
        verificado: 1,
        activo: 0
      };

      pool.query.mockResolvedValueOnce([[mockUser]]);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario inactivo' });
    });

    it('should return 401 if password is incorrect', async () => {
      const mockUser = {
        id: 1,
        correo_electronico: 'test@example.com',
        password: 'hashedPassword',
        verificado: 1,
        activo: 1
      };

      pool.query.mockResolvedValueOnce([[mockUser]]);
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Contraseña incorrecta' });
    });

    it('should handle server errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });
      expect(consoleSpy).toHaveBeenCalledWith('Error en login:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('register', () => {
    beforeEach(() => {
      req.body = {
        correo_electronico: 'new@example.com',
        password: 'password123',
        nombre: 'New User',
        apellido: 'Last Name',
        rol: 'cajero',
        direccion: 'Test Address'
      };
    });

    it('should register new user successfully', async () => {
      pool.query
        .mockResolvedValueOnce([[]]) // Check existing users
        .mockResolvedValueOnce([[]]) // Check pending users
        .mockResolvedValueOnce([{}]) // Insert pending user
        .mockResolvedValueOnce([{}]); // Insert activity

      bcrypt.hash.mockResolvedValue('hashedPassword');
      crypto.randomBytes.mockReturnValue({ toString: () => 'mock-token' });
      enviarCorreoVerificacion.mockResolvedValue();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Se ha enviado un correo de verificación. Por favor verifica tu cuenta.'
      });
      expect(enviarCorreoVerificacion).toHaveBeenCalledWith(
        'new@example.com',
        'New User',
        'mock-token'
      );
    });

    it('should return 400 if email already exists', async () => {
      pool.query.mockResolvedValueOnce([[{ correo_electronico: 'new@example.com' }]]);

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'El email ya está en uso' });
    });

    it('should handle pending verification with recent email', async () => {
      const recentDate = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
      
      pool.query
        .mockResolvedValueOnce([[]]) // No existing users
        .mockResolvedValueOnce([[{ ultimo_envio: recentDate }]]); // Recent pending

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Ya se ha enviado un correo de verificación. Intenta nuevamente en unos minutos.',
        allowResend: true
      });
    });

    it('should resend verification if more than 5 minutes passed', async () => {
      const oldDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      
      pool.query
        .mockResolvedValueOnce([[]]) // No existing users
        .mockResolvedValueOnce([[{ ultimo_envio: oldDate }]]) // Old pending
        .mockResolvedValueOnce([{}]); // Update pending user

      crypto.randomBytes.mockReturnValue({ toString: () => 'new-token' });
      enviarCorreoVerificacion.mockResolvedValue();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Se ha reenviado el correo de verificación.'
      });
    });

    it('should handle server errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });

      consoleSpy.mockRestore();
    });
  });

  describe('forgotPassword', () => {
    beforeEach(() => {
      req.body = { email: 'test@example.com' };
    });

    it('should send recovery email successfully', async () => {
      const mockUser = { correo_electronico: 'test@example.com' };
      
      pool.query
        .mockResolvedValueOnce([[mockUser]]) // Find user
        .mockResolvedValueOnce([{}]); // Update reset token

      crypto.randomBytes.mockReturnValue({ toString: () => 'reset-token' });
      enviarCorreoRecuperacion.mockResolvedValue();

      await authController.forgotPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Correo de recuperación enviado'
      });
      expect(enviarCorreoRecuperacion).toHaveBeenCalledWith('test@example.com', 'reset-token');
    });

    it('should return 404 if email not found', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      await authController.forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Correo no registrado' });
    });

    it('should handle server errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await authController.forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al enviar el correo de recuperación'
      });

      consoleSpy.mockRestore();
    });
  });

  describe('verificarCuenta', () => {
    beforeEach(() => {
      req.body = { token: 'valid-token' };
    });

    it('should verify account successfully', async () => {
      const mockPendingUser = {
        id: 1,
        correo_electronico: 'test@example.com',
        password: 'hashedPassword',
        nombre: 'Test User',
        apellido: 'Last Name',
        rol: 'cajero',
        direccion: 'Test Address',
        token_expires_at: new Date(Date.now() + 10 * 60 * 1000) // Valid token
      };

      pool.query
        .mockResolvedValueOnce([[mockPendingUser]]) // Find pending user
        .mockResolvedValueOnce([[]]) // Check if user exists
        .mockResolvedValueOnce([{}]) // Insert user
        .mockResolvedValueOnce([{}]) // Delete pending
        .mockResolvedValueOnce([{}]); // Insert activity

      await authController.verificarCuenta(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Tu cuenta ha sido verificada correctamente. Ahora puedes iniciar sesión.'
      });
    });

    it('should return 400 if token not provided', async () => {
      req.body = {};

      await authController.verificarCuenta(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token no proporcionado' });
    });

    it('should return 400 if token is invalid', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      await authController.verificarCuenta(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido o ya utilizado' });
    });

    it('should return 400 if token is expired', async () => {
      const mockPendingUser = {
        id: 1,
        token_expires_at: new Date(Date.now() - 10 * 60 * 1000) // Expired token
      };

      pool.query
        .mockResolvedValueOnce([[mockPendingUser]]) // Find pending user
        .mockResolvedValueOnce([{}]); // Delete pending user

      await authController.verificarCuenta(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'El token ha expirado. Por favor regístrate nuevamente.'
      });
    });

    it('should return 400 if account already activated', async () => {
      const mockPendingUser = {
        id: 1,
        correo_electronico: 'test@example.com',
        token_expires_at: new Date(Date.now() + 10 * 60 * 1000)
      };

      pool.query
        .mockResolvedValueOnce([[mockPendingUser]]) // Find pending user
        .mockResolvedValueOnce([[{ correo_electronico: 'test@example.com' }]]) // User exists
        .mockResolvedValueOnce([{}]); // Delete pending

      await authController.verificarCuenta(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'La cuenta ya fue activada' });
    });

    it('should handle server errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await authController.verificarCuenta(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al verificar la cuenta' });

      consoleSpy.mockRestore();
    });
  });

  describe('reenviarVerificacion', () => {
    beforeEach(() => {
      req.body = { correo_electronico: 'test@example.com' };
    });

    it('should resend verification email successfully', async () => {
      const mockPending = { id: 1, nombre: 'Test User' };
      
      pool.query
        .mockResolvedValueOnce([[mockPending]]) // Find pending user
        .mockResolvedValueOnce([{}]); // Update token

      crypto.randomBytes.mockReturnValue({ toString: () => 'new-token' });
      enviarCorreoVerificacion.mockResolvedValue();

      await authController.reenviarVerificacion(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Se ha reenviado el correo de verificación.'
      });
    });

    it('should return 404 if no pending account found', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      await authController.reenviarVerificacion(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No se encontró una cuenta pendiente con ese correo.'
      });
    });

    it('should handle server errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await authController.reenviarVerificacion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error interno al reenviar verificación'
      });

      consoleSpy.mockRestore();
    });
  });

  describe('resetPassword', () => {
    beforeEach(() => {
      req.params = { token: 'valid-reset-token' };
      req.body = { password: 'newPassword123' };
    });

    it('should reset password successfully', async () => {
      const mockUser = { id: 1, reset_token: 'valid-reset-token' };
      
      pool.query
        .mockResolvedValueOnce([[mockUser]]) // Find user with valid token
        .mockResolvedValueOnce([{}]); // Update password

      bcrypt.hash.mockResolvedValue('newHashedPassword');

      await authController.resetPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Contraseña restablecida correctamente'
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
    });

    it('should return 400 if token is invalid or expired', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido o expirado' });
    });

    it('should handle server errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al restablecer la contraseña'
      });

      consoleSpy.mockRestore();
    });
  });
});