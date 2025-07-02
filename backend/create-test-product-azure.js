// Script para crear un producto de prueba con Azure Blob Storage
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const azureBlobService = require('./src/services/azureBlobService');
const pool = require('./src/config/db');

async function createTestProductWithAzure() {
  console.log('🧪 Creando producto de prueba con Azure Blob Storage...\n');
  
  try {
    // 1. Inicializar Azure
    await azureBlobService.initialize();
    console.log('✅ Azure inicializado correctamente\n');
    
    // 2. Crear una imagen de prueba simple (un pequeño PNG de 1x1 pixel)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xCD, 0x90, 0x9A, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    console.log('📷 Subiendo imagen de prueba a Azure...');
    const uploadResult = await azureBlobService.uploadFile(
      testImageBuffer,
      'test-image.png',
      'products'
    );
    
    console.log('✅ Imagen subida a Azure:');
    console.log('   URL:', uploadResult.fileUrl);
    console.log('   Tamaño:', uploadResult.size, 'bytes');
    console.log('   Nombre:', uploadResult.fileName);
    console.log();
    
    // 3. Crear el producto en la base de datos
    console.log('📦 Creando producto en la base de datos...');
    const [result] = await pool.query(`
      INSERT INTO products 
      (name, description, price, purchase_price, category, marca, unidad_medida, stock, stock_min, stock_max, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Producto Azure Test',
        'Producto de prueba creado directamente con Azure Blob Storage',
        29.99,
        15.50,
        'Pruebas',
        'TestBrand',
        'unidad',
        50,
        5,
        100,
        uploadResult.fileUrl
      ]
    );
    
    const productId = result.insertId;
    console.log(`✅ Producto creado con ID: ${productId}`);
    console.log();
    
    // 4. Verificar que el producto se creó correctamente
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    const product = products[0];
    
    console.log('📋 Detalles del producto creado:');
    console.log('   ID:', product.id);
    console.log('   Nombre:', product.name);
    console.log('   Imagen URL:', product.image);
    console.log('   Tipo de URL:', product.image.startsWith('https://') ? '🔵 Azure Blob Storage' : '🟡 Otro');
    console.log();
    
    console.log('🎉 ¡Producto de prueba creado exitosamente con Azure Blob Storage!');
    console.log('🌐 Ahora verifica en el frontend: http://localhost:5175');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

createTestProductWithAzure();
