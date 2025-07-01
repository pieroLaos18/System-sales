<template>
  <div class="dynamic-content activities-page">
    <!-- Cabecera moderna -->
    <div class="activities-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <i class="fas fa-history"></i>
          </div>
          <div class="header-text">
            <h1>Historial de Actividades</h1>
            <p class="header-subtitle">Registro completo de todas las acciones realizadas en el sistema</p>
            <div class="header-stats">
              <div class="stat-item">
                <span class="stat-number">{{ totalActividades }}</span>
                <span class="stat-label">Total</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ actividadesHoy }}</span>
                <span class="stat-label">Hoy</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ tiposUnicos }}</span>
                <span class="stat-label">Tipos</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button class="btn-refresh" @click="refreshActivities" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            <span>{{ loading ? 'Cargando...' : 'Actualizar' }}</span>
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="search-container">
          <div class="search-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="searchTerm" 
              type="text" 
              class="search-input" 
              placeholder="Buscar actividades..."
              @input="filterActivities"
            />
            <button v-if="searchTerm" @click="clearSearch" class="clear-search">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="filter-container">
          <div class="filter-wrapper">
            <i class="fas fa-filter filter-icon"></i>
            <select v-model="selectedType" @change="filterActivities" class="type-select">
              <option value="">Todos los tipos</option>
              <option v-for="tipo in tiposDisponibles" :key="tipo" :value="tipo">
                {{ getActivityTypeName(tipo) }}
              </option>
            </select>
          </div>
        </div>

        <div class="filter-container">
          <div class="filter-wrapper">
            <i class="fas fa-calendar filter-icon"></i>
            <select v-model="selectedPeriod" @change="filterActivities" class="period-select">
              <option value="">Todo el período</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="year">Este año</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loader animado -->
    <div v-if="loading" class="loader"></div>

    <!-- Lista de actividades -->
    <div v-else class="activities-container">
      <div v-if="filteredActivities.length === 0" class="no-data-msg">
        <i class="fas fa-clipboard-list"></i>
        <p v-if="searchTerm || selectedType || selectedPeriod">
          No se encontraron actividades con los filtros aplicados
        </p>
        <p v-else>No hay actividades registradas</p>
        <button v-if="searchTerm || selectedType || selectedPeriod" @click="clearAllFilters" class="btn-clear-filters">
          <i class="fas fa-times"></i>
          Limpiar filtros
        </button>
      </div>

      <div v-else class="activities-list">
        <div 
          v-for="activity in paginatedActivities" 
          :key="activity.id" 
          class="activity-item"
          :class="'activity-' + activity.tipo"
        >
          <div class="activity-icon">
            <i :class="getActivityIcon(activity.tipo)"></i>
          </div>
          
          <div class="activity-content">
            <div class="activity-header">
              <h3 class="activity-title">{{ activity.descripcion }}</h3>
              <div class="activity-type" :class="'type-' + activity.tipo">
                {{ getActivityTypeName(activity.tipo) }}
              </div>
            </div>
            
            <div class="activity-meta">
              <div class="meta-item">
                <i class="fas fa-user"></i>
                <span>{{ activity.usuario || 'Sistema' }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-clock"></i>
                <span>{{ formatDateTime(activity.fecha) }}</span>
              </div>
              <div class="meta-item time-ago">
                <i class="fas fa-history"></i>
                <span>{{ formatTimeAgo(activity.fecha) }}</span>
              </div>
            </div>

            <div v-if="activity.detalles" class="activity-details">
              <p>{{ activity.detalles }}</p>
            </div>
          </div>

          <div class="activity-timestamp">
            <span class="date">{{ formatDate(activity.fecha) }}</span>
            <span class="time">{{ formatTime(activity.fecha) }}</span>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          <i class="fas fa-angle-double-left"></i>
        </button>
        
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          <i class="fas fa-angle-left"></i>
        </button>

        <div class="pagination-info">
          <span>Página {{ currentPage }} de {{ totalPages }}</span>
          <small>({{ filteredActivities.length }} actividades)</small>
        </div>

        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          <i class="fas fa-angle-right"></i>
        </button>
        
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>
    </div>

    <!-- Notificaciones -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      <i :class="notification.icon"></i>
      <span>{{ notification.message }}</span>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'Activities',
  data() {
    return {
      // Estado de carga
      loading: false,
      
      // Datos principales
      actividades: [],
      filteredActivities: [],
      
      // Filtros y búsqueda
      searchTerm: '',
      selectedType: '',
      selectedPeriod: '',
      
      // Paginación
      currentPage: 1,
      itemsPerPage: 20,
      
      // Notificaciones
      notification: {
        show: false,
        message: '',
        type: 'success',
        icon: 'fas fa-check-circle'
      }
    };
  },
  
  computed: {
    totalActividades() {
      return this.actividades.length;
    },
    
    actividadesHoy() {
      const today = new Date().toDateString();
      return this.actividades.filter(act => 
        new Date(act.fecha).toDateString() === today
      ).length;
    },
    
    tiposUnicos() {
      const tipos = [...new Set(this.actividades.map(act => act.tipo).filter(Boolean))];
      return tipos.length;
    },
    
    tiposDisponibles() {
      return [...new Set(this.actividades.map(act => act.tipo).filter(Boolean))];
    },
    
    totalPages() {
      return Math.ceil(this.filteredActivities.length / this.itemsPerPage);
    },
    
    paginatedActivities() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredActivities.slice(start, end);
    }
  },
  
  async mounted() {
    this.$emit('set-title', 'Actividades');
    await this.loadActivities();
  },
  
  methods: {
    async loadActivities() {
      this.loading = true;
      try {
        const response = await api.get('/actividades');
        this.actividades = response.data.sort((a, b) => 
          new Date(b.fecha) - new Date(a.fecha)
        );
        this.filteredActivities = [...this.actividades];
        this.showNotification('Actividades cargadas correctamente', 'success');
      } catch (error) {
        console.error('Error cargando actividades:', error);
        this.actividades = [];
        this.filteredActivities = [];
        this.showNotification('Error al cargar las actividades', 'error', 'fas fa-exclamation-triangle');
      } finally {
        this.loading = false;
      }
    },
    
    async refreshActivities() {
      await this.loadActivities();
    },
    
    filterActivities() {
      let filtered = [...this.actividades];
      
      // Filtro por término de búsqueda
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(activity => 
          activity.descripcion?.toLowerCase().includes(term) ||
          activity.usuario?.toLowerCase().includes(term) ||
          activity.detalles?.toLowerCase().includes(term)
        );
      }
      
      // Filtro por tipo
      if (this.selectedType) {
        filtered = filtered.filter(activity => activity.tipo === this.selectedType);
      }
      
      // Filtro por período
      if (this.selectedPeriod) {
        const now = new Date();
        const activityDate = new Date();
        
        switch (this.selectedPeriod) {
          case 'today':
            filtered = filtered.filter(activity => {
              const date = new Date(activity.fecha);
              return date.toDateString() === now.toDateString();
            });
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(activity => 
              new Date(activity.fecha) >= weekAgo
            );
            break;
          case 'month':
            filtered = filtered.filter(activity => {
              const date = new Date(activity.fecha);
              return date.getMonth() === now.getMonth() && 
                     date.getFullYear() === now.getFullYear();
            });
            break;
          case 'year':
            filtered = filtered.filter(activity => {
              const date = new Date(activity.fecha);
              return date.getFullYear() === now.getFullYear();
            });
            break;
        }
      }
      
      this.filteredActivities = filtered;
      this.currentPage = 1;
    },
    
    clearSearch() {
      this.searchTerm = '';
      this.filterActivities();
    },
    
    clearAllFilters() {
      this.searchTerm = '';
      this.selectedType = '';
      this.selectedPeriod = '';
      this.filteredActivities = [...this.actividades];
      this.currentPage = 1;
    },
    
    getActivityIcon(tipo) {
      const icons = {
        'venta': 'fas fa-shopping-cart',
        'producto': 'fas fa-box',
        'usuario': 'fas fa-user',
        'login': 'fas fa-sign-in-alt',
        'logout': 'fas fa-sign-out-alt',
        'sistema': 'fas fa-cog',
        'inventario': 'fas fa-warehouse',
        'reporte': 'fas fa-chart-bar',
        'configuracion': 'fas fa-sliders-h',
        'backup': 'fas fa-download',
        'error': 'fas fa-exclamation-triangle'
      };
      return icons[tipo] || 'fas fa-info-circle';
    },
    
    getActivityTypeName(tipo) {
      const types = {
        'venta': 'Venta',
        'producto': 'Producto',
        'usuario': 'Usuario',
        'login': 'Inicio de Sesión',
        'logout': 'Cierre de Sesión',
        'sistema': 'Sistema',
        'inventario': 'Inventario',
        'reporte': 'Reporte',
        'configuracion': 'Configuración',
        'backup': 'Respaldo',
        'error': 'Error'
      };
      return types[tipo] || 'Actividad';
    },
    
    formatDateTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    },
    
    formatTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    formatTimeAgo(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) {
        return 'Hace unos momentos';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `Hace ${days} día${days > 1 ? 's' : ''}`;
      } else if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
      } else {
        const months = Math.floor(diffInSeconds / 2592000);
        return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
      }
    },
    
    showNotification(message, type = 'success', icon = 'fas fa-check-circle') {
      this.notification = {
        show: true,
        message,
        type,
        icon
      };
      
      setTimeout(() => {
        this.notification.show = false;
      }, 4000);
    }
  }
};
</script>

