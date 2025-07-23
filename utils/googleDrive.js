// const fs = require("fs");
// const path = require("path");
// const { google } = require("googleapis");

// const KEYFILEPATH = path.join(__dirname, "../config/courtfind-gemini-74d8913ce01b.json");
// const SCOPES = ["https://www.googleapis.com/auth/drive"];

// const auth = new google.auth.GoogleAuth({
//   keyFile: KEYFILEPATH,
//   scopes: SCOPES,
// });

// const drive = google.drive({ version: "v3", auth });

// async function uploadPDFToDrive(localPath, fileName, folderId) {
//   const fileMetadata = {
//     name: fileName,
//     parents: [folderId], // Share this folder with the service account
//   };
//   const media = {
//     mimeType: "application/pdf",
//     body: fs.createReadStream(localPath),
//   };

//   const response = await drive.files.create({
//     resource: fileMetadata,
//     media: media,
//     fields: "id",
//   });

//   const fileId = response.data.id;

//   // Make public
//   await drive.permissions.create({
//     fileId,
//     requestBody: {
//       role: "reader",
//       type: "anyone",
//     },
//   });

//   // Return downloadable/viewable link
//   return `https://drive.google.com/uc?export=download&id=${fileId}`;
// }

// module.exports = { uploadPDFToDrive };


// utils/googleDrive.js

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load the service account key
const serviceAccountKeyPath = path.join(__dirname, '..', '/config/courtfind-gemini-74d8913ce01b.json');

let credentials;
try {
  credentials = require(serviceAccountKeyPath);
  console.log('Google Drive credentials loaded successfully');
} catch (error) {
  console.error('Failed to load Google Drive credentials:', error);
  throw new Error('Google Drive credentials not found');
}

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

const uploadPDFToDrive = async (localFilePath, fileName, folderId) => {
  try {
    console.log('=== GOOGLE DRIVE UPLOAD START ===');
    console.log('Local file path:', localFilePath);
    console.log('File name:', fileName);
    console.log('Folder ID:', folderId);

    // Check if file exists
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File not found: ${localFilePath}`);
    }

    const fileSize = fs.statSync(localFilePath).size;
    console.log('File size:', fileSize, 'bytes');

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: 'application/pdf',
      body: fs.createReadStream(localFilePath),
    };

    console.log('Uploading to Google Drive...');
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink',
    });

    console.log('Upload successful. File ID:', response.data.id);

    // Make the file publicly viewable
    await drive.permissions.create({
      fileId: response.data.id,
      resource: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log('File permissions set to public');

    const viewUrl = `https://drive.google.com/file/d/${response.data.id}/view`;
    console.log('File view URL:', viewUrl);
    console.log('=== GOOGLE DRIVE UPLOAD SUCCESS ===');

    return viewUrl;

  } catch (error) {
    console.error('=== GOOGLE DRIVE UPLOAD ERROR ===');
    console.error('Error uploading to Google Drive:', error);
    throw new Error(`Failed to upload to Google Drive: ${error.message}`);
  }
};

module.exports = {
  uploadPDFToDrive,
};