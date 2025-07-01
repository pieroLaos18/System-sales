<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content" @click.stop>
      <!-- Header del modal -->
      <div class="modal-header">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
            <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
          </svg>
        </div>
        <div class="header-text">
          <h2>Mi Perfil</h2>
          <p class="header-subtitle">Gestiona tu información personal</p>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Formulario de verificación de contraseña -->
      <div v-if="!isVerified" class="verification-section">
        <div class="security-notice">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>Por seguridad, confirma tu contraseña para continuar</p>
        </div>
        
        <form @submit.prevent="verificarPassword" class="verification-form">
          <div class="form-group">
            <label for="password">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2"/>
              </svg>
              Contraseña actual
            </label>
            <div class="input-wrapper">
              <input
                type="password"
                id="password"
                v-model="inputPassword"
                required
                placeholder="Ingresa tu contraseña actual"
                :class="{ 'error': errorMessage }"
              />
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 2L19 4M5 16L3 14M16 8L14 10M10 12L8 14M17.5 6.5L19 5M6.5 17.5L5 19M9 15L15 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>

          <button class="btn-primary" type="submit" :disabled="loading">
            <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else class="spinning" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12a9 9 0 11-6.219-8.56" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ loading ? 'Verificando...' : 'Verificar' }}
          </button>
          
          <div v-if="errorMessage" class="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ errorMessage }}
          </div>
        </form>
      </div>

      <!-- Formulario de edición de perfil -->
      <div v-if="isVerified" class="profile-section">
        <form @submit.prevent="actualizarPerfil" class="profile-form">
          <!-- Imagen de perfil -->
          <div class="profile-image-section">
            <div class="current-image">
              <img 
                :src="getUserImage" 
                alt="Foto de perfil" 
                @error="handleImageError"
                @load="handleImageLoad"
              />
              <div class="image-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>
            <div class="image-controls">
              <label for="imageInput" class="btn-image-upload">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 15V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Cambiar foto
              </label>
              <input 
                type="file" 
                id="imageInput" 
                @change="handleImageUpload" 
                accept="image/*"
                style="display: none;"
              />
            </div>
          </div>

          <!-- Campos del formulario -->
          <div class="form-fields">
            <div class="form-group">
              <label for="name">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
                Nombre completo
              </label>
              <div class="input-wrapper">
                <input 
                  type="text" 
                  id="name"
                  v-model="user.name" 
                  required 
                  placeholder="Tu nombre completo"
                />
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>

            <div class="form-group">
              <label for="email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
                </svg>
                Correo electrónico
              </label>
              <div class="input-wrapper">
                <input 
                  type="email" 
                  id="email"
                  v-model="user.email" 
                  required 
                  placeholder="tu@email.com"
                />
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="updating">
              <svg v-if="!updating" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" stroke-width="2"/>
                <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" stroke-width="2"/>
                <polyline points="7,3 7,8 15,8" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else class="spinning" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12a9 9 0 11-6.219-8.56" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ updating ? 'Guardando...' : 'Guardar cambios' }}
            </button>
            <button type="button" class="btn-secondary" @click="$emit('close')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Indicador de éxito -->
      <div v-if="successMessage" class="success-message">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
          <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
        </svg>
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  data() {
    return {
      user: {
        id: '',
        name: '',
        email: '',
        image: ''
      },
      inputPassword: '',
      isVerified: false,
      errorMessage: '',
      successMessage: '',
      previewImage: '',
      selectedFile: null,
      loading: false,
      updating: false
    };
  },
  mounted() {
    this.cargarDatosUsuario();
  },
  watch: {
    // Observar cambios en isVerified para debug
    isVerified: {
      handler(newValue) {
        if (newValue) {
          console.log('🔓 Usuario verificado, datos cargados:', {
            id: this.user.id,
            name: this.user.name,
            email: this.user.email,
            image: this.user.image,
            processedImage: this.getUserImage
          });
        }
      },
      immediate: true
    },
    // Observar cambios en la imagen del usuario
    'user.image': {
      handler(newImage) {
        console.log('🖼️ Imagen del usuario actualizada en modal:', newImage, '-> Procesada:', this.getUserImage);
      },
      immediate: true
    }
  },
  computed: {
    getUserImage() {
      console.log('🖼️ Calculando getUserImage...', {
        previewImage: this.previewImage,
        userImage: this.user.image,
        userImageType: typeof this.user.image
      });
      
      // Si hay una imagen de preview (nueva imagen seleccionada), usarla
      if (this.previewImage) {
        console.log('📸 Usando preview image:', this.previewImage);
        return this.previewImage;
      }
      
      // Si hay imagen del usuario en localStorage, procesarla
      if (this.user.image && this.user.image !== 'null' && this.user.image !== '' && this.user.image !== 'undefined') {
        // Si la imagen ya tiene el dominio completo, usarla directamente
        if (this.user.image.startsWith('http')) {
          console.log('🌐 Usando URL completa:', this.user.image);
          return this.user.image;
        }
        // Si es una ruta relativa, agregar la URL base del API
        if (this.user.image.startsWith('/uploads/')) {
          const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${this.user.image}`;
          console.log('📁 Construyendo URL desde ruta relativa:', fullUrl);
          return fullUrl;
        }
        // Si es solo el nombre del archivo, construir la ruta completa
        const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/uploads/${this.user.image}`;
        console.log('📄 Construyendo URL desde nombre de archivo:', fullUrl);
        return fullUrl;
      }
      
      // Imagen por defecto
      console.log('🖼️ Usando imagen por defecto');
      return '/src/assets/images/profile.png';
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    cargarDatosUsuario() {
      this.user.id = localStorage.getItem('userId');
      this.user.name = localStorage.getItem('userName');
      this.user.email = localStorage.getItem('userEmail');
      this.user.image = localStorage.getItem('userImage');
      
      // Limpiar el previewImage para que use la imagen del usuario
      this.previewImage = '';
      this.selectedFile = null;
      
      // Debug mejorado
      console.log('👤 Datos del usuario cargados en modal:', {
        id: this.user.id,
        name: this.user.name,
        email: this.user.email,
        image: this.user.image,
        imageIsNull: this.user.image === 'null',
        imageIsEmpty: this.user.image === '',
        processedImage: this.getUserImage
      });
      
      // Forzar actualización reactiva
      this.$nextTick(() => {
        console.log('🔄 getUserImage después de nextTick:', this.getUserImage);
      });
    },
    async verificarPassword() {
      if (!this.inputPassword.trim()) {
        this.errorMessage = 'Por favor, ingresa tu contraseña';
        return;
      }

      this.loading = true;
      this.errorMessage = '';

      try {
        const res = await api.post('/users/verify-password', {
          userId: this.user.id,
          password: this.inputPassword
        });

        if (res.data.verified) {
          this.isVerified = true;
          this.errorMessage = '';
          this.successMessage = 'Contraseña verificada correctamente';
          
          // Recargar los datos del usuario para asegurar que estén actualizados
          this.cargarDatosUsuario();
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage = 'Contraseña incorrecta. Inténtalo de nuevo.';
        }
      } catch (error) {
        console.error('Error al verificar contraseña:', error);
        this.errorMessage = error.response?.data?.message || 'Error al verificar contraseña. Inténtalo más tarde.';
      } finally {
        this.loading = false;
      }
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          this.errorMessage = 'Por favor, selecciona un archivo de imagen válido';
          return;
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.errorMessage = 'La imagen debe ser menor a 5MB';
          return;
        }

        this.selectedFile = file;
        this.previewImage = URL.createObjectURL(file);
        this.errorMessage = '';
      }
    },
    handleImageError(event) {
      console.warn('❌ Error cargando imagen del usuario en modal:', event.target.src);
      // Fallback a imagen por defecto
      event.target.src = '/src/assets/images/profile.png';
    },
    handleImageLoad(event) {
      console.log('✅ Imagen del usuario cargada en modal:', event.target.src);
    },
    async actualizarPerfil() {
      if (!this.user.name.trim() || !this.user.email.trim()) {
        this.errorMessage = 'Todos los campos son obligatorios';
        return;
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.user.email)) {
        this.errorMessage = 'Por favor, ingresa un email válido';
        return;
      }

      this.updating = true;
      this.errorMessage = '';

      try {
        const formData = new FormData();
        formData.append('name', this.user.name.trim());
        formData.append('email', this.user.email.trim());
        if (this.selectedFile) {
          formData.append('image', this.selectedFile);
        }

        const res = await api.put(`/users/${this.user.id}/profile`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Actualiza el localStorage
        if (res.data.name) localStorage.setItem('userName', res.data.name);
        if (res.data.email) localStorage.setItem('userEmail', res.data.email);
        if (res.data.image) localStorage.setItem('userImage', res.data.image);

        this.successMessage = 'Perfil actualizado correctamente';
        
        // Emitir evento para que el componente padre actualice la UI
        this.$emit('profile-updated', res.data);

        // Cerrar modal después de un breve delay
        setTimeout(() => {
          this.$emit('close');
          // Opcional: recargar página para reflejar cambios
          window.location.reload();
        }, 1500);

      } catch (error) {
        console.error('Error al actualizar perfil:', error);
        this.errorMessage = error.response?.data?.message || 'Error al actualizar el perfil. Inténtalo más tarde.';
      } finally {
        this.updating = false;
      }
    }
  }
};
</script>

