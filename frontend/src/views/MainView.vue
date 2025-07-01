<template>
  
  <div class="main-container">
    
    <!-- Sidebar -->
    <Sidebar :visible="isSidebarVisible" :isSmallScreen="isSmallScreen" :role="currentUserRole" :userName="userName" :userImage="fullUserImage" @toggle="toggleSidebar" />
    <!-- Contenedor de contenido principal -->
    <div :class="['content-wrapper', { 'collapsed': !isSidebarVisible }]">
      <AppBar
        :title="pageTitle"
        :theme="theme"
        :notificationCount="notificationCount"
        :fullUserImage="fullUserImage"
        :userName="userName"
        :isSidebarCollapsed="!isSidebarVisible"
        @open-notifications="openNotifications"
        @toggle-theme="toggleTheme"
        @logout="logout"
        @show-profile="showProfileModal = true"
      />
      <!-- Main Content -->
      <div class="main-content">
        <div class="dashboard-inner">
          <router-view @set-title="setPageTitle"></router-view>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <InactivityModal v-if="showInactivityModal" @continue="confirmActivity" />
    <NotificationModal v-if="showNotifications" :visible="showNotifications" :lowStockProducts="lowStockProducts" @close="() => showNotifications = false" @edit="goToEditProduct" />
    <UserProfileModal 
      v-if="showProfileModal" 
      @close="() => showProfileModal = false"
      @profile-updated="onProfileUpdated"
    />

    <!-- Toasts -->
    <ToastNotification :visible="toastVisible" :message="toastMessage" type="warning" icon="fas fa-exclamation-triangle" />
    <ToastNotification :visible="toast.show" :message="toast.message" />
  </div>
  
</template>

<script>
import Sidebar from '@/components/layout/Sidebar.vue';
import AppBar from '@/components/layout/AppBar.vue';
import NotificationModal from '@/components/modals/NotificationModal.vue';
import InactivityModal from '@/components/modals/InactivityModal.vue';
import UserProfileModal from '@/components/UserProfileModal.vue';
import ToastNotification from '@/components/layout/ToastNotification.vue';
import defaultUserImage from '@/assets/images/profile.png';
import axios from 'axios';
import api from '@/services/api';

