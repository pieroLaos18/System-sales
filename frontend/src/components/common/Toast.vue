<template>
  <div class="toast" :class="[`toast-${type}`, { show }]">
    <div class="toast-icon">
      <i :class="iconClass"></i>
    </div>
    <div class="toast-content">
      <p class="toast-message">{{ message }}</p>
    </div>
    <button class="toast-close" @click="$emit('close')">
      <i class="fas fa-times"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'Toast',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'success',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    message: {
      type: String,
      required: true
    }
  },
  
  emits: ['close'],
  
  computed: {
    iconClass() {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      }
      return icons[this.type] || icons.info
    }
  }
}
</script>

<style scoped>
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 300px;
  max-width: 500px;
  border-left: 4px solid;
}

.toast.show {
  transform: translateX(0);
  opacity: 1;
}

.toast-success {
  border-left-color: #10b981;
}

.toast-error {
  border-left-color: #ef4444;
}

.toast-warning {
  border-left-color: #f59e0b;
}

.toast-info {
  border-left-color: #3b82f6;
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-content {
  flex: 1;
}

.toast-message {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  color: #6b7280;
  background: #f3f4f6;
}

@media (max-width: 640px) {
  .toast {
    right: 1rem;
    left: 1rem;
    min-width: auto;
    max-width: none;
  }
}
</style>
