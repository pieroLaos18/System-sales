<template>
  <div class="forgot-page-container">
    <div class="forgot-background-decor"></div>
    <div class="forgot-container glass">
      <div class="forgot-header">
        <div class="forgot-logo">
          <i class="fas fa-unlock-alt"></i>
        </div>
        <h2>¿Olvidaste tu contraseña?</h2>
        <p class="forgot-subtitle">Te enviaremos un enlace para restablecerla</p>
      </div>
      <form @submit.prevent="handleForgot">
        <label for="email">Correo electrónico</label>
        <div class="forgot-input-container">
          <i class="fas fa-envelope"></i>
          <input type="email" v-model="email" required placeholder="Ingresa tu correo" />
        </div>
        <button type="submit" class="forgot-btn">Enviar enlace</button>
        <p v-if="message" class="success">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
      <div class="forgot-extra-links">
        <router-link to="/login">Volver a iniciar sesión</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      email: '',
      message: '',
      error: ''
    };
  },
  methods: {
    async handleForgot() {
      this.message = '';
      this.error = '';
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email: this.email });
        this.message = 'Revisa tu correo para restablecer tu contraseña.';
      } catch (err) {
        this.error = err.response?.data?.message || 'No se pudo enviar el correo.';
      }
    }
  }
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

/* Reset específico para el componente */
.forgot-page-container::before,
.forgot-page-container::after {
  content: none;
  display: none;
}

/* Base styles */
* {
  box-sizing: border-box;
}

/* Remove borders only from form elements within our component */
.forgot-container *,
.forgot-container *::before,
.forgot-container *::after {
  border: none !important;
}

/* Re-apply specific borders where needed */
.error {
  border-left: 4px solid var(--error-color) !important;
}

.success {
  border-left: 4px solid var(--success-color) !important;
}

.forgot-page-container {
  margin: 0;
  padding: 1rem;
  border: none;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow-y: auto; /* ✅ Esto permite scroll */
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}


@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Animated background elements */
.forgot-background-decor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.forgot-background-decor::before,
.forgot-background-decor::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.forgot-background-decor::before {
  width: 300px;
  height: 300px;
  top: -150px;
  left: -150px;
  animation-delay: 0s;
}

