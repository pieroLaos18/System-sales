const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');
const authController = require('../../controllers/authController');
const validateFields = require('../../middleware/validateFields');

// Mock de dependencias
jest.mock('../../controllers/authController');
jest.mock('../../middleware/validateFields');

// Crear app de Express para testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock del middleware de validación para que siempre permita el acceso
    validateFields.mockImplementation((req, res, next) => {
      next();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      authController.login.mockImplementation((req, res) => {
        res.status(200).json({
          token: 'mock-jwt-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com' }
        });
      });

      const loginData = {
        correo_electronico: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toEqual({
        token: 'mock-jwt-token',
        user: { id: 1, name: 'Test User', email: 'test@example.com' }
      });
      expect(authController.login).toHaveBeenCalled();
    });

    it('should handle login errors', async () => {
      authController.login.mockImplementation((req, res) => {
        res.status(401).json({ message: 'Credenciales inválidas' });
      });

      const loginData = {
        correo_electronico: 'wrong@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toEqual({ message: 'Credenciales inválidas' });
    });

    it('should handle missing credentials', async () => {
      authController.login.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Email y contraseña son requeridos' });
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toEqual({ message: 'Email y contraseña son requeridos' });
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register successfully with valid data', async () => {
      authController.register.mockImplementation((req, res) => {
        res.status(201).json({
          message: 'Se ha enviado un correo de verificación. Por favor verifica tu cuenta.'
        });
      });

      const registerData = {
        correo_electronico: 'new@example.com',
        password: 'password123',
        nombre: 'New User',
        apellido: 'Last Name',
        rol: 'cajero',
        direccion: 'Test Address'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Se ha enviado un correo de verificación. Por favor verifica tu cuenta.'
      });
      expect(authController.register).toHaveBeenCalled();
      expect(validateFields).toHaveBeenCalled();
    });

    it('should handle registration with existing email', async () => {
      authController.register.mockImplementation((req, res) => {
        res.status(400).json({ message: 'El email ya está en uso' });
      });

      const registerData = {
        correo_electronico: 'existing@example.com',
        password: 'password123',
        nombre: 'User',
        apellido: 'Test'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerData)
        .expect(400);

      expect(response.body).toEqual({ message: 'El email ya está en uso' });
    });

    it('should handle validation errors', async () => {
      // Mock validation middleware to return errors
      validateFields.mockImplementation((req, res, next) => {
        res.status(400).json({
          message: 'Errores de validación',
          errors: [
            { field: 'correo_electronico', message: 'Correo electrónico inválido' },
            { field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' }
          ]
        });
      });

      const invalidData = {
        correo_electronico: 'invalid-email',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Errores de validación');
      expect(response.body.errors).toHaveLength(2);
    });

    it('should handle missing required fields', async () => {
      validateFields.mockImplementation((req, res, next) => {
        res.status(400).json({
          message: 'Errores de validación',
          errors: [
            { field: 'nombre', message: 'El nombre es obligatorio' }
          ]
        });
      });

      const incompleteData = {
        correo_electronico: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.errors[0].field).toBe('nombre');
    });
  });

  describe('POST /api/auth/verificar', () => {
    it('should verify account successfully', async () => {
      authController.verificarCuenta.mockImplementation((req, res) => {
        res.json({
          message: 'Tu cuenta ha sido verificada correctamente. Ahora puedes iniciar sesión.'
        });
      });

      const verificationData = { token: 'valid-verification-token' };

      const response = await request(app)
        .post('/api/auth/verificar')
        .send(verificationData)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Tu cuenta ha sido verificada correctamente. Ahora puedes iniciar sesión.'
      });
      expect(authController.verificarCuenta).toHaveBeenCalled();
    });

    it('should handle invalid verification token', async () => {
      authController.verificarCuenta.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Token inválido o ya utilizado' });
      });

      const verificationData = { token: 'invalid-token' };

      const response = await request(app)
        .post('/api/auth/verificar')
        .send(verificationData)
        .expect(400);

      expect(response.body).toEqual({ message: 'Token inválido o ya utilizado' });
    });

    it('should handle expired token', async () => {
      authController.verificarCuenta.mockImplementation((req, res) => {
        res.status(400).json({
          message: 'El token ha expirado. Por favor regístrate nuevamente.'
        });
      });

      const verificationData = { token: 'expired-token' };

      const response = await request(app)
        .post('/api/auth/verificar')
        .send(verificationData)
        .expect(400);

      expect(response.body.message).toBe('El token ha expirado. Por favor regístrate nuevamente.');
    });
  });

  describe('POST /api/auth/reenviar-verificacion', () => {
    it('should resend verification email successfully', async () => {
      authController.reenviarVerificacion.mockImplementation((req, res) => {
        res.json({ message: 'Se ha reenviado el correo de verificación.' });
      });

      const resendData = { correo_electronico: 'test@example.com' };

      const response = await request(app)
        .post('/api/auth/reenviar-verificacion')
        .send(resendData)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Se ha reenviado el correo de verificación.'
      });
      expect(authController.reenviarVerificacion).toHaveBeenCalled();
    });

    it('should handle no pending account found', async () => {
      authController.reenviarVerificacion.mockImplementation((req, res) => {
        res.status(404).json({
          message: 'No se encontró una cuenta pendiente con ese correo.'
        });
      });

      const resendData = { correo_electronico: 'notfound@example.com' };

      const response = await request(app)
        .post('/api/auth/reenviar-verificacion')
        .send(resendData)
        .expect(404);

      expect(response.body.message).toBe('No se encontró una cuenta pendiente con ese correo.');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send recovery email successfully', async () => {
      authController.forgotPassword.mockImplementation((req, res) => {
        res.json({ message: 'Correo de recuperación enviado' });
      });

      const forgotData = { email: 'test@example.com' };

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(forgotData)
        .expect(200);

      expect(response.body).toEqual({ message: 'Correo de recuperación enviado' });
      expect(authController.forgotPassword).toHaveBeenCalled();
    });

    it('should handle email not found', async () => {
      authController.forgotPassword.mockImplementation((req, res) => {
        res.status(404).json({ message: 'Correo no registrado' });
      });

      const forgotData = { email: 'notfound@example.com' };

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(forgotData)
        .expect(404);

      expect(response.body).toEqual({ message: 'Correo no registrado' });
    });

    it('should handle server errors', async () => {
      authController.forgotPassword.mockImplementation((req, res) => {
        res.status(500).json({ message: 'Error al enviar el correo de recuperación' });
      });

      const forgotData = { email: 'test@example.com' };

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(forgotData)
        .expect(500);

      expect(response.body.message).toBe('Error al enviar el correo de recuperación');
    });
  });

  describe('POST /api/auth/reset-password/:token', () => {
    it('should reset password successfully', async () => {
      authController.resetPassword.mockImplementation((req, res) => {
        res.json({ message: 'Contraseña restablecida correctamente' });
      });

      const resetData = { password: 'newPassword123' };

      const response = await request(app)
        .post('/api/auth/reset-password/valid-reset-token')
        .send(resetData)
        .expect(200);

      expect(response.body).toEqual({ message: 'Contraseña restablecida correctamente' });
      expect(authController.resetPassword).toHaveBeenCalled();
    });

    it('should handle invalid reset token', async () => {
      authController.resetPassword.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Token inválido o expirado' });
      });

      const resetData = { password: 'newPassword123' };

      const response = await request(app)
        .post('/api/auth/reset-password/invalid-token')
        .send(resetData)
        .expect(400);

      expect(response.body).toEqual({ message: 'Token inválido o expirado' });
    });

    it('should handle missing password', async () => {
      authController.resetPassword.mockImplementation((req, res) => {
        res.status(400).json({ message: 'La nueva contraseña es requerida' });
      });

      const response = await request(app)
        .post('/api/auth/reset-password/valid-token')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('La nueva contraseña es requerida');
    });
  });

  describe('Route Parameters', () => {
    it('should pass token parameter to reset password controller', async () => {
      const expectedToken = 'test-token-123';
      
      authController.resetPassword.mockImplementation((req, res) => {
        expect(req.params.token).toBe(expectedToken);
        res.json({ message: 'Token received' });
      });

      await request(app)
        .post(`/api/auth/reset-password/${expectedToken}`)
        .send({ password: 'newPassword' })
        .expect(200);

      expect(authController.resetPassword).toHaveBeenCalled();
    });
  });

  describe('Middleware Integration', () => {
    it('should apply validation middleware to register route', async () => {
      authController.register.mockImplementation((req, res) => {
        res.json({ message: 'Registration successful' });
      });

      await request(app)
        .post('/api/auth/register')
        .send({
          correo_electronico: 'test@example.com',
          password: 'password123',
          nombre: 'Test User'
        })
        .expect(200);

      expect(validateFields).toHaveBeenCalled();
    });

    it('should not apply validation middleware to login route', async () => {
      authController.login.mockImplementation((req, res) => {
        res.json({ message: 'Login successful' });
      });

      await request(app)
        .post('/api/auth/login')
        .send({ correo_electronico: 'test@example.com', password: 'password' })
        .expect(200);

      // validateFields should not be called for login route
      expect(validateFields).not.toHaveBeenCalled();
    });
  });

  describe('Request Body Handling', () => {
    it('should handle JSON request bodies correctly', async () => {
      authController.login.mockImplementation((req, res) => {
        expect(req.body.correo_electronico).toBe('test@example.com');
        expect(req.body.password).toBe('password123');
        res.json({ message: 'Body received correctly' });
      });

      await request(app)
        .post('/api/auth/login')
        .send({
          correo_electronico: 'test@example.com',
          password: 'password123'
        })
        .expect(200);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.status).toBe(400);
    });
  });

  describe('HTTP Methods', () => {
    it('should only accept POST requests for auth routes', async () => {
      await request(app)
        .get('/api/auth/login')
        .expect(404);

      await request(app)
        .put('/api/auth/login')
        .expect(404);

      await request(app)
        .delete('/api/auth/login')
        .expect(404);
    });
  });

  describe('Error Handling', () => {
    it('should handle controller exceptions gracefully', async () => {
      authController.login.mockImplementation((req, res) => {
        throw new Error('Controller error');
      });

      await request(app)
        .post('/api/auth/login')
        .send({ correo_electronico: 'test@example.com', password: 'password' })
        .expect(500);
    });

    it('should handle async controller errors', async () => {
      authController.register.mockImplementation(async (req, res) => {
        throw new Error('Async controller error');
      });

      await request(app)
        .post('/api/auth/register')
        .send({
          correo_electronico: 'test@example.com',
          password: 'password123',
          nombre: 'Test'
        })
        .expect(500);
    });
  });

  // Cleanup después de todos los tests
  afterAll((done) => {
    setTimeout(() => {
      done();
    }, 100);
  });
});