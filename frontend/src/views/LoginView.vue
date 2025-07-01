<!-- Vista de Login principal, muestra el formulario de inicio de sesión -->

<template>
  <!-- Vista de Login principal - contenedor limpio -->
  <div class="login-view">
    <LoginForm />
  </div>
</template>

<script>
import LoginForm from '../components/LoginForm.vue';

export default {
  name: 'LoginView',
  components: {
    LoginForm,
  },
  
  // Metadata de la vista
  meta: {
    title: 'Iniciar Sesión',
    requiresAuth: false,
  },
};
</script>

<style scoped>
/* Vista contenedor - sin estilos específicos ya que LoginForm maneja su propio layout */
.login-view {
  /* El componente LoginForm maneja todo el styling y layout */
  width: 100%;
  height: 100vh;
}

/* Reset de estilos que podrían interferir con el LoginForm */
.login-view * {
  box-sizing: border-box;
}
</style>