<style scoped>
/* Contenedor principal */
.activities-page {
  padding: min(2.5rem, 4vw) min(1.5rem, 3vw) min(6rem, 8vw) min(1.5rem, 3vw);
  font-family: 'Inter', Arial, sans-serif;
  background: #f6f7fb;
  min-height: 100vh;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
  box-sizing: border-box;
}

/* Estilos personalizados para scrollbar */
.activities-page::-webkit-scrollbar {
  width: 8px;
}

.activities-page::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.activities-page::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.activities-page::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Cabecera mejorada */
.activities-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.activities-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
  pointer-events: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.header-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 1.25rem;
  font-size: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-text h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.header-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0 0 1.5rem 0;
  font-weight: 400;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-actions {
  position: relative;
  z-index: 1;
}

.btn-refresh {
  background: white;
  color: #667eea;
  border: none;
  border-radius: 16px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  background: #f8fafc;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Filtros */
.filters-section {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.search-container {
  flex: 1;
  min-width: 300px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.7);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: white;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.clear-search:hover {
  background: rgba(255, 255, 255, 0.3);
}

.filter-container {
  min-width: 200px;
}

.filter-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-icon {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.7);
  z-index: 1;
}

.type-select,
.period-select {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: white;
  font-size: 0.95rem;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1.25em 1.25em;
  padding-right: 3rem;
}

.type-select:focus,
.period-select:focus {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.type-select option,
.period-select option {
  background: #667eea;
  color: white;
}

/* Contenedor de actividades */
.activities-container {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  max-height: calc(100vh - 350px);
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 2rem;
}

.activities-container::-webkit-scrollbar {
  width: 8px;
}

.activities-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.activities-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.activities-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Lista de actividades */
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.activity-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.activity-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.activity-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.activity-title {
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
}

.activity-type {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #e5e7eb;
  color: #374151;
  white-space: nowrap;
  flex-shrink: 0;
}

.activity-type.type-venta {
  background: #dcfce7;
  color: #166534;
}

.activity-type.type-producto {
  background: #ddd6fe;
  color: #5b21b6;
}

.activity-type.type-usuario {
  background: #fef3c7;
  color: #92400e;
}

.activity-type.type-login {
  background: #d1fae5;
  color: #065f46;
}

.activity-type.type-logout {
  background: #fee2e2;
  color: #991b1b;
}

.activity-type.type-sistema {
  background: #e0f2fe;
  color: #0369a1;
}

.activity-type.type-inventario {
  background: #f3e8ff;
  color: #7c3aed;
}

.activity-type.type-reporte {
  background: #ecfdf5;
  color: #047857;
}

.activity-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.meta-item i {
  color: #9ca3af;
  font-size: 0.8rem;
}

.time-ago {
  font-weight: 500;
  color: #667eea;
}

.activity-details {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.activity-details p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
}

.activity-timestamp {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #9ca3af;
  flex-shrink: 0;
}

.activity-timestamp .date {
  font-weight: 600;
  color: #6b7280;
}

.activity-timestamp .time {
  color: #9ca3af;
}

/* Estados sin datos */
.no-data-msg {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.no-data-msg i {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  display: block;
  color: #d1d5db;
}

.no-data-msg p {
  font-size: 1.1rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.btn-clear-filters {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-clear-filters:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* Paginación */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f1f5f9;
}

.pagination-btn {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  font-size: 1rem;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 1rem;
}

.pagination-info small {
  font-size: 0.8rem;
  color: #9ca3af;
}

/* Loader */
.loader {
  width: 48px;
  height: 48px;
  border: 5px solid #ececec;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 2rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Notificaciones */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.notification.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .header-stats {
    gap: 1.5rem;
  }
  
  .activity-meta {
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .activities-page {
    padding: 1.5rem 1rem 4rem 1rem;
    max-height: calc(100vh - 24px);
  }
  
  .activities-header {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .header-left {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
  
  .header-text h1 {
    font-size: 2rem;
  }
  
  .header-stats {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .filters-section {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .search-container,
  .filter-container {
    width: 100%;
    min-width: auto;
  }
  
  .activities-container {
    padding: 1.5rem;
    border-radius: 16px;
    max-height: calc(100vh - 300px);
    margin-bottom: 1.5rem;
  }
  
  .activity-item {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    width: 100%;
  }
  
  .activity-meta {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .activity-timestamp {
    align-self: flex-end;
    align-items: flex-end;
  }
  
  .pagination {
    gap: 0.5rem;
  }
  
  .pagination-info {
    margin: 0 0.5rem;
  }
}

@media (max-width: 480px) {
  .activities-page {
    padding: 1rem 0.5rem 3.5rem 0.5rem;
  }
  
  .activities-header {
    padding: 1.5rem 1rem;
  }
  
  .header-text h1 {
    font-size: 1.75rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .activities-container {
    padding: 1rem;
    max-height: calc(100vh - 280px);
    margin-bottom: 1rem;
  }
  
  .activity-item {
    padding: 0.75rem;
  }
  
  .activity-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .activity-title {
    font-size: 1rem;
  }
  
  .notification {
    right: 10px;
    left: 10px;
    top: 10px;
  }
}

@media (max-width: 360px) {
  .activities-page {
    padding: 0.75rem 0.25rem 3rem 0.25rem;
  }
  
  .activities-header {
    padding: 1rem 0.75rem;
  }
  
  .activities-container {
    padding: 0.75rem;
  }
  
  .activity-item {
    padding: 0.5rem;
  }
}

/* Pantallas muy grandes */
@media (min-width: 1441px) {
  .activities-page {
    max-width: 1400px;
    margin: 0 auto;
  }
}
</style>
