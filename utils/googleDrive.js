const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

// Load credentials from service.json file
const SERVICE_ACCOUNT_PATH = path.join(__dirname, "..", "service.json");

console.log('Looking for service account file at:', SERVICE_ACCOUNT_PATH);

// Check if service.json file exists
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  throw new Error(`Service account file not found at: ${SERVICE_ACCOUNT_PATH}`);
}

let credentials;
try {
  const credentialsFile = fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8');
  credentials = JSON.parse(credentialsFile);
  console.log('Google Drive credentials loaded from service.json');
  console.log('Project ID:', credentials.project_id);
  console.log('Client Email:', credentials.client_email);
} catch (error) {
  throw new Error(`Failed to load or parse service.json: ${error.message}`);
}

// Validate required fields in the JSON file
const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
const missingFields = requiredFields.filter(field => !credentials[field]);

if (missingFields.length > 0) {
  throw new Error(`Missing required fields in service.json: ${missingFields.join(', ')}`);
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

// Test function to check if service account can access the folder
async function testFolderAccess(folderId) {
  try {
    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id, name'
    });
    console.log('Folder access test successful:', response.data.name);
    return true;
  } catch (error) {
    console.error('Folder access test failed:', error.message);
    return false;
  }
}

async function uploadPDFToDrive(localPath, fileName, folderId) {
  try {
    console.log('=== GOOGLE DRIVE UPLOAD START ===');
    console.log('Local file path:', localPath);
    console.log('File name:', fileName);
    console.log('Folder ID:', folderId);
    console.log('Service account email:', credentials.client_email);

    // Test authentication first
    console.log('Testing authentication...');
    try {
      const authClient = await auth.getClient();
      console.log('Authentication successful');
    } catch (authError) {
      console.error('Authentication failed:', authError.message);
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    // Test folder access
    console.log('Testing folder access...');
    const hasAccess = await testFolderAccess(folderId);
    if (!hasAccess) {
      throw new Error(`Service account doesn't have access to folder ${folderId}. Please share the folder with ${credentials.client_email}`);
    }

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

    // Upload file with retry logic
    let uploadAttempts = 0;
    const maxAttempts = 3;
    
    while (uploadAttempts < maxAttempts) {
      try {
        uploadAttempts++;
        console.log(`Upload attempt ${uploadAttempts}/${maxAttempts}`);
        
        const response = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: "id, name, webViewLink, parents",
        });

        const fileId = response.data.id;
        console.log('File uploaded successfully with ID:', fileId);

        // Make the file publicly readable
        console.log('Setting file permissions...');
        try {
          await drive.permissions.create({
            fileId: fileId,
            requestBody: {
              role: "reader",
              type: "anyone",
            },
          });
          console.log('File permissions set to public successfully');
        } catch (permError) {
          console.warn('Could not set public permissions:', permError.message);
          console.log('File will be accessible to folder members only');
        }

        // Generate viewable URL
        const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
        console.log('File available at:', viewUrl);
        console.log('=== GOOGLE DRIVE UPLOAD SUCCESS ===');

        return viewUrl;
        
      } catch (uploadError) {
        console.error(`Upload attempt ${uploadAttempts} failed:`, uploadError.message);
        
        if (uploadAttempts >= maxAttempts) {
          throw uploadError;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts));
      }
    }

  } catch (error) {
    console.error('=== GOOGLE DRIVE UPLOAD ERROR ===');
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    if (error.message.includes('DECODER') || error.message.includes('unsupported')) {
      throw new Error('Private key format error in service.json file.');
    } else if (error.message.includes('storage quota')) {
      throw new Error(`Google Drive storage quota issue. Make sure to share a folder from your personal Drive with ${credentials.client_email}`);
    } else if (error.message.includes('access') || error.message.includes('permission')) {
      throw new Error(`Access denied. Share the folder ${folderId} with ${credentials.client_email} as Editor`);
    } else if (error.message.includes('Auth') || error.message.includes('invalid_grant')) {
      throw new Error('Google Drive authentication failed. Check your service.json file.');
    } else if (error.message.includes('quota')) {
      throw new Error('Google Drive quota exceeded. Try again later.');
    } else {
      throw new Error(`Google Drive upload failed: ${error.message}`);
    }
  }
}

module.exports = { uploadPDFToDrive, testFolderAccess };
