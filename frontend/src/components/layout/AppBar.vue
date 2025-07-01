<template>
  <header :class="['app-bar', { 'collapsed': isSidebarCollapsed }]">
    <div class="left-section">
      <span class="page-title">{{ title || 'Panel Principal' }}</span>
    </div>

    <div class="right-section">
      <button class="icon-btn notification-btn" @click="$emit('open-notifications')">
        <i class="fas fa-bell"></i>
        <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
      </button>

      <button class="icon-btn theme-toggle" @click="$emit('toggle-theme')">
        <i :class="theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun'"></i>
      </button>

      <div class="user-dropdown">
        <img 
          :src="fullUserImage" 
          class="user-image" 
          alt="User"
          @error="handleImageError"
          @load="handleImageLoad"
        />
        <button @click="$emit('show-profile')" class="user-name">
          {{ userName }}
        </button>
        <button @click="$emit('logout')" class="icon-btn logout-btn" title="Cerrar sesión">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  </header>

  <div class="content-wrapper">
    <slot></slot>
  </div>
</template>

<script>
import defaultUserImage from '@/assets/images/profile.png';

export default {
  props: {
    title: String,
    theme: String,
    notificationCount: Number,
    fullUserImage: String,
    userName: String,
    isSidebarCollapsed: Boolean
  },
  emits: [
    'open-notifications',
    'toggle-theme',
    'logout',
    'show-profile'
  ],
  data() {
    return {
      // Base64 fallback image (simple user icon) como último recurso
      fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiMzYjgyZjYiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iMTAiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNiA1MkMxNiA0NC4yNjggMjMuMjY4IDM4IDMyIDM4UzQ4IDQ0LjI2OCA0OCA1MiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+'
    };
  },
  watch: {
    // Observar cambios en la imagen del usuario
    fullUserImage: {
      handler(newImage) {
        console.log('🖼️ Imagen del usuario actualizada en AppBar:', newImage);
      },
      immediate: true
    }
  },
  methods: {
    handleImageError(event) {
      console.warn('❌ Error cargando imagen del usuario en AppBar:', event.target.src);
      // Intentar primero con imagen local, luego con fallback base64
      if (event.target.src !== defaultUserImage) {
        event.target.src = defaultUserImage;
      } else {
        event.target.src = this.fallbackImage;
      }
    },
    handleImageLoad(event) {
      console.log('✅ Imagen del usuario cargada en AppBar:', event.target.src);
    }
  }
};
</script>

<style scoped>
.app-bar {
  height: 64px;
  background: none;
  color: #232526;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  padding: 0 32px;
  position: fixed;
  top: 0;
  left: 260px;
  width: calc(100% - 260px);
  z-index: 200;
  border-radius: 0;
  transition: left 0.3s ease, width 0.3s ease, box-shadow 0.2s;
}

.app-bar.collapsed {
  left: 80px;
  width: calc(100% - 80px);
}

@media (max-width: 1024px) {
  .app-bar.collapsed {
    left: 80px; /* Mantener el comportamiento de colapso en pantallas pequeñas */
    width: calc(100% - 80px);
  }
}

.content-wrapper {
  margin-top: 64px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 18px;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 18px;
}

.icon-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;
  position: relative;
}

.icon-btn:hover {
  background: rgba(0,198,255,0.10);
  color: #00c6ff;
}

.notification-btn {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #ff3b3b;
  color: #fff;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 50%;
  padding: 2px 6px;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(255,59,59,0.15);
}

.theme-toggle {
  font-size: 1.2rem;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border-radius: 0;
  padding: 0 8px;
}

.user-image {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #00c6ff;
  box-shadow: 0 1px 6px rgba(0,198,255,0.10);
}

.user-name {
  background: none;
  border: none;
  color: #232526;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  padding: 0 6px;
  border-radius: 0;
  transition: color 0.2s;
}

.user-name:hover {
  color: #00c6ff;
}

.logout-btn {
  color: #ff3b3b;
  font-size: 1.15rem;
  border-radius: 50%;
  padding: 8px;
  transition: background 0.2s, color 0.2s;
}

.logout-btn:hover {
  background: rgba(255,59,59,0.10);
  color: #fff;
}

.hamburger-btn {
  display: none;
}

@media (max-width: 900px) {
  .app-bar {
    padding: 0 12px;
    height: 54px;
  }
  .content-wrapper {
    margin-top: 54px;
  }
  .page-title {
    font-size: 1rem;
  }
  .user-image {
    width: 30px;
    height: 30px;
  }
}
</style>

