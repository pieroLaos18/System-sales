// Script para probar la conexión con Azure Blob Storage
require('dotenv').config();
const azureBlobService = require('./src/services/azureBlobService');

async function testAzureConnection() {
  console.log('🧪 Probando conexión con Azure Blob Storage...\n');
  
  // Verificar configuración
  console.log('📋 Variables de entorno:');
  console.log('- AZURE_STORAGE_CONNECTION_STRING:', process.env.AZURE_STORAGE_CONNECTION_STRING ? '✅ Configurado' : '❌ No configurado');
  console.log('- AZURE_STORAGE_CONTAINER_NAME:', process.env.AZURE_STORAGE_CONTAINER_NAME || 'No configurado');
  console.log('- AZURE_STORAGE_ACCOUNT_NAME:', process.env.AZURE_STORAGE_ACCOUNT_NAME || 'No configurado');
  console.log();

  // Verificar si Azure está configurado
  if (!azureBlobService.isAzureConfigured()) {
    console.log('❌ Azure no está configurado correctamente');
    console.log('ℹ️ Revisa las variables de entorno en el archivo .env');
    return;
  }

  try {
    // Inicializar Azure
    await azureBlobService.initialize();
    console.log('✅ Azure Blob Storage inicializado correctamente');

    // Obtener estadísticas del contenedor
    const stats = await azureBlobService.getContainerStats();
    console.log('📊 Estadísticas del contenedor:');
    console.log(`- Nombre: ${stats.containerName}`);
    console.log(`- Archivos: ${stats.fileCount}`);
    console.log(`- Tamaño total: ${stats.totalSizeMB} MB`);

    console.log('\n🎉 ¡Azure Blob Storage está funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error al conectar con Azure:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verifica que el Connection String sea correcto');
    console.log('2. Asegúrate de que el contenedor existe');
    console.log('3. Verifica que el contenedor tenga acceso público (nivel "Blob")');
  }
}

// Ejecutar prueba
testAzureConnection();