<style scoped>
/* Modal Overlay con fondo visible */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

/* Modal Content con estilos básicos */
.modal-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 1rem 1rem 0 0;
  flex-shrink: 0;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #5147e3);
  color: white;
  margin-right: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.header-text {
  flex: 1;
}

.header-text h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}

.header-subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
}

/* Verification Section */
.verification-section {
  padding: 2rem;
  text-align: center;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.verification-section::-webkit-scrollbar {
  width: 8px;
}

.verification-section::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.verification-section::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.verification-section::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #94a3b8, #64748b);
}

.security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 0.75rem;
  border-left: 4px solid #f59e0b;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.security-notice svg {
  color: #f59e0b;
  margin-right: 1rem;
}

.security-notice p {
  margin: 0;
  font-weight: 600;
  color: #92400e;
  font-size: 0.875rem;
}

/* Form Styles */
.verification-form,
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
  gap: 0.5rem;
}

.form-group label svg {
  color: #667eea;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  width: 100%;
  padding: 1rem 1.25rem;
  padding-right: 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
  color: #1e293b;
  font-weight: 500;
  min-height: 44px;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: #fafbff;
}

.input-wrapper input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-wrapper input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.input-icon {
  position: absolute;
  right: 1rem;
  color: #94a3b8;
  pointer-events: none;
}

