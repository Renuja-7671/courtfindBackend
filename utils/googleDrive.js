// utils/googleDrive.js - Using environment variables

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/drive"];

// Create credentials object from environment variables
const credentials = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : null,
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  universe_domain: "googleapis.com"
};

console.log('Google Drive credentials loaded from environment variables');
console.log('Project ID:', credentials.project_id);
console.log('Client Email:', credentials.client_email);

// Validate required environment variables
const requiredVars = ['GOOGLE_PROJECT_ID', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_CLIENT_EMAIL'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

let auth, drive;

try {
  auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: SCOPES,
  });

  drive = google.drive({ version: "v3", auth });
  console.log('Google Drive API initialized successfully');
} catch (error) {
  console.error('Error initializing Google Drive API:', error);
  throw error;
}

async function uploadPDFToDrive(localPath, fileName, folderId) {
  try {
    console.log('=== GOOGLE DRIVE UPLOAD START ===');
    console.log('Local file path:', localPath);
    console.log('File name:', fileName);
    console.log('Folder ID:', folderId);

    // Verify file exists and get its size
    if (!fs.existsSync(localPath)) {
      throw new Error(`Local file not found: ${localPath}`);
    }

    const stats = fs.statSync(localPath);
    console.log('File size:', stats.size, 'bytes');

    if (stats.size === 0) {
      throw new Error('PDF file is empty');
    }

    // Prepare file metadata
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    // Prepare media
    const media = {
      mimeType: "application/pdf",
      body: fs.createReadStream(localPath),
    };

    console.log('Uploading to Google Drive...');

    // Upload file
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, name, webViewLink",
    });

    const fileId = response.data.id;
    console.log('File uploaded successfully with ID:', fileId);

    // Make the file publicly readable
    console.log('Setting file permissions...');
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    console.log('File permissions set successfully');

    // Generate viewable URL
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
    console.log('File available at:', viewUrl);
    console.log('=== GOOGLE DRIVE UPLOAD SUCCESS ===');

    return viewUrl;

  } catch (error) {
    console.error('=== GOOGLE DRIVE UPLOAD ERROR ===');
    console.error('Error details:', error.message);
    
    // Provide more specific error messages
    if (error.message.includes('Auth')) {
      throw new Error('Google Drive authentication failed. Check your environment variables.');
    } else if (error.message.includes('quota')) {
      throw new Error('Google Drive quota exceeded. Try again later.');
    } else if (error.message.includes('permission')) {
      throw new Error('Permission denied. Check folder ID and service account permissions.');
    } else {
      throw new Error(`Google Drive upload failed: ${error.message}`);
    }
  }
}

module.exports = { uploadPDFToDrive };