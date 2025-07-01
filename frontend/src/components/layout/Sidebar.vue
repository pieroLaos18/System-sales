<template>
  <aside :class="['sidebar', { collapsed: shouldBeCollapsed }]">
    <!-- Botón de colapsar -->
    <button class="toggle-btn" @click="toggleSidebar">
      <i :class="shouldBeCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
    </button>

    <!-- Usuario -->
    <div class="sidebar-user">
      <img 
        :src="userImage" 
        class="user-image" 
        @error="handleImageError"
        @load="handleImageLoad"
      />
      <span v-if="!shouldBeCollapsed" class="sidebar-username">{{ userName }}</span>
      <span v-if="!shouldBeCollapsed" class="sidebar-role">{{ role }}</span>
    </div>

    <!-- Menú -->
    <nav class="sidebar-menu">
      <ul>
        <li v-if="['admin', 'supervisor'].includes(role)">
          <router-link to="/main/dashboard">
            <i class="fas fa-home"></i>
            <span v-if="!shouldBeCollapsed">Escritorio</span>
          </router-link>
        </li>
        <li v-if="['admin', 'supervisor', 'almacenero'].includes(role)">
          <router-link to="/main/products">
            <i class="fas fa-box"></i>
            <span v-if="!shouldBeCollapsed">Productos</span>
          </router-link>
        </li>
        <li v-if="['admin', 'supervisor', 'cajero'].includes(role)">
          <router-link to="/main/sales">
            <i class="fas fa-cash-register"></i>
            <span v-if="!shouldBeCollapsed">Ventas</span>
          </router-link>
        </li>
        <li v-if="['admin', 'supervisor'].includes(role)">
          <router-link to="/main/reports">
            <i class="fas fa-chart-line"></i>
            <span v-if="!shouldBeCollapsed">Reportes</span>
          </router-link>
        </li>
        <li v-if="role === 'admin'">
          <router-link to="/main/users">
            <i class="fas fa-users"></i>
            <span v-if="!shouldBeCollapsed">Usuarios</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
import defaultUserImage from '@/assets/images/profile.png';

export default {
  name: 'Sidebar',
  props: {
    userName: String,
    userImage: String,
    role: String,
    visible: Boolean,
    isSmallScreen: Boolean
  },
  data() {
    return {
      isCollapsed: false,
      // Base64 fallback image (simple user icon) como último recurso
      fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiMzYjgyZjYiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iMTAiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNiA1MkMxNiA0NC4yNjggMjMuMjY4IDM4IDMyIDM4UzQ4IDQ0LjI2OCA0OCA1MiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+'
    };
  },
  computed: {
    shouldBeCollapsed() {
      // En pantallas pequeñas, si no está visible, se colapsa completamente
      // En pantallas grandes, solo se colapsa si isCollapsed es true
      if (this.isSmallScreen) {
        return !this.visible || this.isCollapsed;
      } else {
        return !this.visible || this.isCollapsed;
      }
    }
  },
  watch: {
    // Observar cambios en la imagen del usuario
    userImage: {
      handler(newImage) {
        console.log('🖼️ Imagen del usuario actualizada en Sidebar:', newImage);
      },
      immediate: true
    }
  },
  methods: {
    toggleSidebar() {
      // En pantallas pequeñas, también cambiar la visibilidad
      if (this.isSmallScreen) {
        this.$emit('toggle', !this.visible);
      } else {
        // En pantallas grandes, solo cambiar el colapso
        this.isCollapsed = !this.isCollapsed;
        this.$emit('toggle', this.shouldBeCollapsed);
      }
    },
    handleImageError(event) {
      console.warn('❌ Error cargando imagen del usuario en Sidebar:', event.target.src);
      // Intentar primero con imagen local, luego con fallback base64
      if (event.target.src !== defaultUserImage) {
        event.target.src = defaultUserImage;
      } else {
        event.target.src = this.fallbackImage;
      }
    },
    handleImageLoad(event) {
      console.log('✅ Imagen del usuario cargada en Sidebar:', event.target.src);
    }
  }
};
</script>

<style scoped>
:root {
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  --sidebar-bg: #1e3a8a;
  --text-light: #ffffff;
  --text-accent: #93c5fd;
}

.sidebar {
  width: 260px;
  height: 100vh;
  background-color: var(--sidebar-bg);
  color: var(--text-light);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  transition: width 0.3s ease;
  overflow: hidden;
  box-shadow: 2px 0 16px rgba(0, 0, 0, 0.2);
}

/* Colapsado */
.sidebar.collapsed {
  width: 80px;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--text-light);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 1rem;
  align-self: flex-end;
  transition: transform 0.3s;
}

.toggle-btn:hover {
  transform: scale(1.2);
}

/* Usuario */
.sidebar-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-color);
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.3);
  margin-bottom: 10px;
}

.sidebar-username,
.sidebar-role {
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .sidebar-username,
.sidebar.collapsed .sidebar-role {
  opacity: 0;
  pointer-events: none;
  height: 0;
  overflow: hidden;
}

/* Menú */
.sidebar-menu {
  flex: 1;
  padding-top: 1rem;
}

.sidebar-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  margin-bottom: 10px;
}

.sidebar-menu a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--text-light);
  text-decoration: none;
  font-size: 1rem;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}

.sidebar-menu a i {
  font-size: 1.2rem;
  color: var(--primary-color);
  transition: color 0.2s ease;
}

.sidebar-menu a:hover,
.sidebar-menu a.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--primary-color);
  transform: translateX(6px);
}

.sidebar-menu a:hover i,
.sidebar-menu a.router-link-exact-active i {
  color: #fff;
}

/* Ocultar texto al colapsar */
.sidebar.collapsed a span {
  opacity: 0;
  pointer-events: none;
  display: none;
}
</style>
