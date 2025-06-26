<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>Mi Perfil</h2>

      <form @submit.prevent="verificarPassword">
        <div class="form-group">
          <label for="password">Confirma tu contraseña para editar:</label>
          <input
            type="password"
            id="password"
            v-model="inputPassword"
            required
            placeholder="Contraseña actual"
          />
        </div>

        <button class="btn-primary" type="submit">Verificar</button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>

      <form v-if="isVerified" @submit.prevent="actualizarPerfil">
        <div class="form-group">
          <label for="name">Nombre</label>
          <input type="text" v-model="user.name" required />
        </div>

        <div class="form-group">
          <label for="email">Correo</label>
          <input type="email" v-model="user.email" required />
        </div>

        <div class="form-group">
          <label for="image">Imagen</label>
          <input type="file" @change="handleImageUpload" />
          <img :src="previewImage" alt="Preview" class="image-preview" />
        </div>

        <button class="btn-primary" type="submit">Guardar Cambios</button>
      </form>

      <button class="btn-secondary" @click="$emit('close')">Cerrar</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

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
      previewImage: '',
      selectedFile: null
    };
  },
  mounted() {
    this.cargarDatosUsuario();
  },
  methods: {
    cargarDatosUsuario() {
      this.user.id = localStorage.getItem('userId');
      this.user.name = localStorage.getItem('userName');
      this.user.email = localStorage.getItem('userEmail');
      this.user.image = localStorage.getItem('userImage');
      this.previewImage = this.user.image;
    },
    async verificarPassword() {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.post(`/api/users/verify-password`, {
          userId: this.user.id,
          password: this.inputPassword
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.verified) {
          this.isVerified = true;
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Contraseña incorrecta';
        }
      } catch (error) {
        this.errorMessage = 'Error al verificar contraseña';
      }
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },
    async actualizarPerfil() {
      try {
        const formData = new FormData();
        formData.append('name', this.user.name);
        formData.append('email', this.user.email);
        if (this.selectedFile) {
          formData.append('image', this.selectedFile);
        }

        const token = localStorage.getItem('authToken');
        const res = await axios.put(`/api/users/${this.user.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        // Actualiza el localStorage y cierra el modal
        localStorage.setItem('userName', res.data.name);
        localStorage.setItem('userEmail', res.data.email);
        if (res.data.image) {
          localStorage.setItem('userImage', res.data.image);
        }

        this.$emit('close');
        window.location.reload(); // O puedes actualizar el nombre dinámicamente
      } catch (error) {
        this.errorMessage = 'Error al actualizar perfil';
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  width: 400px;
}
.image-preview {
  max-width: 100px;
  margin-top: 0.5rem;
}
.error {
  color: red;
  margin-top: 0.5rem;
}
</style>
