<template>
  <div class="reset-page-container">
    <div class="reset-background-decor"></div>
    <div class="reset-container glass">
      <div class="reset-header">
        <div class="reset-logo">
          <i class="fas fa-key"></i>
        </div>
        <h2>Restablecer contraseña</h2>
      </div>
      <form @submit.prevent="handleReset">
        <label for="password">Nueva contraseña:</label>
        <div class="reset-input-container">
          <i class="fas fa-lock"></i>
          <input
            type="password"
            v-model="password"
            required
            placeholder="Nueva contraseña"
            autocomplete="new-password"
          />
        </div>
        <button type="submit" class="reset-btn enhanced-btn">Restablecer</button>
        <p v-if="message" class="success">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
      <button class="login-link" @click="goToLogin">Ir al inicio de sesión</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      password: '',
      message: '',
      error: '',
      token: ''
    };
  },
  mounted() {
    this.token = this.$route.params.token;
  },
  methods: {
    async handleReset() {
      this.message = '';
      this.error = '';
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${this.token}`, {
          password: this.password
        });
        this.message = '¡Contraseña restablecida! Ahora puedes iniciar sesión.';
        this.password = '';
      } catch (err) {
        this.error = err.response?.data?.message || 'No se pudo restablecer la contraseña.';
      }
    },
    goToLogin() {
      this.$router.push('/login');
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
.reset-page-container::before,
.reset-page-container::after {
  content: none;
  display: none;
}

/* Base styles */
* {
  box-sizing: border-box;
}

/* Remove borders only from form elements within our component */
.reset-container *,
.reset-container *::before,
.reset-container *::after {
  border: none !important;
}

/* Re-apply specific borders where needed */
.error {
  border-left: 4px solid var(--error-color) !important;
}

.success {
  border-left: 4px solid var(--success-color) !important;
}

.reset-page-container {
  margin: 0;
  padding: 1rem;
  border: none;
  width: 100%;
  min-height: 100vh;
  min-height: -webkit-fill-available;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow-x: hidden;
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
.reset-background-decor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.reset-background-decor::before,
.reset-background-decor::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.reset-background-decor::before {
  width: 300px;
  height: 300px;
  top: -150px;
  left: -150px;
  animation-delay: 0s;
}

.reset-background-decor::after {
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
.reset-container {
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

.reset-container:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 35px 60px -12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* Header styles */
.reset-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.reset-logo {
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

.reset-logo:hover {
  transform: scale(1.1) rotate(5deg);
}

.reset-logo i {
  font-size: 2rem;
  color: white;
}

.reset-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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

.reset-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.reset-input-container i {
  position: absolute;
  left: 1rem;
  color: var(--text-light);
  z-index: 2;
  transition: color 0.3s ease;
}

/* Input reset and styles */
.reset-input-container input {
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

.reset-input-container input:focus {
  outline: none !important;
  border: none !important;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.reset-input-container input:focus + i,
.reset-input-container:focus-within i {
  color: var(--primary-color);
}

.reset-input-container input::placeholder {
  color: var(--text-light);
}

/* Button styles */
.reset-btn {
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

.reset-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
}

.reset-btn:hover::before {
  left: 100%;
}

.reset-btn:active {
  transform: translateY(0);
}

/* Login link button */
.login-link {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  backdrop-filter: blur(10px);
}

.login-link:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
  transform: translateY(-1px);
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

/* Responsive design */
/* Extra small devices (portrait phones, less than 576px) */
@media (max-width: 575.98px) {
  .reset-page-container {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
  
  .reset-container {
    padding: 1.5rem 1rem;
    border-radius: 16px;
    max-width: 100%;
    margin: 0 0.5rem;
  }
  
  .reset-header {
    margin-bottom: 1.5rem;
  }
  
  .reset-logo {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    margin-bottom: 1rem;
  }
  
  .reset-logo i {
    font-size: 1.25rem;
  }
  
  .reset-header h2 {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
  
  form label {
    font-size: 0.75rem;
  }
  
  .reset-input-container input {
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    font-size: 0.875rem;
  }
  
  .reset-input-container i {
    left: 0.75rem;
    font-size: 0.875rem;
  }
  
  .reset-btn {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
  
  .login-link {
    padding: 0.625rem 1rem;
    font-size: 0.75rem;
  }
}

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) and (max-width: 767.98px) {
  .reset-page-container {
    padding: 1rem;
    align-items: flex-start;
    padding-top: 3rem;
  }
  
  .reset-container {
    padding: 2rem 1.5rem;
    border-radius: 20px;
    max-width: 400px;
  }
  
  .reset-logo {
    width: 60px;
    height: 60px;
    border-radius: 16px;
  }
  
  .reset-logo i {
    font-size: 1.5rem;
  }
  
  .reset-header h2 {
    font-size: 1.75rem;
  }
  
  .reset-input-container input {
    padding: 0.875rem 0.875rem 0.875rem 2.75rem;
  }
  
  .reset-btn {
    padding: 0.875rem 1rem;
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) and (max-width: 991.98px) {
  .reset-page-container {
    padding: 1.5rem;
  }
  
  .reset-container {
    padding: 2.5rem 2rem;
    border-radius: 24px;
    max-width: 450px;
  }
  
  .reset-logo {
    width: 70px;
    height: 70px;
    border-radius: 18px;
  }
  
  .reset-logo i {
    font-size: 1.75rem;
  }
  
  .reset-header h2 {
    font-size: 1.875rem;
  }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) and (max-width: 1199.98px) {
  .reset-page-container {
    padding: 2rem;
  }
  
  .reset-container {
    padding: 3rem 2.5rem;
    border-radius: 24px;
    max-width: 480px;
  }
  
  .reset-logo {
    width: 80px;
    height: 80px;
    border-radius: 20px;
  }
  
  .reset-logo i {
    font-size: 2rem;
  }
  
  .reset-header h2 {
    font-size: 2rem;
  }
}

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
  .reset-page-container {
    padding: 2rem;
  }
  
  .reset-container {
    padding: 3.5rem 3rem;
    border-radius: 28px;
    max-width: 520px;
  }
  
  .reset-logo {
    width: 90px;
    height: 90px;
    border-radius: 22px;
    margin-bottom: 2rem;
  }
  
  .reset-logo i {
    font-size: 2.25rem;
  }
  
  .reset-header {
    margin-bottom: 3rem;
  }
  
  .reset-header h2 {
    font-size: 2.25rem;
    margin-bottom: 0.75rem;
  }
  
  form {
    gap: 1.75rem;
  }
  
  form label {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
  
  .reset-input-container input {
    padding: 1.25rem 1.25rem 1.25rem 3.5rem;
    font-size: 1.125rem;
  }
  
  .reset-input-container i {
    left: 1.25rem;
    font-size: 1.125rem;
  }
  
  .reset-btn {
    padding: 1.25rem 2rem;
    font-size: 1.125rem;
  }
  
  .login-link {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
}

/* Ultra wide screens (1400px and up) */
@media (min-width: 1400px) {
  .reset-container {
    max-width: 580px;
    padding: 4rem 3.5rem;
  }
  
  .reset-logo {
    width: 100px;
    height: 100px;
    border-radius: 24px;
  }
  
  .reset-logo i {
    font-size: 2.5rem;
  }
  
  .reset-header h2 {
    font-size: 2.5rem;
  }
}

/* Landscape orientation adjustments */
@media (orientation: landscape) and (max-height: 600px) {
  .reset-page-container {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 1rem;
  }
  
  .reset-container {
    margin: 0;
    padding: 1.5rem 2rem;
    max-width: 90vw;
    width: 100%;
    max-width: 500px;
  }
  
  .reset-header {
    margin-bottom: 1rem;
  }
  
  .reset-logo {
    width: 50px;
    height: 50px;
    margin-bottom: 0.5rem;
  }
  
  .reset-header h2 {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
  
  form {
    gap: 1rem;
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .reset-logo,
  .reset-input-container,
  .reset-btn,
  .login-link {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .reset-container {
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .reset-input-container input {
    background: rgba(31, 41, 55, 0.8);
    color: white;
  }
  
  .reset-input-container input::placeholder {
    color: #9ca3af;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .reset-page-container,
  .reset-container,
  .reset-logo,
  .reset-background-decor::before,
  .reset-background-decor::after {
    animation: none;
  }
  
  .reset-container:hover,
  .reset-btn:hover,
  .login-link:hover,
  .reset-input-container input:focus {
    transform: none;
  }
}

/* Focus styles for accessibility */
.reset-btn:focus-visible,
.login-link:focus-visible,
.reset-input-container input:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}
</style>

