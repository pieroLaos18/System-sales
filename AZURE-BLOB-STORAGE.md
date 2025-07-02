# Azure Blob Storage Integration

## Overview
This project has been upgraded to use Azure Blob Storage for handling file uploads (product images and user profile images). The implementation includes fallback to local storage if Azure is not configured.

## Configuration

### Environment Variables
Add the following variables to your `backend/.env` file:

```env
# Azure Blob Storage Configuration
AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
AZURE_STORAGE_CONTAINER_NAME=your_container_name
AZURE_STORAGE_ACCOUNT_NAME=your_storage_account_name
```

### Getting Azure Credentials
1. Create an Azure Storage Account in the Azure Portal
2. Go to "Access keys" section
3. Copy the connection string
4. Create a container in your storage account
5. Set the container's public access level to "Blob" for public read access

## Implementation Details

### Files Modified/Created

#### New Files:
- `backend/src/services/azureBlobService.js` - Azure Blob Storage service
- `backend/src/middleware/azureUpload.js` - Multer middleware for Azure uploads

#### Modified Files:
- `backend/src/routes/products.js` - Updated to use Azure upload middleware
- `backend/src/routes/users.js` - Updated to use Azure upload middleware  
- `backend/src/controllers/userController.js` - Updated to handle Azure blob URLs
- `backend/package.json` - Added Azure dependencies

### Dependencies Added
```json
{
  "@azure/storage-blob": "^12.17.0",
  "multer-azure-blob-storage": "^1.2.0",
  "uuid": "^9.0.1"
}
```

## Usage

### Product Images
Product image uploads automatically use Azure Blob Storage when configured:
- Endpoint: `POST /api/products` (with image file)
- Container folder: `products/`
- Filename format: `product_[timestamp]_[uuid].[ext]`

### User Profile Images
User profile image uploads automatically use Azure Blob Storage when configured:
- Endpoint: `PUT /api/users/:id/profile` (with image file)
- Container folder: `users/`
- Filename format: `user_[timestamp]_[uuid].[ext]`

## Fallback Behavior

If Azure Blob Storage is not configured (missing environment variables), the system automatically falls back to local file storage in the `uploads/` directory.

## Testing

### Test Azure Configuration
You can test if Azure is properly configured by checking the console logs when starting the server:
- ✅ "Azure Blob Storage configurado correctamente" - Azure is working
- ⚠️ "Azure Blob Storage no configurado, usando almacenamiento local" - Fallback to local storage

### Upload Test
1. Start the server: `npm run dev`
2. Try uploading a product image or user profile image
3. Check the console logs and verify the image URL in the response

## File Structure

```
backend/
├── src/
│   ├── middleware/
│   │   └── azureUpload.js          # Azure upload middleware
│   ├── services/
│   │   └── azureBlobService.js     # Azure Blob service
│   ├── routes/
│   │   ├── products.js             # Updated for Azure
│   │   └── users.js                # Updated for Azure
│   └── controllers/
│       └── userController.js       # Updated for blob URLs
├── uploads/                        # Local fallback directory
└── .env                           # Azure configuration
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files with actual Azure credentials
2. **Container Access**: Set appropriate public access levels on your Azure containers
3. **File Validation**: The middleware includes file type validation for security
4. **Error Handling**: Proper error handling for Azure service failures

## Deployment Notes

When deploying to production:
1. Set the Azure environment variables in your hosting platform
2. Ensure the Azure Storage Account is in the same region as your application for better performance
3. Configure CDN if needed for better image delivery performance
4. Set up appropriate backup and retention policies for your blobs