export default {
  components: {
    Sidebar,
    AppBar,
    NotificationModal,
    InactivityModal,
    UserProfileModal,
    ToastNotification
  },
  data() {
    return {
      isSidebarVisible: true,
      userName: '',
      userImage: '',
      defaultImage: defaultUserImage,
      isSmallScreen: false,
      notificationCount: 3,
      theme: 'light',
      inactivityTimer: null,
      warningTimer: null,
      showInactivityModal: false,
      inactivityLimit: 10 * 60 * 1000,
      warningLimit: 5 * 60 * 1000,
      showNotifications: false,
      lowStockProducts: [],
      notificationInterval: null,
      toastVisible: false,
      toastMessage: '',
      pageTitle: '',
      showProfileModal: false,
      lastActivity: Date.now(),
      warningShown: false,
      logoutTimer: null,
      toast: {
        show: false,
        message: '',
        timeout: null
      }
    };
  },
  computed: {
    currentUserRole() {
      return (localStorage.getItem('userRole') || '').toLowerCase();
    },
    fullUserImage() {
      // Usar datos reactivos primero, luego localStorage como fallback
      const image = this.userImage || localStorage.getItem('userImage');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      console.log('🔄 Generando fullUserImage:', { 
        image, 
        apiUrl, 
        reactiveUserImage: this.userImage 
      });
      
      if (!image || image === 'null' || image === 'undefined' || image === '') {
        return this.defaultImage;
      }
      
      // Si la imagen ya es una URL completa (http/https), usarla directamente
      if (image.startsWith('http://') || image.startsWith('https://')) {
        return image;
      }
      
      // Si la imagen ya incluye /uploads/, construir URL completa
      if (image.startsWith('/uploads/')) {
        return `${apiUrl}${image}`;
      }
      
      // Si es solo el nombre del archivo, añadir la ruta completa
      return `${apiUrl}/uploads/${image}`;
    }
  },
  created() {
    // Cargar datos del usuario de localStorage
    this.userName = localStorage.getItem('userName') || 'Usuario';
    this.userImage = localStorage.getItem('userImage') || this.defaultImage;
    
    console.log('👤 Datos del usuario cargados en MainView:', {
      userName: this.userName,
      userImage: this.userImage,
      fullUserImage: this.fullUserImage
    });
    
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
    this.updateLowStockNotifications();
    this.notificationInterval = setInterval(this.updateLowStockNotifications, 30000);
  },
  mounted() {
    this.resetInactivityTimer();
    ['mousemove', 'keydown', 'click'].forEach(event => {
      window.addEventListener(event, this.resetInactivityTimer);
    });
    this.activeCheckInterval = setInterval(this.updateUserActivity, 60000);
    this.userActiveInterval = setInterval(this.checkUserActive, 1000);
  },
  beforeUnmount() {
    ['mousemove', 'keydown', 'click'].forEach(event => {
      window.removeEventListener(event, this.resetInactivityTimer);
    });
    clearTimeout(this.inactivityTimer);
    clearTimeout(this.warningTimer);
    clearInterval(this.notificationInterval);
    clearInterval(this.activeCheckInterval);
    clearInterval(this.userActiveInterval);
  },
  methods: {
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    checkScreenSize() {
      const wasSmallScreen = this.isSmallScreen;
      this.isSmallScreen = window.innerWidth <= 1024;
      
      // Solo cambiar el estado del sidebar si es la primera vez o si cambió el tipo de pantalla
      if (wasSmallScreen !== this.isSmallScreen) {
        if (this.isSmallScreen) {
          // Al cambiar a pantalla pequeña, colapsar el sidebar
          this.isSidebarVisible = false;
        } else {
          // Al cambiar a pantalla grande, expandir el sidebar
          this.isSidebarVisible = true;
        }
      }
    },
    async logout() {
      try {
        const token = localStorage.getItem('authToken');
        await axios.post('/api/users/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {}
      localStorage.clear();
      this.$router.push('/login');
    },
    toggleTheme() {
      const newTheme = this.theme === 'light' ? 'dark' : 'light';
      this.setTheme(newTheme);
    },
    setTheme(theme) {
      this.theme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    },
    resetInactivityTimer() {
      clearTimeout(this.inactivityTimer);
      clearTimeout(this.warningTimer);
      this.startInactivityTimers();
      if (this.showInactivityModal) this.showInactivityModal = false;
    },
    startInactivityTimers() {
      this.warningTimer = setTimeout(() => {
        this.showInactivityModal = true;
        this.warningShown = true;
      }, this.warningLimit);
      this.inactivityTimer = setTimeout(() => {
        this.logout();
        this.showToast('Sesión cerrada por inactividad.');
      }, this.inactivityLimit);
    },
    confirmActivity() {
      this.showInactivityModal = false;
      this.resetInactivityTimer();
    },
    async openNotifications() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const products = await res.json();
        this.lowStockProducts = Array.isArray(products) ? products.filter(p => p.stock <= p.stock_min) : [];
        this.notificationCount = this.lowStockProducts.length;
        console.log('openNotifications called, lowStockProducts:', this.lowStockProducts);
        this.showNotifications = true;
      } catch (e) {
        this.lowStockProducts = [];
        this.notificationCount = 0;
        this.showNotifications = true;
        console.error('Error fetching products:', e);
      }
    },
    async updateLowStockNotifications() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const products = await res.json();
        const lowStock = products.filter(p => p.stock <= p.stock_min);
        if (this.notificationCount === 0 && lowStock.length > 0) {
          this.notificationCount = lowStock.length;
          this.lowStockProducts = lowStock;
          this.showLowStockToast();
        } else {
          this.notificationCount = lowStock.length;
          this.lowStockProducts = lowStock;
        }
      } catch (e) {
        this.lowStockProducts = [];
        this.notificationCount = 0;
      }
    },
    goToEditProduct(productId) {
      this.showNotifications = false;
      this.$router.push({
        path: '/main/products',
        query: { edit: productId }
      });
    },
    showLowStockToast() {
      this.toastMessage = `¡Atención! Hay ${this.notificationCount} producto(s) con bajo stock.`;
      this.toastVisible = true;
      setTimeout(() => {
        this.toastVisible = false;
      }, 4000);
    },
    setPageTitle(title) {
      this.pageTitle = title;
    },
    async checkUserActive() {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('authToken');
        if (!userId || !token) return;
        const res = await api.get(`/users/${userId}/active`);
        if (res.data && res.data.active === false) {
          localStorage.clear();
          this.$router.push('/login');
          this.showToast('Tu usuario ha sido desactivado.');
        }
      } catch (error) {
        // El interceptor de api.js ya maneja los errores 401/403 automáticamente
        // Solo necesitamos manejar otros tipos de errores aquí si es necesario
        console.log('Error al verificar estado del usuario:', error.message);
      }
    },
    async updateUserActivity() {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        await api.post('/users/activity');
      } catch (error) {
        // El interceptor de api.js maneja automáticamente los errores 401/403
        // Solo loggeamos para debugging, no necesitamos hacer nada más
        console.log('Error al actualizar actividad del usuario:', error.message);
      }
    },
    showToast(message, duration = 3000) {
      this.toast.message = message;
      this.toast.show = true;
      clearTimeout(this.toast.timeout);
      this.toast.timeout = setTimeout(() => {
        this.toast.show = false;
      }, duration);
    },
    onProfileUpdated(updatedUserData) {
      console.log('🔄 Actualizando datos del usuario en MainView:', updatedUserData);
      
      // Actualizar los datos reactivos del usuario
      if (updatedUserData.name) {
        this.userName = updatedUserData.name;
        localStorage.setItem('userName', updatedUserData.name);
      }
      
      if (updatedUserData.image) {
        // Si el backend devuelve una URL completa, extraer solo la parte relativa para localStorage
        let imageToStore = updatedUserData.image;
        if (imageToStore.startsWith('http')) {
          const urlParts = imageToStore.split('/uploads/');
          if (urlParts.length > 1) {
            imageToStore = `/uploads/${urlParts[1]}`;
          }
        }
        
        this.userImage = imageToStore;
        localStorage.setItem('userImage', imageToStore);
        
        console.log('🖼️ Imagen actualizada:', {
          original: updatedUserData.image,
          stored: imageToStore,
          computed: this.fullUserImage
        });
      }
      
      // Forzar la actualización del computed fullUserImage
      this.$nextTick(() => {
        this.$forceUpdate();
      });
      
      // Mostrar notificación de éxito
      this.showToast('Perfil actualizado correctamente', 3000);
    }
  }
};
</script>

<style scoped>
.main-container {
  min-height: 100vh;
  width: 100vw;
  background: none;
  display: flex;
  flex-direction: row;
  position: relative;
  overflow-x: hidden;
}
.content-wrapper.collapsed {
  margin-left: 80px; /* Ancho colapsado del sidebar */
}

@media (max-width: 1024px) {
  .content-wrapper.collapsed {
    margin-left: 80px; /* En pantallas pequeñas, mantener margen cuando está colapsado */
  }
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
}

@media (max-width: 900px) {
  .main-content {
    padding: 16px 6px 12px 6px;
  }
}

.main-content {
  flex: 1;
  padding: 32px 24px 24px 24px;
  min-height: 0;
  background: none;
  display: flex;
  flex-direction: column;
  transition: background 0.2s;
}

.dashboard-inner {
  width: 100%;
  max-width: 100vw;
  margin: 0;
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}
</style>