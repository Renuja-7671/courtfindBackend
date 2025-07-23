// utils/googleDrive.js - Fixed version

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

// Try multiple possible paths for the credentials file
const possiblePaths = [
  path.join(__dirname, "..", "courtfind-gemini-74d8913ce01b.json"),
  path.join(__dirname, "..", "config", "courtfind-gemini-74d8913ce01b.json"),
  path.join(process.cwd(), "courtfind-gemini-74d8913ce01b.json")
];

let KEYFILEPATH = null;

// Find the credentials file
for (const filePath of possiblePaths) {
  if (fs.existsSync(filePath)) {
    KEYFILEPATH = filePath;
    console.log('Found Google credentials at:', KEYFILEPATH);
    break;
  }
}

if (!KEYFILEPATH) {
  console.error('Google credentials file not found. Checked paths:', possiblePaths);
  throw new Error('Google credentials file not found');
}

const SCOPES = ["https://www.googleapis.com/auth/drive"];

let auth, drive;

try {
  auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
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
    console.error('Stack:', error.stack);
    
    // Provide more specific error messages
    if (error.message.includes('Auth')) {
      throw new Error('Google Drive authentication failed. Check your credentials file.');
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