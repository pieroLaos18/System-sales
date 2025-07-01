<template>
  <div class="page-container">
    <div class="background-decor"></div>
    <div class="login-container glass">
      <div class="login-header">
        <div class="login-logo enhanced-logo">
          <i class="fas fa-store"></i>
        </div>
        <h1>Bienvenido</h1>
        <p class="subtitle">Inicia sesión para continuar</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <div class="input-container enhanced-input">
            <i class="fas fa-envelope"></i>
            <input type="email" id="email" v-model="email" placeholder="Ingresa tu correo" required />
          </div>
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="input-container enhanced-input">
            <i class="fas fa-lock"></i>
            <input type="password" id="password" v-model="password" placeholder="Ingresa tu contraseña" required />
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-login enhanced-btn">Iniciar Sesión</button>
        </div>
        <p v-if="error" class="login-error">{{ error }}</p>
        <div v-if="showResend" class="resend-container">
  <button
    @click="reenviarVerificacion"
    :disabled="resendCooldown > 0"
    class="btn-login resend-btn"
  >
    {{ resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar correo de verificación' }}
  </button>
  <p v-if="resendMessage" class="resend-message">{{ resendMessage }}</p>
</div>
        <div class="extra-links">
          <a href="/forgot-password" class="forgot-password">¿Olvidaste tu contraseña?</a>
          <span>·</span>
          <a href="/register" class="register-link">Crear cuenta</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
// Importa axios para realizar la petición de login
import axios from 'axios';

export default {
  data() {
  return {
    email: '',
    password: '',
    error: '',
    showResend: false,
    resendMessage: '',
    resendCooldown: 0,
    resendInterval: null,
  };
},
  watch: {
    // Limpia el error al modificar el email o la contraseña
    email() { this.error = ''; },
    password() { this.error = ''; }
  },
  methods: {
    // Maneja el envío del formulario de login
    async handleLogin() {
  this.error = '';
  this.resendMessage = '';
  this.showResend = false;

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      correo_electronico: this.email,
      password: this.password,
    });
const user = response.data.user;

localStorage.setItem('authToken', response.data.token);
localStorage.setItem('userName', user.name);
localStorage.setItem('userId', user.id);
localStorage.setItem('userEmail', user.email);
localStorage.setItem('userRole', user.rol.toLowerCase());
localStorage.setItem('userImage', user.image || '');

    const rol = response.data.user.rol?.toLowerCase();
    if (rol === 'admin' || rol === 'supervisor') {
      this.$router.push('/main/dashboard');
    } else if (rol === 'cajero') {
      this.$router.push('/main/sales');
    } else if (rol === 'almacenero') {
      this.$router.push('/main/products');
    } else {
      this.$router.push('/main/dashboard');
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Error al iniciar sesión';
    this.error = message;

    if (message.toLowerCase().includes('verificada')) {
      this.showResend = true;
    }
  }
},
async reenviarVerificacion() {
  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reenviar-verificacion`, {
      correo_electronico: this.email,
    });

    this.resendMessage = 'Correo reenviado. Revisa tu bandeja de entrada.';
    this.resendCooldown = 30;

    this.resendInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendInterval);
      }
    }, 1000);
  } catch (err) {
    this.resendMessage = 'Error al reenviar correo. Intenta más tarde.';
  }
}

  },
};
</script>

<style scoped>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* CSS Variables for consistent theming */
:root {
  --primary-color: #6366f1;
  --primary-dark: #4f46e5;
  --primary-light: #8b5cf6;
  --secondary-color: #f59e0b;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-light: #9ca3af;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --border-color: #e5e7eb;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Base styles */
* {
  box-sizing: border-box;
}

/* Reset for page container */
.page-container {
  margin: 0;
  padding: 0;
  border: none;
}

/* Remove borders only from form elements within our component */
.login-container *,
.login-container *::before,
.login-container *::after {
  border: none !important;
}

/* Re-apply specific borders where needed */
.login-error {
  border-left: 4px solid var(--error-color) !important;
}

.page-container {
  min-height: 100vh;
  min-height: -webkit-fill-available; /* iOS Safari fix */
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  width: 100%;
  padding: 1rem;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Animated background elements */
.background-decor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.background-decor::before,
.background-decor::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.background-decor::before {
  width: 300px;
  height: 300px;
  top: -150px;
  left: -150px;
  animation-delay: 0s;
}

.background-decor::after {
  width: 200px;
  height: 200px;
  bottom: -100px;
  right: -100px;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-30px) rotate(120deg); }
  66% { transform: translateY(30px) rotate(240deg); }
}

/* Glass morphism container */
.login-container {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: none;
  border-radius: 24px;
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 420px;
  min-width: 280px;
  position: relative;
  z-index: 1;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  animation: slideUp 0.6s ease-out;
  margin: auto;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-container:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 35px 60px -12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* Header styles */
.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border-radius: 20px;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.login-logo:hover {
  transform: scale(1.1) rotate(5deg);
}

.login-logo i {
  font-size: 2rem;
  color: white;
}

.login-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 400;
}

/* Form styles */
form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-container i {
  position: absolute;
  left: 1rem;
  color: var(--text-light);
  z-index: 2;
  transition: color 0.3s ease;
}

/* Input reset and styles */
.input-container input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: none !important;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  outline: none !important;
}

/* Remove any possible browser defaults */
.input-container input::-webkit-inner-spin-button,
.input-container input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-container input[type="email"],
.input-container input[type="password"] {
  border: none !important;
  outline: none !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.input-container input:focus {
  outline: none !important;
  border: none !important;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.input-container input:focus + i,
.input-container:focus-within i {
  color: var(--primary-color);
}

.input-container input::placeholder {
  color: var(--text-light);
}

/* Button styles */
.btn-login {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.btn-login::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
}

.btn-login:hover::before {
  left: 100%;
}

.btn-login:active {
  transform: translateY(0);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Error message */
.login-error {
  color: #fee2e2;
  background: rgba(239, 68, 68, 0.2);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border-left: 4px solid var(--error-color);
  margin: 0;
  font-size: 0.875rem;
  backdrop-filter: blur(10px);
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Resend container */
.resend-container {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.resend-btn {
  background: linear-gradient(135deg, var(--success-color), #059669);
  font-size: 0.875rem;
  padding: 0.75rem 1.5rem;
}

.resend-message {
  margin: 0.75rem 0 0 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
}

/* Extra links */
.extra-links {
  text-align: center;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.extra-links a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.extra-links a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: white;
  transition: width 0.3s ease;
}

.extra-links a:hover {
  color: white;
  transform: translateY(-1px);
}

.extra-links a:hover::after {
  width: 100%;
}

.extra-links span {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

/* Responsive design */
/* Extra small devices (portrait phones, less than 576px) */
@media (max-width: 575.98px) {
  .page-container {
    padding: 0.5rem;
    min-height: 100vh;
    min-height: -webkit-fill-available; /* iOS Safari fix */
  }
  
  .login-container {
    padding: 1.5rem 1rem;
    border-radius: 16px;
    max-width: 100%;
    margin: 0 0.5rem;
    min-height: auto;
  }
  
  .login-header {
    margin-bottom: 1.5rem;
  }
  
  .login-logo {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    margin-bottom: 1rem;
  }
  
  .login-logo i {
    font-size: 1.25rem;
  }
  
  .login-header h1 {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
  
  .subtitle {
    font-size: 0.875rem;
  }
  
  .form-group label {
    font-size: 0.75rem;
  }
  
  .input-container input {
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    font-size: 0.875rem;
  }
  
  .input-container i {
    left: 0.75rem;
    font-size: 0.875rem;
  }
  
  .btn-login {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
  
  .extra-links {
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  
  .extra-links span {
    display: none;
  }
  
  .extra-links a {
    font-size: 0.75rem;
  }
}

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) and (max-width: 767.98px) {
  .page-container {
    padding: 1rem;
  }
  
  .login-container {
    padding: 2rem 1.5rem;
    border-radius: 20px;
    max-width: 400px;
  }
  
  .login-logo {
    width: 60px;
    height: 60px;
    border-radius: 16px;
  }
  
  .login-logo i {
    font-size: 1.5rem;
  }
  
  .login-header h1 {
    font-size: 1.75rem;
  }
  
  .input-container input {
    padding: 0.875rem 0.875rem 0.875rem 2.75rem;
  }
  
  .btn-login {
    padding: 0.875rem 1rem;
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) and (max-width: 991.98px) {
  .page-container {
    padding: 1.5rem;
  }
  
  .login-container {
    padding: 2.5rem 2rem;
    border-radius: 24px;
    max-width: 450px;
  }
  
  .login-logo {
    width: 70px;
    height: 70px;
    border-radius: 18px;
  }
  
  .login-logo i {
    font-size: 1.75rem;
  }
  
  .login-header h1 {
    font-size: 1.875rem;
  }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) and (max-width: 1199.98px) {
  .page-container {
    padding: 2rem;
  }
  
  .login-container {
    padding: 3rem 2.5rem;
    border-radius: 24px;
    max-width: 480px;
  }
  
  .login-logo {
    width: 80px;
    height: 80px;
    border-radius: 20px;
  }
  
  .login-logo i {
    font-size: 2rem;
  }
  
  .login-header h1 {
    font-size: 2rem;
  }
}

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
  .page-container {
    padding: 2rem;
  }
  
  .login-container {
    padding: 3.5rem 3rem;
    border-radius: 28px;
    max-width: 520px;
  }
  
  .login-logo {
    width: 90px;
    height: 90px;
    border-radius: 22px;
    margin-bottom: 2rem;
  }
  
  .login-logo i {
    font-size: 2.25rem;
  }
  
  .login-header {
    margin-bottom: 3rem;
  }
  
  .login-header h1 {
    font-size: 2.25rem;
    margin-bottom: 0.75rem;
  }
  
  .subtitle {
    font-size: 1.125rem;
  }
  
  .form-group {
    gap: 0.75rem;
  }
  
  .form-group label {
    font-size: 1rem;
  }
  
  .input-container input {
    padding: 1.25rem 1.25rem 1.25rem 3.5rem;
    font-size: 1.125rem;
  }
  
  .input-container i {
    left: 1.25rem;
    font-size: 1.125rem;
  }
  
  .btn-login {
    padding: 1.25rem 2rem;
    font-size: 1.125rem;
  }
  
  .extra-links {
    margin-top: 2rem;
    gap: 1rem;
  }
  
  .extra-links a {
    font-size: 1rem;
  }
}

/* Ultra wide screens (1400px and up) */
@media (min-width: 1400px) {
  .login-container {
    max-width: 580px;
    padding: 4rem 3.5rem;
  }
  
  .login-logo {
    width: 100px;
    height: 100px;
    border-radius: 24px;
  }
  
  .login-logo i {
    font-size: 2.5rem;
  }
  
  .login-header h1 {
    font-size: 2.5rem;
  }
}

/* Landscape orientation adjustments */
@media (orientation: landscape) and (max-height: 600px) {
  .page-container {
    padding: 0.5rem;
    align-items: flex-start;
    justify-content: center;
    padding-top: 1rem;
  }
  
  .login-container {
    margin: 0;
    padding: 1.5rem 2rem;
    max-width: 90vw;
    width: 100%;
    max-width: 500px;
  }
  
  .login-header {
    margin-bottom: 1rem;
  }
  
  .login-logo {
    width: 50px;
    height: 50px;
    margin-bottom: 0.5rem;
  }
  
  .login-header h1 {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
  
  .subtitle {
    font-size: 0.875rem;
  }
  
  form {
    gap: 1rem;
  }
  
  .extra-links {
    margin-top: 1rem;
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .login-logo,
  .input-container,
  .btn-login {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .login-container {
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .input-container input {
    background: rgba(31, 41, 55, 0.8);
    color: white;
  }
  
  .input-container input::placeholder {
    color: #9ca3af;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .page-container,
  .login-container,
  .login-logo,
  .background-decor::before,
  .background-decor::after {
    animation: none;
  }
  
  .login-container:hover,
  .btn-login:hover,
  .input-container input:focus {
    transform: none;
  }
}

/* Focus styles for accessibility */
.btn-login:focus-visible,
.input-container input:focus-visible,
.extra-links a:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}
</style>
