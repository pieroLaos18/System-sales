<!-- Componente de formulario de inicio de sesión -->

<style scoped src="@/assets/css/loginform.css"></style>

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

    console.log('Usuario recibido:', response.data.user);

    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userName', response.data.user.name);
    localStorage.setItem('userId', response.data.user.id);
    localStorage.setItem('userEmail', response.data.user.email);
    localStorage.setItem('userRole', response.data.user.rol.toLowerCase());

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
