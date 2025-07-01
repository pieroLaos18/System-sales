<template>
  <div class="dynamic-content users-page">
    <!-- Cabecera mejorada para Users.vue -->
    <div class="users-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="header-text">
            <h1>Gestión de Usuarios</h1>
            <p class="header-subtitle">Administración completa de usuarios y roles del sistema</p>
            <div class="header-stats">
              <div class="stat-item">
                <span class="stat-number">{{ users.length }}</span>
                <span class="stat-label">Total</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ users.filter(u => u.role === 'admin').length }}</span>
                <span class="stat-label">Admins</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ uniqueRoles.length }}</span>
                <span class="stat-label">Roles</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="header-actions" v-if="currentUserRole === 'admin'">
          <button class="btn-new-user" @click="openUserModal()">
            <i class="fas fa-user-plus"></i>
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>
      
      <div class="filters-section">
        <div class="search-container">
          <div class="search-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Buscar usuarios por nombre o email..."
              class="search-input"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="filter-container">
          <div class="filter-wrapper">
            <i class="fas fa-filter filter-icon"></i>
            <select v-model="selectedRole" class="role-select">
              <option value="">Todos los roles</option>
              <option v-for="role in uniqueRoles" :key="role" :value="role">
                {{ getRoleDisplayName(role) }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loader animado -->
    <div v-if="loading" class="loader"></div>

    <!-- Mensaje si no hay usuarios -->
    <div v-else-if="filteredUsersForDisplay.length === 0" class="no-users-msg">
      <i class="fas fa-users-slash"></i>
      <p>No hay usuarios para mostrar.</p>
    </div>

    <!-- Tabla de usuarios moderna -->
    <div v-else class="users-table-container">
      <div class="table-header">
        <h3>Lista de Usuarios</h3>
        <div class="table-summary">
          <span>{{ filteredUsersForDisplay.length }} usuario(s) encontrado(s)</span>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th v-if="currentUserRole === 'admin'">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsersForDisplay" :key="user.id" class="table-row">
              <td>
                <div class="avatar-cell">
                  <div class="user-avatar" :class="'avatar-' + user.role">
                    <i class="fas fa-user"></i>
                  </div>
                </div>
              </td>
              <td>
                <div class="name-cell">
                  <span class="user-name">{{ user.name }}</span>
                  <small class="user-id">ID: {{ user.id }}</small>
                </div>
              </td>
              <td>
                <div class="email-cell">
                  <i class="fas fa-envelope"></i>
                  {{ user.email }}
                </div>
              </td>
              <td>
                <div class="role-cell">
                  <span class="role-badge" :class="'role-' + user.role">
                    <i :class="getRoleIcon(user.role)"></i>
                    {{ getRoleDisplayName(user.role) }}
                  </span>
                </div>
              </td>
              <td>
                <div class="status-cell">
                  <span class="status-badge active">
                    <i class="fas fa-check-circle"></i>
                    Activo
                  </span>
                </div>
              </td>
              <td v-if="currentUserRole === 'admin'">
                <div class="actions-cell">
                  <button @click="editUser(user)" class="action-btn edit" title="Editar usuario">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteUser(user.id)" class="action-btn delete" title="Eliminar usuario">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="table-footer" v-if="filteredUsersForDisplay.length > 0">
        <div class="summary-stats">
          <div class="summary-item">
            <span class="summary-label">Total de usuarios:</span>
            <span class="summary-value">{{ filteredUsersForDisplay.length }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Roles únicos:</span>
            <span class="summary-value">{{ uniqueRoles.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal mejorado para agregar/editar usuario -->
    <transition name="modal" appear>
      <div v-if="showForm" class="modal-overlay" @click.self="closeUserModal">
        <div class="modal-container">
          <div class="modal-header">
            <div class="modal-title-section">
              <div class="modal-icon">
                <i class="fas fa-user-cog"></i>
              </div>
              <div>
                <h2>{{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
                <p class="modal-subtitle">
                  {{ editingUser ? 'Modifica la información del usuario' : 'Completa los datos del nuevo usuario' }}
                </p>
              </div>
            </div>
            <button class="modal-close-btn" @click="closeUserModal" aria-label="Cerrar modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="saveUser" class="user-form">
              <div class="form-sections">
                <!-- Sección: Información Personal -->
                <div class="form-section">
                  <div class="section-header">
                    <h3><i class="fas fa-user"></i> Información Personal</h3>
                  </div>
                  <div class="section-content">
                    <div class="form-group">
                      <label>Nombre completo</label>
                      <div class="input-wrapper">
                        <i class="fas fa-user input-icon"></i>
                        <input 
                          v-model="form.name" 
                          type="text"
                          placeholder="Ej: Juan Pérez García"
                          class="form-input"
                          :readonly="!!editingUser"
                          required
                        />
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label>Correo electrónico</label>
                      <div class="input-wrapper">
                        <i class="fas fa-envelope input-icon"></i>
                        <input 
                          v-model="form.email" 
                          type="email"
                          placeholder="correo@ejemplo.com"
                          class="form-input"
                          :readonly="!!editingUser"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sección: Rol y Permisos -->
                <div class="form-section">
                  <div class="section-header">
                    <h3><i class="fas fa-user-shield"></i> Rol y Permisos</h3>
                  </div>
                  <div class="section-content">
                    <div class="form-group">
                      <label>Rol del usuario</label>
                      <div class="input-wrapper">
                        <i class="fas fa-user-tag input-icon"></i>
                        <select v-model="form.role" class="form-select">
                          <option value="admin">👑 Administrador - Acceso total</option>
                          <option value="supervisor">👨‍💼 Supervisor - Gestión y supervisión</option>
                          <option value="cajero">💰 Cajero - Ventas y caja</option>
                          <option value="almacenero">📦 Almacenero - Inventario y stock</option>
                        </select>
                      </div>
                    </div>
                    
                    <div class="role-description">
                      <div class="role-info" v-if="form.role">
                        <h4>Permisos del rol {{ getRoleDisplayName(form.role) }}:</h4>
                        <ul class="permissions-list">
                          <li v-for="permission in getRolePermissions(form.role)" :key="permission">
                            <i class="fas fa-check"></i> {{ permission }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Botones de acción -->
              <div class="modal-footer">
                <button type="button" @click="closeUserModal" class="btn-secondary">
                  <i class="fas fa-times"></i>
                  Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  <i class="fas fa-save"></i>
                  {{ editingUser ? 'Actualizar' : 'Crear' }} Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- Notificaciones -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      <i :class="notification.icon"></i>
      <span>{{ notification.message }}</span>
    </div>

    <div class="users-background-decor"></div>
  </div>
</template>

<script>
// Importa axios para llamadas HTTP
import axios from 'axios';

export default {
  data() {
    return {
      // Lista de usuarios
      users: [],
      // Controla la visibilidad del modal de usuario
      showForm: false,
      // Usuario en edición (null si es nuevo)
      editingUser: null,
      // Datos del formulario de usuario
      form: {
        name: '',
        email: '',
        role: 'cajero'
      },
      // Búsqueda y filtros
      searchQuery: '',
      selectedRole: '',
      // Estado de carga
      loading: false,
      // Información del usuario actual
      currentUserEmail: localStorage.getItem('userEmail') || '',
      currentUserRole: localStorage.getItem('userRole') || '',
      // Notificaciones
      notification: {
        show: false,
        message: '',
        type: 'success',
        icon: 'fas fa-check-circle'
      }
    };
  },
  created() {
    // Carga los usuarios al iniciar el componente
    this.fetchUsers();
  },
  computed: {
    // Usuarios filtrados (excluye al usuario actual)
    filteredUsers() {
      return this.users.filter(u => u.email !== this.currentUserEmail);
    },
    // Usuarios filtrados para mostrar (con búsqueda y filtro de rol)
    filteredUsersForDisplay() {
      return this.filteredUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                             user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesRole = this.selectedRole === '' || user.role === this.selectedRole;
        return matchesSearch && matchesRole;
      });
    },
    // Roles únicos en el sistema
    uniqueRoles() {
      const roles = [...new Set(this.users.map(user => user.role))];
      return roles.sort();
    }
  },
  methods: {
    // Obtiene la lista de usuarios desde la API
    async fetchUsers() {
      this.loading = true;
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.users = response.data;
        this.showNotification(`${this.users.length} usuarios cargados correctamente`, 'success');
      } catch (error) {
        if (error.response && error.response.status === 403) {
          this.showNotification('No tienes permisos para ver los usuarios', 'error', 'fas fa-lock');
        } else {
          this.showNotification('Error al cargar usuarios', 'error', 'fas fa-exclamation-triangle');
        }
        console.error('Error al cargar usuarios:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Abre el modal para crear usuario
    openUserModal() {
      this.editingUser = null;
      this.resetForm();
      this.showForm = true;
    },
    
    // Abre el modal para editar un usuario
    editUser(user) {
      this.editingUser = user;
      this.form = { ...user };
      this.showForm = true;
    },
    
    // Cierra el modal
    closeUserModal() {
      this.showForm = false;
      this.editingUser = null;
      this.resetForm();
    },
    
    // Elimina un usuario por ID
    async deleteUser(id) {
      if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        return;
      }
      
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.showNotification('Usuario eliminado correctamente', 'success');
        this.fetchUsers();
      } catch (error) {
        this.showNotification('Error al eliminar usuario', 'error', 'fas fa-exclamation-triangle');
        console.error('Error al eliminar usuario:', error);
      }
    },
    
    // Guarda los cambios del usuario
    async saveUser() {
      try {
        const token = localStorage.getItem('authToken');
        
        if (this.editingUser) {
          // Actualizar usuario existente
          await axios.put(
            `${import.meta.env.VITE_API_URL}/api/users/${this.editingUser.id}`,
            { role: this.form.role },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          this.showNotification('Usuario actualizado correctamente', 'success');
        } else {
          // Crear nuevo usuario
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/users`,
            this.form,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          this.showNotification('Usuario creado correctamente', 'success');
        }
        
        this.fetchUsers();
        this.closeUserModal();
      } catch (error) {
        this.showNotification(
          this.editingUser ? 'Error al actualizar usuario' : 'Error al crear usuario', 
          'error', 
          'fas fa-exclamation-triangle'
        );
        console.error('Error al guardar usuario:', error);
      }
    },
    
    // Reinicia el formulario
    resetForm() {
      this.form = {
        name: '',
        email: '',
        role: 'cajero'
      };
    },
    
    // Cancela y cierra el formulario/modal
    cancelForm() {
      this.closeUserModal();
    },
    
    // Obtiene el nombre de visualización del rol
    getRoleDisplayName(role) {
      const roleNames = {
        'admin': 'Administrador',
        'supervisor': 'Supervisor',
        'cajero': 'Cajero',
        'almacenero': 'Almacenero'
      };
      return roleNames[role] || role;
    },
    
    // Obtiene el icono del rol
    getRoleIcon(role) {
      const roleIcons = {
        'admin': 'fas fa-crown',
        'supervisor': 'fas fa-user-tie',
        'cajero': 'fas fa-cash-register',
        'almacenero': 'fas fa-boxes'
      };
      return roleIcons[role] || 'fas fa-user';
    },
    
    // Obtiene los permisos del rol
    getRolePermissions(role) {
      const permissions = {
        'admin': [
          'Acceso total al sistema',
          'Gestión de usuarios y roles',
          'Configuración del sistema',
          'Reportes avanzados',
          'Backup y mantenimiento'
        ],
        'supervisor': [
          'Supervisión de ventas',
          'Gestión de productos',
          'Reportes de rendimiento',
          'Control de inventario'
        ],
        'cajero': [
          'Procesamiento de ventas',
          'Gestión de caja',
          'Consulta de productos',
          'Reportes básicos'
        ],
        'almacenero': [
          'Gestión de inventario',
          'Control de stock',
          'Entrada y salida de productos',
          'Reportes de almacén'
        ]
      };
      return permissions[role] || [];
    },
    
    // Muestra notificaciones
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
/* Fondo y contenedor principal */
.users-page {
  padding: min(2.5rem, 4vw) min(1.5rem, 3vw) min(6rem, 8vw) min(1.5rem, 3vw);
  font-family: 'Inter', Arial, sans-serif;
  background: #f6f7fb;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #667eea #f1f5f9;
}

/* Cabecera mejorada */
.users-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.users-header::before {
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

.btn-new-user {
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

.btn-new-user:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  background: #f8fafc;
}

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

.role-select {
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

.role-select:focus {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.role-select option {
  background: #667eea;
  color: white;
}

/* Loader y mensajes */
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

.no-users-msg {
  color: #8a94a6;
  text-align: center;
  font-size: 1.1rem;
  margin: 2rem 0;
  padding: 3rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.no-users-msg i {
  font-size: 3rem;
  color: #cbd5e0;
  margin-bottom: 1rem;
  display: block;
}

.no-users-msg p {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #4a5568;
}

/* Tabla moderna */
.users-table-container {
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
}

.table-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-header h3::before {
  content: '👥';
  font-size: 1.5rem;
}

.table-summary {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 1px solid #d1d5db;
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  max-height: calc(100vh - 400px);
  -webkit-overflow-scrolling: touch;
  /* Optimización para muchos datos */
  contain: layout style paint;
  will-change: scroll-position;
  transform: translateZ(0);
}

.users-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: transparent;
  min-width: 800px;
  /* Optimización de rendering */
  contain: layout style;
}

.users-table thead {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  position: sticky;
  top: 0;
  z-index: 10;
}

.users-table th {
  padding: 1.25rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
}

.users-table tbody tr {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
  /* Optimización para scrolling con muchos datos */
  contain: layout style paint;
  will-change: transform;
}

.users-table tbody tr:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transform: translateX(2px);
}

.users-table tbody tr:last-child {
  border-bottom: none;
}

.users-table td {
  padding: 1rem;
  vertical-align: middle;
  border: none;
}

/* Celdas específicas */
.avatar-cell,
.name-cell,
.email-cell,
.role-cell,
.status-cell,
.actions-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  font-weight: 600;
}

.avatar-admin {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.avatar-supervisor {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.avatar-cajero {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.avatar-almacenero {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.name-cell {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
}

.user-id {
  color: #9ca3af;
  font-size: 0.75rem;
  font-weight: 500;
}

.email-cell {
  color: #6b7280;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
}

.email-cell i {
  color: #9ca3af;
  font-size: 0.875rem;
}

.role-badge {
  background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
  color: #0277bd;
  padding: 0.375rem 1rem;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid #81d4fa;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.role-admin {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border-color: #fbbf24;
}

.role-supervisor {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-color: #60a5fa;
}

.role-cajero {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border-color: #34d399;
}

.role-almacenero {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  color: #5b21b6;
  border-color: #a78bfa;
}

.status-badge {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.8rem;
  border: 1px solid #34d399;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge i {
  font-size: 0.75rem;
}

.actions-cell {
  gap: 0.5rem;
}

.action-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.action-btn.edit {
  color: #667eea;
}

.action-btn.edit:hover {
  background: #e0e7ff;
  border-color: #c7d2fe;
  transform: scale(1.05);
}

.action-btn.delete {
  color: #ef4444;
}

.action-btn.delete:hover {
  background: #fee2e2;
  border-color: #fecaca;
  transform: scale(1.05);
}

.table-footer {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 1.5rem 2rem;
  border-top: 2px solid #e0f2fe;
}

.summary-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  padding: 0.75rem 1.25rem;
  border-radius: 16px;
  border: 1px solid #b3e5fc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #455a64;
}

.summary-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1565c0;
}

/* Modal mejorado */
.modal {
  &-enter-active, &-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  &-enter-from, &-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-container {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.modal-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
}

.modal-subtitle {
  font-size: 0.95rem;
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
  font-weight: 400;
}

.modal-close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.1rem;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.modal-body {
  padding: 0;
  overflow-y: auto;
  max-height: calc(90vh - 200px);
}

.user-form {
  padding: 0;
}

.form-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.form-section {
  border-right: 1px solid #e2e8f0;
  &:nth-child(even) {
    border-right: none;
  }
}

.section-header {
  background: #f8fafc;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.section-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-header h3 i {
  color: #667eea;
  font-size: 1.1rem;
}

.section-content {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  letter-spacing: 0.025em;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
  font-size: 1rem;
  z-index: 1;
  pointer-events: none;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #111827;
  background: white;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-input:read-only {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #6b7280;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1.25em 1.25em;
  padding-right: 3rem;
}

.role-description {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.role-info h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.permissions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.permissions-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.permissions-list li i {
  color: #10b981;
  font-size: 0.75rem;
}

.modal-footer {
  padding: 2rem 2.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  outline: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

/* Notificaciones */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  color: white;
  font-weight: 600;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideIn 0.3s ease;
  backdrop-filter: blur(10px);
}

.notification.success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.notification.error {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
}

.notification.warning {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Decoración de fondo */
.users-background-decor {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

/* Scrollbars personalizados */
.users-page::-webkit-scrollbar,
.table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.users-page::-webkit-scrollbar-track,
.table-wrapper::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.users-page::-webkit-scrollbar-thumb,
.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.users-page::-webkit-scrollbar-thumb:hover,
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.table-wrapper::-webkit-scrollbar-corner {
  background: #f1f5f9;
}

/* Mejoras para touch devices */
@supports (-webkit-overflow-scrolling: touch) {
  .table-wrapper {
    -webkit-overflow-scrolling: touch;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

/* Optimización para muchos registros */
.users-table tbody {
  contain: layout style;
}

.users-table tbody tr {
  contain: layout style paint;
  will-change: transform;
}

/* Mejor experiencia con touch en móviles */
@media (pointer: coarse) {
  .table-wrapper {
    /* Scroll más responsive en dispositivos touch */
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
  
  .users-table th,
  .users-table td {
    /* Mejor target para touch en móviles */
    min-height: 44px;
    padding: 1rem 0.75rem;
  }
}

/* RESPONSIVE DESIGN */

/* Breakpoint intermedio para tablets grandes */
@media (max-width: 1200px) {
  .header-stats {
    gap: 1.5rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .filters-section {
    flex-wrap: wrap;
  }
}

/* Tablets (768px - 1024px) */
@media (max-width: 1024px) {
  .users-page {
    padding: min(2rem, 3vw) min(1rem, 2vw) min(5rem, 6vw) min(1rem, 2vw);
  }
  
  .users-header {
    padding: 2rem;
    margin-bottom: 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }
  
  .header-left {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-text h1 {
    font-size: 2rem;
  }
  
  .header-stats {
    justify-content: center;
    gap: 1.5rem;
  }
  
  .header-actions {
    align-self: center;
  }
  
  .filters-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .search-container {
    min-width: auto;
    width: 100%;
  }
  
  .filter-container {
    width: 100%;
  }
  
  .table-header {
    padding: 1.25rem 1.5rem;
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 450px);
  }
  
  .summary-stats {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .form-sections {
    grid-template-columns: 1fr;
  }
  
  .form-section {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .form-section:last-child {
    border-bottom: none;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* Móviles (hasta 768px) */
@media (max-width: 768px) {
  .users-page {
    padding: min(1.5rem, 3vw) min(0.75rem, 2vw) min(4rem, 6vw) min(0.75rem, 2vw);
  }
  
  .users-header {
    padding: 1.5rem;
    border-radius: 20px;
  }
  
  .header-icon {
    padding: 1rem;
    font-size: 1.5rem;
  }
  
  .header-text h1 {
    font-size: 1.75rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
  }
  
  .header-stats {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
  }
  
  .btn-new-user {
    padding: 0.875rem 1.25rem;
    font-size: 0.95rem;
    width: 100%;
    justify-content: center;
  }
  
  .filters-section {
    gap: 1rem;
  }
  
  .search-container,
  .filter-container {
    width: 100%;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 500px);
    border-radius: 16px;
  }
  
  .users-table {
    min-width: 700px;
  }
  
  .users-table th,
  .users-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .table-header {
    padding: 1rem 1.5rem;
  }
  
  .table-header h3 {
    font-size: 1.1rem;
  }
  
  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
  
  .role-badge {
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .summary-item {
    padding: 0.625rem 1rem;
    width: 100%;
  }
  
  .notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    padding: 0.875rem 1rem;
    font-size: 0.9rem;
  }
  
  .no-users-msg {
    padding: 2rem 1rem;
    margin: 1rem 0;
  }
  
  .no-users-msg i {
    font-size: 2.5rem;
  }
  
  .no-users-msg p {
    font-size: 1.1rem;
  }
  
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-header {
    padding: 1.5rem;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .modal-title-section {
    flex-direction: column;
    text-align: center;
  }
  
  .section-content {
    padding: 1.5rem;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    flex-direction: column-reverse;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}

/* Móviles pequeños (hasta 480px) */
@media (max-width: 480px) {
  .users-page {
    padding: min(1rem, 2vw) min(0.5rem, 1vw) min(3rem, 5vw) min(0.5rem, 1vw);
  }
  
  .users-header {
    padding: 1.25rem;
    border-radius: 16px;
  }
  
  .header-icon {
    padding: 0.875rem;
    font-size: 1.25rem;
  }
  
  .header-text h1 {
    font-size: 1.5rem;
  }
  
  .header-subtitle {
    font-size: 0.9rem;
  }
  
  .header-stats {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
  
  .stat-item {
    align-items: center;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
  }
  
  .btn-new-user {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
  
  .search-input,
  .role-select {
    font-size: 16px; /* Evita zoom en iOS */
    padding: 0.75rem 1rem 0.75rem 2.5rem;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 550px);
    border-radius: 12px;
  }
  
  .users-table {
    min-width: 600px;
  }
  
  .users-table th,
  .users-table td {
    padding: 0.625rem 0.375rem;
    font-size: 0.8rem;
  }
  
  .table-header {
    padding: 0.875rem 1rem;
  }
  
  .table-header h3 {
    font-size: 1rem;
  }
  
  .table-summary {
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
  
  .role-badge {
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }
  
  .summary-item {
    flex-direction: column;
    text-align: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
  }
  
  .summary-label {
    font-size: 0.8rem;
  }
  
  .summary-value {
    font-size: 1rem;
  }
  
  .notification {
    padding: 0.75rem 0.875rem;
    font-size: 0.85rem;
  }
  
  .no-users-msg {
    padding: 1.5rem 0.75rem;
  }
  
  .no-users-msg i {
    font-size: 2rem;
  }
  
  .no-users-msg p {
    font-size: 1rem;
  }
  
  .modal-container {
    width: 95vw;
    margin: 0.5rem;
  }
  
  .section-header {
    padding: 1rem 1.5rem;
  }
  
  .section-content {
    padding: 1rem;
  }
}

/* Dispositivos muy pequeños (hasta 360px) */
@media (max-width: 360px) {
  .users-page {
    padding: min(0.75rem, 1.5vw) min(0.25rem, 0.5vw) min(2.5rem, 4vw) min(0.25rem, 0.5vw);
  }
  
  .users-header {
    padding: 1rem 0.75rem;
    border-radius: 12px;
  }
  
  .header-icon {
    padding: 0.75rem;
    font-size: 1rem;
  }
  
  .header-text h1 {
    font-size: 1.25rem;
  }
  
  .header-subtitle {
    font-size: 0.85rem;
  }
  
  .stat-number {
    font-size: 1.125rem;
  }
  
  .stat-label {
    font-size: 0.7rem;
  }
  
  .btn-new-user {
    padding: 0.625rem 0.875rem;
    font-size: 0.8rem;
  }
  
  .search-input,
  .role-select {
    padding: 0.625rem 0.875rem 0.625rem 2.25rem;
    font-size: 16px;
  }
  
  .users-table {
    min-width: 550px;
  }
  
  .users-table th,
  .users-table td {
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
  }
  
  .table-header {
    padding: 0.75rem 0.875rem;
  }
  
  .table-header h3 {
    font-size: 0.9rem;
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
  
  .action-btn {
    width: 24px;
    height: 24px;
    font-size: 0.7rem;
  }
  
  .notification {
    padding: 0.625rem 0.75rem;
    font-size: 0.8rem;
  }
}

/* Breakpoint intermedio para scrolling */
@media (max-width: 640px) {
  .users-table {
    min-width: 700px;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 500px);
    border-radius: 16px;
  }
  
  .users-table th,
  .users-table td {
    white-space: nowrap;
    padding: 0.75rem 0.5rem;
  }
  
  .user-name,
  .user-email {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* Modo landscape en móviles mejorado */
/* Modo landscape en móviles mejorado */
@media (max-height: 500px) and (orientation: landscape) {
  .users-page {
    padding: min(1rem, 2vw) min(1rem, 2vw) min(2rem, 4vw) min(1rem, 2vw);
  }
  
  .users-header {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .header-content {
    gap: 1rem;
  }
  
  .header-left {
    flex-direction: row;
    text-align: left;
  }
  
  .header-text h1 {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
  
  .header-subtitle {
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
  }
  
  .header-stats {
    flex-direction: row;
    gap: 1rem;
    justify-content: flex-start;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
  
  .filters-section {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .search-container,
  .filter-container {
    flex: 1;
    min-width: 200px;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 200px);
  }
}

/* Modo landscape específico para tablets */
@media (min-width: 768px) and (max-height: 600px) and (orientation: landscape) {
  .header-content {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .header-left {
    flex-direction: row;
    gap: 2rem;
  }
  
  .filters-section {
    flex-direction: row;
    gap: 1rem;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 250px);
  }
}

/* Pantallas grandes (1440px+) */
@media (min-width: 1440px) {
  .users-page {
    padding: min(3rem, 2vw) min(2rem, 1.5vw) min(8rem, 10vw) min(2rem, 1.5vw);
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .users-header {
    padding: 3rem;
  }
  
  .header-text h1 {
    font-size: 3rem;
  }
  
  .header-subtitle {
    font-size: 1.25rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 300px);
  }
}

/* Optimización para pantallas muy anchas con muchos datos */
@media (min-width: 1600px) {
  .users-page {
    max-width: 1600px;
    margin: 0 auto;
  }
  
  .users-table {
    min-width: 1000px;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 250px);
  }
  
  .header-text h1 {
    font-size: 3.5rem;
  }
  
  .header-subtitle {
    font-size: 1.5rem;
  }
}

/* Optimización para pantallas ultrawide */
@media (min-width: 1920px) {
  .users-page {
    max-width: 1800px;
  }
  
  .users-header {
    padding: 4rem;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 200px);
  }
}

/* Breakpoints específicos de altura para mejor experiencia */
@media (max-height: 600px) {
  .users-header {
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 300px);
  }
  
  .header-stats {
    gap: 1rem;
  }
}

@media (max-height: 700px) {
  .table-wrapper {
    max-height: calc(100vh - 320px);
  }
}

/* Ajustes dinámicos para muchos datos */
@media (min-height: 800px) {
  .table-wrapper {
    max-height: calc(100vh - 350px);
  }
}

@media (min-height: 1000px) {
  .table-wrapper {
    max-height: calc(100vh - 400px);
  }
}

@media (min-height: 1200px) {
  .table-wrapper {
    max-height: calc(100vh - 300px);
  }
}

/* Soporte para dispositivos plegables */
@media (min-width: 280px) and (max-width: 653px) {
  .users-page {
    padding: min(0.5rem, 1vw) min(0.25rem, 0.5vw) min(2rem, 3vw) min(0.25rem, 0.5vw);
  }
  
  .users-header {
    padding: 0.875rem 0.5rem;
  }
  
  .header-text h1 {
    font-size: 1.125rem;
  }
  
  .filters-section {
    gap: 0.5rem;
  }
  
  .search-container,
  .filter-container {
    width: 100%;
  }
}

/* Para dispositivos con scroll horizontal limitado - actualización completa */
@media (max-width: 640px) {
  .users-table {
    min-width: 700px;
  }
  
  .table-wrapper {
    max-height: calc(100vh - 500px);
    border-radius: 16px;
  }
  
  .users-table th,
  .users-table td {
    white-space: nowrap;
    padding: 0.75rem 0.5rem;
  }
  
  .user-name,
  .user-email {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* Animaciones y transiciones mejoradas */
.users-table-container {
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Accesibilidad mejorada */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .users-table-container {
    animation: none;
  }
}

/* Mejoras para dispositivos táctiles */
@media (pointer: coarse) {
  .btn-new-user,
  .action-btn {
    min-height: 44px;
    padding: 0.875rem 1.25rem;
  }
  
  .search-input,
  .role-select {
    min-height: 44px;
    padding: 0.875rem 1rem 0.875rem 2.75rem;
  }
  
  .users-table th,
  .users-table td {
    padding: 1rem 0.75rem;
  }
  
  .notification {
    padding: 1rem 1.25rem;
    min-height: 44px;
  }
  
  .role-badge {
    min-height: 28px;
    padding: 0.375rem 0.875rem;
  }
}

/* Optimización para pantallas de alta densidad */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .header-icon {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
  
  .users-table th,
  .users-table td {
    border-width: 0.5px;
  }
  
  .user-avatar {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

/* Mejoras para modo de alto contraste */
@media (prefers-contrast: high) {
  .users-header {
    border: 2px solid #000;
  }
  
  .users-table-container {
    border: 2px solid #000;
  }
  
  .users-table th {
    border-bottom: 2px solid #000;
  }
  
  .users-table tbody tr {
    border-bottom: 1px solid #000;
  }
  
  .btn-new-user,
  .action-btn {
    border: 2px solid currentColor;
  }
  
  .role-badge {
    border: 1px solid currentColor;
  }
}

/* Ajustes para dispositivos con notch o island */
@supports (padding-top: env(safe-area-inset-top)) {
  .users-page {
    padding-top: calc(min(2.5rem, 4vw) + env(safe-area-inset-top));
    padding-left: calc(min(1.5rem, 3vw) + env(safe-area-inset-left));
    padding-right: calc(min(1.5rem, 3vw) + env(safe-area-inset-right));
    padding-bottom: calc(min(6rem, 8vw) + env(safe-area-inset-bottom));
  }
  
  .notification {
    top: calc(20px + env(safe-area-inset-top));
    right: calc(20px + env(safe-area-inset-right));
    left: calc(20px + env(safe-area-inset-left));
  }
}

/* Dark mode support (opcional para futuro) */
@media (prefers-color-scheme: dark) {
  .users-page {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }
  
  .users-table-container {
    background: #2d3748;
    border-color: #4a5568;
  }
  
  .users-table tbody tr:hover {
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  }
}

/* Dispositivos muy pequeños */
@media (max-width: 360px) {
  .users-page {
    padding: 0.75rem 0.25rem 3rem 0.25rem;
  }
  
  .users-header {
    padding: 1rem 0.75rem;
  }
}
</style>