const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const KEYFILEPATH = path.join(__dirname, "../config/courtfind-gemini-74d8913ce01b.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

async function uploadPDFToDrive(localPath, fileName, folderId) {
  const fileMetadata = {
    name: fileName,
    parents: [folderId], // Share this folder with the service account
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

  // Make public
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  // Return downloadable/viewable link
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

module.exports = { uploadPDFToDrive };
