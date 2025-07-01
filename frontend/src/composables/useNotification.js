// Composable para notificaciones toast
import { ref } from 'vue'

export function useNotification() {
  const toast = ref({
    show: false,
    type: 'success', // success, error, warning, info
    message: '',
    duration: 3000
  })

  let timeoutId = null

  const showToast = (type, message, duration = 3000) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    toast.value = {
      show: true,
      type,
      message,
      duration
    }

    // Auto hide after duration
    timeoutId = setTimeout(() => {
      hideToast()
    }, duration)
  }

  const hideToast = () => {
    toast.value.show = false
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return {
    toast,
    showToast,
    hideToast
  }
}