.forgot-background-decor::after {
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
.forgot-container {
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

.forgot-container:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 35px 60px -12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* Header styles */
.forgot-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.forgot-logo {
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

.forgot-logo:hover {
  transform: scale(1.1) rotate(5deg);
}

.forgot-logo i {
  font-size: 2rem;
  color: white;
}

.forgot-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.forgot-subtitle {
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

form label {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin-bottom: 0.5rem;
}

.forgot-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.forgot-input-container i {
  position: absolute;
  left: 1rem;
  color: var(--text-light);
  z-index: 2;
  transition: color 0.3s ease;
}

/* Input reset and styles */
.forgot-input-container input {
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

.forgot-input-container input:focus {
  outline: none !important;
  border: none !important;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.forgot-input-container input:focus + i,
.forgot-input-container:focus-within i {
  color: var(--primary-color);
}

.forgot-input-container input::placeholder {
  color: var(--text-light);
}

/* Button styles */
.forgot-btn {
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

.forgot-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.forgot-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
}

.forgot-btn:hover::before {
  left: 100%;
}

.forgot-btn:active {
  transform: translateY(0);
}

/* Message styles */
.success {
  color: #d1fae5;
  background: rgba(16, 185, 129, 0.2);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border-left: 4px solid var(--success-color);
  margin: 0;
  font-size: 0.875rem;
  backdrop-filter: blur(10px);
}

.error {
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

/* Extra links */
.forgot-extra-links {
  text-align: center;
  margin-top: 1.5rem;
}

.forgot-extra-links a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.forgot-extra-links a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: white;
  transition: width 0.3s ease;
}

.forgot-extra-links a:hover {
  color: white;
  transform: translateY(-1px);
}

.forgot-extra-links a:hover::after {
  width: 100%;
}

/* Responsive design */
/* Extra small devices (portrait phones, less than 576px) */
@media (max-width: 575.98px) {
  .forgot-page-container {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
  
  .forgot-container {
    padding: 1.5rem 1rem;
    border-radius: 16px;
    max-width: 100%;
    margin: 0 0.5rem;
  }
  
  .forgot-header {
    margin-bottom: 1.5rem;
  }
  
  .forgot-logo {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    margin-bottom: 1rem;
  }
  
  .forgot-logo i {
    font-size: 1.25rem;
  }
  
  .forgot-header h2 {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
  
  .forgot-subtitle {
    font-size: 0.875rem;
  }
  
  form label {
    font-size: 0.75rem;
  }
  
  .forgot-input-container input {
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    font-size: 0.875rem;
  }
  
  .forgot-input-container i {
    left: 0.75rem;
    font-size: 0.875rem;
  }
  
  .forgot-btn {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
  
  .forgot-extra-links a {
    font-size: 0.75rem;
  }
}

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) and (max-width: 767.98px) {
  .forgot-page-container {
    padding: 1rem;
    align-items: flex-start;
    padding-top: 3rem;
  }
  
  .forgot-container {
    padding: 2rem 1.5rem;
    border-radius: 20px;
    max-width: 400px;
  }
  
  .forgot-logo {
    width: 60px;
    height: 60px;
    border-radius: 16px;
  }
  
  .forgot-logo i {
    font-size: 1.5rem;
  }
  
  .forgot-header h2 {
    font-size: 1.75rem;
  }
  
  .forgot-input-container input {
    padding: 0.875rem 0.875rem 0.875rem 2.75rem;
  }
  
  .forgot-btn {
    padding: 0.875rem 1rem;
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) and (max-width: 991.98px) {
  .forgot-page-container {
    padding: 1.5rem;
  }
  
  .forgot-container {
    padding: 2.5rem 2rem;
    border-radius: 24px;
    max-width: 450px;
  }
  
  .forgot-logo {
    width: 70px;
    height: 70px;
    border-radius: 18px;
  }
  
  .forgot-logo i {
    font-size: 1.75rem;
  }
  
  .forgot-header h2 {
    font-size: 1.875rem;
  }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) and (max-width: 1199.98px) {
  .forgot-page-container {
    padding: 2rem;
  }
  
  .forgot-container {
    padding: 3rem 2.5rem;
    border-radius: 24px;
    max-width: 480px;
  }
  
  .forgot-logo {
    width: 80px;
    height: 80px;
    border-radius: 20px;
  }
  
  .forgot-logo i {
    font-size: 2rem;
  }
  
  .forgot-header h2 {
    font-size: 2rem;
  }
}

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
  .forgot-page-container {
    padding: 2rem;
  }
  
  .forgot-container {
    padding: 3.5rem 3rem;
    border-radius: 28px;
    max-width: 520px;
  }
  
  .forgot-logo {
    width: 90px;
    height: 90px;
    border-radius: 22px;
    margin-bottom: 2rem;
  }
  
  .forgot-logo i {
    font-size: 2.25rem;
  }
  
  .forgot-header {
    margin-bottom: 3rem;
  }
  
  .forgot-header h2 {
    font-size: 2.25rem;
    margin-bottom: 0.75rem;
  }
  
  .forgot-subtitle {
    font-size: 1.125rem;
  }
  
  form {
    gap: 1.75rem;
  }
  
  form label {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
  
  .forgot-input-container input {
    padding: 1.25rem 1.25rem 1.25rem 3.5rem;
    font-size: 1.125rem;
  }
  
  .forgot-input-container i {
    left: 1.25rem;
    font-size: 1.125rem;
  }
  
  .forgot-btn {
    padding: 1.25rem 2rem;
    font-size: 1.125rem;
  }
  
  .forgot-extra-links {
    margin-top: 2rem;
  }
  
  .forgot-extra-links a {
    font-size: 1rem;
  }
}

/* Ultra wide screens (1400px and up) */
@media (min-width: 1400px) {
  .forgot-container {
    max-width: 580px;
    padding: 4rem 3.5rem;
  }
  
  .forgot-logo {
    width: 100px;
    height: 100px;
    border-radius: 24px;
  }
  
  .forgot-logo i {
    font-size: 2.5rem;
  }
  
  .forgot-header h2 {
    font-size: 2.5rem;
  }
}

/* Landscape orientation adjustments */
@media (orientation: landscape) and (max-height: 600px) {
  .forgot-page-container {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 1rem;
  }
  
  .forgot-container {
    margin: 0;
    padding: 1.5rem 2rem;
    max-width: 90vw;
    width: 100%;
    max-width: 500px;
  }
  
  .forgot-header {
    margin-bottom: 1rem;
  }
  
  .forgot-logo {
    width: 50px;
    height: 50px;
    margin-bottom: 0.5rem;
  }
  
  .forgot-header h2 {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
  
  .forgot-subtitle {
    font-size: 0.875rem;
  }
  
  form {
    gap: 1rem;
  }
  
  .forgot-extra-links {
    margin-top: 1rem;
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .forgot-logo,
  .forgot-input-container,
  .forgot-btn {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .forgot-container {
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .forgot-input-container input {
    background: rgba(31, 41, 55, 0.8);
    color: white;
  }
  
  .forgot-input-container input::placeholder {
    color: #9ca3af;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .forgot-page-container,
  .forgot-container,
  .forgot-logo,
  .forgot-background-decor::before,
  .forgot-background-decor::after {
    animation: none;
  }
  
  .forgot-container:hover,
  .forgot-btn:hover,
  .forgot-input-container input:focus {
    transform: none;
  }
}

/* Focus styles for accessibility */
.forgot-btn:focus-visible,
.forgot-input-container input:focus-visible,
.forgot-extra-links a:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}
</style>