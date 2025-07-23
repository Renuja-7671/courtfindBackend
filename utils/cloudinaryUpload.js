// utils/cloudinaryUpload.js

const cloudinary = require('../config/cloudinary'); // Your existing cloudinary config
const fs = require('fs');

async function uploadPDFToCloudinary(localPath, fileName) {
  try {
    console.log('=== CLOUDINARY UPLOAD START ===');
    console.log('Local file path:', localPath);
    console.log('File name:', fileName);

    // Verify file exists
    if (!fs.existsSync(localPath)) {
      throw new Error(`Local file not found: ${localPath}`);
    }

    const stats = fs.statSync(localPath);
    console.log('File size:', stats.size, 'bytes');

    if (stats.size === 0) {
      throw new Error('PDF file is empty');
    }

    // Upload to Cloudinary
    console.log('Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: 'raw', // Important: use 'raw' for PDFs
      public_id: `invoices/${fileName.replace('.pdf', '')}`, // Folder structure
      format: 'pdf',
      access_mode: 'public'
    });

    console.log('Upload successful!');
    console.log('Cloudinary URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    console.log('=== CLOUDINARY UPLOAD SUCCESS ===');

    return result.secure_url;

  } catch (error) {
    console.error('=== CLOUDINARY UPLOAD ERROR ===');
    console.error('Error details:', error.message);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
}

module.exports = { uploadPDFToCloudinary };