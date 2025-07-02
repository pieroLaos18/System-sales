const multer = require('multer');
const azureBlobService = require('../services/azureBlobService');

/**
 * Middleware de Multer personalizado para Azure Blob Storage
 */
class AzureMulterStorage {
  constructor(options = {}) {
    this.folder = options.folder || 'products';
    this.allowedMimeTypes = options.allowedMimeTypes || [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ];
    this.maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB por defecto
  }

  _handleFile(req, file, cb) {
    // Verificar tipo de archivo
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error(`Tipo de archivo no permitido. Tipos permitidos: ${this.allowedMimeTypes.join(', ')}`));
    }

    // Recopilar chunks del archivo
    const chunks = [];
    
    file.stream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    file.stream.on('error', (error) => {
      cb(error);
    });

    file.stream.on('end', async () => {
      try {
        // Combinar chunks en un buffer
        const fileBuffer = Buffer.concat(chunks);
        
        // Verificar tamaño del archivo
        if (fileBuffer.length > this.maxSize) {
          return cb(new Error(`Archivo demasiado grande. Tamaño máximo: ${Math.round(this.maxSize / (1024 * 1024))}MB`));
        }

        // Si Azure Blob Storage no está configurado, usar almacenamiento local
        if (!azureBlobService.isAzureConfigured()) {
          console.warn('⚠️ Azure Blob Storage no configurado, usando almacenamiento local');
          return this._handleLocalFile(req, file, fileBuffer, cb);
        }

        // Subir a Azure Blob Storage
        const uploadResult = await azureBlobService.uploadFile(
          fileBuffer, 
          file.originalname, 
          this.folder
        );

        // Preparar información del archivo para multer
        const fileInfo = {
          filename: uploadResult.fileName,
          path: uploadResult.fileUrl,
          size: uploadResult.size,
          azure: true,
          url: uploadResult.fileUrl
        };

        cb(null, fileInfo);
      } catch (error) {
        console.error('❌ Error subiendo archivo a Azure:', error.message);
        cb(error);
      }
    });
  }

  _removeFile(req, file, cb) {
    // Si el archivo está en Azure, intentar eliminarlo
    if (file.azure && azureBlobService.isAzureConfigured()) {
      azureBlobService.deleteFile(file.filename)
        .then(() => cb(null))
        .catch((error) => {
          console.error('❌ Error eliminando archivo de Azure:', error.message);
          cb(error);
        });
    } else {
      // Para archivos locales, no hacer nada (multer maneja esto)
      cb(null);
    }
  }

  /**
   * Fallback para almacenamiento local cuando Azure no está configurado
   */
  _handleLocalFile(req, file, fileBuffer, cb) {
    const fs = require('fs');
    const path = require('path');
    
    // Crear directorio si no existe
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generar nombre único
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000000);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomNum}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Guardar archivo localmente
    fs.writeFile(filePath, fileBuffer, (error) => {
      if (error) {
        return cb(error);
      }

      const fileInfo = {
        filename: filename,
        path: `/uploads/${filename}`,
        size: fileBuffer.length,
        azure: false,
        url: `/uploads/${filename}`
      };

      cb(null, fileInfo);
    });
  }
}

/**
 * Crear instancia de multer con Azure Blob Storage
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Instancia de multer configurada
 */
function createAzureMulter(options = {}) {
  const storage = new AzureMulterStorage(options);
  
  return multer({
    storage: storage,
    limits: {
      fileSize: options.maxSize || 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = options.allowedMimeTypes || [
        'image/jpeg',
        'image/jpg',
        'image/png', 
        'image/gif',
        'image/webp'
      ];
      
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
      }
    }
  });
}

/**
 * Middleware para productos
 */
const productUpload = createAzureMulter({
  folder: 'products',
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 5 * 1024 * 1024 // 5MB
});

/**
 * Middleware para usuarios
 */
const userUpload = createAzureMulter({
  folder: 'users',
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 2 * 1024 * 1024 // 2MB
});

/**
 * Middleware genérico
 */
const generalUpload = createAzureMulter({
  folder: 'general',
  allowedMimeTypes: [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain'
  ],
  maxSize: 10 * 1024 * 1024 // 10MB
});

module.exports = {
  AzureMulterStorage,
  createAzureMulter,
  productUpload,
  userUpload,
  generalUpload,
  // Para compatibilidad con código existente
  single: (fieldName) => productUpload.single(fieldName),
  array: (fieldName, maxCount) => productUpload.array(fieldName, maxCount),
  // Función helper para uploads específicos
  uploadSingle: (fieldName, folder = 'products') => {
    if (folder === 'users') {
      return userUpload.single(fieldName);
    }
    return productUpload.single(fieldName);
  }
};
