<template>
  <div class="verificar-container">
    <div class="verificar-box">
      <h2>Verificación de Cuenta</h2>

      <div v-if="loading">Verificando tu cuenta, por favor espera...</div>

      <div v-if="success" class="success">
        {{ success }}<br />
        Serás redirigido en breve...
      </div>

      <div v-if="error" class="error">
        {{ error }}
        <div v-if="allowResend">
          <button @click="reenviarCorreo" class="resend-btn">Reenviar verificación</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/services/api';

export default {
  data() {
    return {
      success: null,
      error: null,
      loading: true,
      allowResend: false,
      email: null, // Se obtendrá desde el backend si es posible
    };
  },
  async mounted() {
    const token = this.$route.query.token;
    console.log('🔐 Token capturado desde URL:', token);

    if (!token || typeof token !== 'string') {
      this.error = 'Token no válido o faltante.';
      this.loading = false;
      return;
    }

    try {
      const response = await axios.post('/auth/verificar', { token });
      this.success = response.data.message;
      this.loading = false;

      setTimeout(() => {
        this.$router.push('/login');
      }, 3000);
    } catch (err) {
      console.error('❌ Error al verificar:', err);
      this.error = err.response?.data?.message || 'Ocurrió un error al verificar la cuenta.';
      this.loading = false;

      // Si el error es por token expirado, permitimos reenviar
      if (
        this.error.toLowerCase().includes('expirado') ||
        this.error.toLowerCase().includes('inválido')
      ) {
        this.allowResend = true;
      }
    }
  },
  methods: {
    async reenviarCorreo() {
      try {
        const email = prompt('Ingresa tu correo electrónico para reenviar el enlace de verificación:');
        if (!email) return;

        const response = await axios.post('/auth/reenviar-verificacion', { correo_electronico: email });
        this.success = response.data.message;
        this.error = null;
        this.allowResend = false;
      } catch (err) {
        this.error = err.response?.data?.message || 'No se pudo reenviar el correo.';
        this.success = null;
      }
    },
  },
};
</script>

<style scoped>
.verificar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f7f7f7;
}

.verificar-box {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 10px #ccc;
  text-align: center;
  max-width: 400px;
}

.success {
  color: green;
  margin-top: 1rem;
}

.error {
  color: red;
  margin-top: 1rem;
}

.resend-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.resend-btn:hover {
  background-color: #135ba1;
}
</style>
