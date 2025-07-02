const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class AzureBlobService {
  constructor() {
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'product-images';
    this.baseUrl = process.env.AZURE_BLOB_BASE_URL;
    
    if (!this.connectionString) {
      console.warn('⚠️ Azure Blob Storage connection string not configured');
      this.isConfigured = false;
      return;
    }

    try {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
      this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      this.initialized = false;
      this.isConfigured = true;
    } catch (error) {
      console.error('❌ Error al configurar Azure Blob Storage:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Verificar si Azure Blob Storage está configurado
   */
  isAzureConfigured() {
    return this.isConfigured === true;
  }

  /**
   * Inicializar el contenedor de Azure Blob Storage
   */
  async initialize() {
    if (!this.isConfigured) {
      throw new Error('Azure Blob Storage not configured');
    }

    try {
      // Crear el contenedor si no existe
      await this.containerClient.createIfNotExists({
        access: 'blob' // Acceso público para las imágenes
      });
      
      this.initialized = true;
      console.log('✅ Azure Blob Storage inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Azure Blob Storage:', error.message);
      throw error;
    }
  }

  /**
   * Subir archivo a Azure Blob Storage
   * @param {Buffer} fileBuffer - Buffer del archivo
   * @param {string} originalName - Nombre original del archivo
   * @param {string} folder - Carpeta dentro del contenedor (opcional)
   * @returns {Promise<Object>} - Información del archivo subido
   */
  async uploadFile(fileBuffer, originalName, folder = 'products') {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Generar nombre único para el archivo
      const fileExtension = path.extname(originalName);
      const fileName = `${folder}/${uuidv4()}${fileExtension}`;
      
      // Obtener cliente del blob
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      
      // Subir archivo
      const uploadResponse = await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: {
          blobContentType: this.getMimeType(fileExtension)
        }
      });

      const fileUrl = `${this.baseUrl}/${this.containerName}/${fileName}`;
      
      console.log(`✅ Archivo subido a Azure Blob Storage: ${fileName}`);
      
      return {
        fileName,
        fileUrl,
        size: fileBuffer.length,
        uploadResponse
      };
    } catch (error) {
      console.error('❌ Error subiendo archivo a Azure Blob Storage:', error.message);
      throw error;
    }
  }

  /**
   * Eliminar archivo de Azure Blob Storage
   * @param {string} fileName - Nombre del archivo a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async deleteFile(fileName) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Remover la URL base si viene completa
      const blobName = fileName.replace(`${this.baseUrl}/${this.containerName}/`, '');
      
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      const deleteResponse = await blockBlobClient.deleteIfExists();
      
      if (deleteResponse.succeeded) {
        console.log(`✅ Archivo eliminado de Azure Blob Storage: ${blobName}`);
        return true;
      } else {
        console.log(`⚠️ Archivo no encontrado en Azure Blob Storage: ${blobName}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error eliminando archivo de Azure Blob Storage:', error.message);
      throw error;
    }
  }

  /**
   * Obtener URL pública del archivo
   * @param {string} fileName - Nombre del archivo
   * @returns {string} - URL pública del archivo
   */
  getFileUrl(fileName) {
    if (fileName.startsWith('http')) {
      return fileName; // Ya es una URL completa
    }
    return `${this.baseUrl}/${this.containerName}/${fileName}`;
  }

  /**
   * Listar archivos en el contenedor
   * @param {string} prefix - Prefijo para filtrar archivos (opcional)
   * @returns {Promise<Array>} - Lista de archivos
   */
  async listFiles(prefix = '') {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const files = [];
      
      for await (const blob of this.containerClient.listBlobsFlat({ prefix })) {
        files.push({
          name: blob.name,
          url: this.getFileUrl(blob.name),
          size: blob.properties.contentLength,
          lastModified: blob.properties.lastModified,
          contentType: blob.properties.contentType
        });
      }
      
      return files;
    } catch (error) {
      console.error('❌ Error listando archivos de Azure Blob Storage:', error.message);
      throw error;
    }
  }

  /**
   * Verificar si el archivo existe
   * @param {string} fileName - Nombre del archivo
   * @returns {Promise<boolean>} - true si existe
   */
  async fileExists(fileName) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const blobName = fileName.replace(`${this.baseUrl}/${this.containerName}/`, '');
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      return await blockBlobClient.exists();
    } catch (error) {
      console.error('❌ Error verificando existencia de archivo:', error.message);
      return false;
    }
  }

  /**
   * Obtener tipo MIME basado en la extensión del archivo
   * @param {string} extension - Extensión del archivo
   * @returns {string} - Tipo MIME
   */
  getMimeType(extension) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Verificar si Azure Blob Storage está configurado
   * @returns {boolean} - true si está configurado
   */
  isConfigured() {
    return !!this.connectionString;
  }

  /**
   * Obtener estadísticas del contenedor
   * @returns {Promise<Object>} - Estadísticas del contenedor
   */
  async getContainerStats() {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const files = await this.listFiles();
      const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
      
      return {
        fileCount: files.length,
        totalSize: totalSize,
        totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
        containerName: this.containerName
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del contenedor:', error.message);
      throw error;
    }
  }
}

// Crear y exportar una instancia
const azureBlobService = new AzureBlobService();

// Solo intentar inicializar si está configurado
if (azureBlobService.isAzureConfigured()) {
  console.log('✅ Azure Blob Storage configurado correctamente');
} else {
  console.log('⚠️ Azure Blob Storage no configurado, usando almacenamiento local');
}

module.exports = azureBlobService;
