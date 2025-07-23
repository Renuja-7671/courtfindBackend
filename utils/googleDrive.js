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
  console.log('Private Key ID:', credentials.private_key_id);
  console.log('Service Account Type:', credentials.type);
  
  // Debug: Check if private key is properly formatted
  if (credentials.private_key) {
    console.log('Private key starts with:', credentials.private_key.substring(0, 27));
    console.log('Private key ends with:', credentials.private_key.substring(credentials.private_key.length - 27));
    console.log('Private key contains newlines:', credentials.private_key.includes('\n'));
  }
  
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
    console.log(`Testing access to folder ${folderId} with service account ${credentials.client_email}`);
    
    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, owners, permissions'
    });
    
    console.log('Folder access test successful!');
    console.log('Folder name:', response.data.name);
    console.log('Folder ID:', response.data.id);
    
    return true;
  } catch (error) {
    console.error('Folder access test failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
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
    console.log('Project ID:', credentials.project_id);

    // Test authentication first
    console.log('Testing authentication...');
    try {
      const authClient = await auth.getClient();
      console.log('Authentication successful');
      console.log('Auth client email:', authClient.email);
    } catch (authError) {
      console.error('Authentication failed:', authError.message);
      console.error('Auth error details:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    // Test folder access
    console.log('Testing folder access...');
    const hasAccess = await testFolderAccess(folderId);
    if (!hasAccess) {
      console.error(`No access to folder. Make sure folder ${folderId} is shared with ${credentials.client_email}`);
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

  } catch (error) {
    console.error('=== GOOGLE DRIVE UPLOAD ERROR ===');
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
    console.error('Full error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('invalid_grant') || error.message.includes('Invalid JWT')) {
      throw new Error(`Authentication failed - Invalid JWT signature. Check if service.json contains the correct private key.`);
    } else if (error.message.includes('access') || error.message.includes('permission')) {
      throw new Error(`Access denied. Share the folder ${folderId} with ${credentials.client_email} as Editor`);
    } else {
      throw new Error(`Google Drive upload failed: ${error.message}`);
    }
  }
}

module.exports = { uploadPDFToDrive, testFolderAccess };