.input-wrapper input:focus + .input-icon {
  color: #667eea;
}

/* Buttons */
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #5147e3);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f8fafc;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

/* Profile Section */
.profile-section {
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.profile-section::-webkit-scrollbar {
  width: 8px;
}

.profile-section::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.profile-section::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.profile-section::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #94a3b8, #64748b);
}

.profile-image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 0.75rem;
  border: 2px dashed #e2e8f0;
}

.current-image {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid white;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.current-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
}

.current-image:hover .image-overlay {
  opacity: 1;
}

.current-image:hover img {
  transform: scale(1.1);
}

.btn-image-upload {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #5147e3);
  color: white;
  border: none;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  min-height: 44px;
}

.btn-image-upload:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Form Fields */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

/* Messages */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-left: 4px solid #ef4444;
  border-radius: 0.625rem;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 1rem;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  border-left: 4px solid #10b981;
  border-radius: 0.625rem;
  color: #166534;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 2rem;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 5vh;
  }

  .modal-content {
    max-width: 100%;
    max-height: 95vh;
    margin: 0;
    border-radius: 0.75rem;
  }

  .modal-header {
    padding: 1.5rem 1rem;
  }

  .header-icon {
    width: 48px;
    height: 48px;
    margin-right: 1rem;
  }

  .header-text h2 {
    font-size: 1.25rem;
  }

  .verification-section,
  .profile-section {
    padding: 1.5rem 1rem;
    max-height: calc(95vh - 100px);
  }

  .current-image {
    width: 110px;
    height: 110px;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 1rem;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0;
    align-items: stretch;
  }

  .modal-content {
    max-height: 100vh;
    border-radius: 0;
    min-height: 100vh;
    overflow: hidden;
  }

  .verification-section,
  .profile-section {
    padding: 1rem;
    max-height: calc(100vh - 80px);
  }

  .modal-header {
    padding: 1rem;
    flex-shrink: 0;
  }

  .header-text h2 {
    font-size: 1.125rem;
  }

  .current-image {
    width: 80px;
    height: 80px;
  }

  .input-wrapper input {
    padding: 0.75rem 1rem;
    padding-right: 2.5rem;
    font-size: 0.875rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.875rem 1.5rem;
    min-height: 44px;
  }
}
</style>
