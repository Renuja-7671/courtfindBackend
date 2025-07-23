const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

// Fix the path to your JSON file
const KEYFILEPATH = path.join(__dirname, "..", "courtfind-gemini-74d8913ce01b.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];

console.log('Looking for Google credentials at:', KEYFILEPATH);

// Check if file exists
if (!fs.existsSync(KEYFILEPATH)) {
  throw new Error(`Google credentials file not found at: ${KEYFILEPATH}`);
}

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

async function uploadPDFToDrive(localPath, fileName, folderId) {
  try {
    console.log('Uploading file:', localPath);
    console.log('To folder:', folderId);
    
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };
    
    const media = {
      mimeType: "application/pdf",
      body: fs.createReadStream(localPath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    const fileId = response.data.id;
    console.log('File uploaded with ID:', fileId);

    // Make public
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Return viewable link instead of download link
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
    console.log('File available at:', viewUrl);
    
    return viewUrl;
  } catch (error) {
    console.error('Google Drive upload error:', error);
    throw error;
  }
}

module.exports = { uploadPDFToDrive };