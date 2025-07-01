<template>
  <div :class="['custom-toast', typeClass]" v-if="visible">
    <i v-if="icon" :class="icon" class="toast-icon"></i>
    {{ message }}
  </div>
</template>

<script>
export default {
  name: 'ToastNotification',
  props: {
    message: String,
    type: {
      type: String,
      default: 'default', // 'default', 'warning', 'error', etc.
    },
    icon: {
      type: String,
      default: '', // e.g., 'fas fa-exclamation-triangle'
    },
    visible: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    typeClass() {
      return {
        'toast-warning': this.type === 'warning',
        'toast-error': this.type === 'error',
        'toast-info': this.type === 'info',
        'toast-success': this.type === 'success',
      };
    },
  }
};
</script>

<style scoped>
.custom-toast {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: #333;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.toast-icon {
  font-size: 1.25rem;
}

/* Opcional: estilos por tipo */
.toast-warning {
  background: #ff9800;
}
.toast-error {
  background: #f44336;
}
.toast-success {
  background: #4caf50;
}
.toast-info {
  background: #2196f3;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
