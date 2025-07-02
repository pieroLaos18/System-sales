// Script para probar la subida de imagen a Azure Blob Storage
require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testImageUpload() {
  console.log('🧪 Probando subida de imagen a Azure Blob Storage...\n');
  
  const API_URL = 'http://localhost:5000';
  
  try {
    // 1. Verificar que el servidor esté corriendo
    console.log('📡 Verificando servidor...');
    const healthCheck = await axios.get(`${API_URL}/api/products`);
    console.log('✅ Servidor respondiendo correctamente\n');
    
    // 2. Crear un producto de prueba con imagen
    console.log('📦 Creando producto de prueba...');
    
    const formData = new FormData();
    
    // Datos del producto
    formData.append('name', 'Producto de Prueba Azure');
    formData.append('description', 'Producto para probar Azure Blob Storage');
    formData.append('price', '99.99');
    formData.append('purchase_price', '50.00');
    formData.append('category', 'Pruebas');
    formData.append('marca', 'TestBrand');
    formData.append('unidad_medida', 'unidad');
    formData.append('stock', '10');
    formData.append('stock_min', '2');
    formData.append('stock_max', '100');
    
    // Buscar una imagen en uploads para usar como prueba
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    const imageFile = files.find(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
    
    if (imageFile) {
      const imagePath = path.join(uploadsDir, imageFile);
      console.log(`📷 Usando imagen de prueba: ${imageFile}`);
      formData.append('image', fs.createReadStream(imagePath));
    } else {
      console.log('⚠️ No se encontró imagen de prueba en uploads/, creando producto sin imagen...');
    }
    
    // Para obtener un token válido, inicia sesión en tu aplicación y copia el token del localStorage
    const token = 'TOKEN_AQUI'; // Reemplaza con un token real
    
    const response = await axios.post(`${API_URL}/api/products`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Producto creado exitosamente!');
    console.log('📋 Respuesta del servidor:', response.data);
    
    if (response.data.image) {
      console.log(`\n🌐 URL de la imagen: ${response.data.image}`);
      
      if (response.data.image.includes('blob.core.windows.net')) {
        console.log('🎉 ¡La imagen se subió correctamente a Azure Blob Storage!');
      } else {
        console.log('📁 La imagen se guardó en almacenamiento local (fallback)');
      }
    } else {
      console.log('⚠️ No se devolvió URL de imagen');
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Asegúrate de que el servidor esté corriendo en el puerto 5000');
      console.log('   Ejecuta: npm start');
    }
    
    if (error.response?.status === 401) {
      console.log('\n💡 Error de autenticación. Necesitas un token válido.');
      console.log('   Primero inicia sesión en la aplicación y copia el token.');
    }
  }
}

// Ejecutar prueba
testImageUpload();
