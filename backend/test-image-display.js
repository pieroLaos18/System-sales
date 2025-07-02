// Script para probar que las imágenes de Azure se muestren correctamente
require('dotenv').config();
const axios = require('axios');

async function testAzureImageDisplay() {
  console.log('🧪 Probando que las imágenes de Azure se muestren correctamente...\n');
  
  const API_URL = 'http://localhost:5000';
  
  try {
    // Obtener todos los productos
    console.log('📦 Obteniendo productos...');
    const response = await axios.get(`${API_URL}/api/products`);
    const products = response.data;
    
    console.log(`✅ Se encontraron ${products.length} productos\n`);
    
    // Analizar las URLs de imágenes
    let azureImages = 0;
    let localImages = 0;
    let noImages = 0;
    
    products.forEach((product, index) => {
      const imageType = !product.image ? 'Sin imagen' :
                       product.image.startsWith('https://') ? 'Azure Blob Storage' :
                       product.image.startsWith('http://localhost') ? 'Servidor Local' : 'Otro';
      
      console.log(`📷 Producto ${index + 1}: "${product.name}"`);
      console.log(`   Imagen: ${product.image || 'No tiene'}`);
      console.log(`   Tipo: ${imageType}\n`);
      
      if (!product.image) {
        noImages++;
      } else if (product.image.startsWith('https://')) {
        azureImages++;
      } else if (product.image.startsWith('http://localhost')) {
        localImages++;
      }
    });
    
    console.log('📊 Resumen de imágenes:');
    console.log(`   🔵 Azure Blob Storage: ${azureImages}`);
    console.log(`   🟢 Servidor Local: ${localImages}`);
    console.log(`   ⚫ Sin imagen: ${noImages}`);
    
    if (azureImages > 0) {
      console.log('\n✅ ¡Hay productos con imágenes en Azure Blob Storage!');
      console.log('🌐 Verifica en el frontend que se muestren correctamente en: http://localhost:5175');
    } else {
      console.log('\n⚠️ No se encontraron productos con imágenes en Azure.');
      console.log('💡 Sube un producto con imagen para probar Azure Blob Storage.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Respuesta:', error.response.status, error.response.statusText);
    }
  }
}

testAzureImageDisplay();
