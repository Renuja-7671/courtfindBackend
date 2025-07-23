// utils/googleDrive.js - Fixed private key handling

const fs = require("fs");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

// Fix private key formatting
function fixPrivateKey(privateKey) {
  if (!privateKey) return null;
  
  // Replace escaped newlines with actual newlines
  let fixedKey = privateKey.replace(/\\n/g, '\n');
  
  // Ensure proper formatting
  if (!fixedKey.includes('-----BEGIN PRIVATE KEY-----')) {
    console.error('Private key format is incorrect');
    return null;
  }
  
  // Remove extra quotes if present
  fixedKey = fixedKey.replace(/^"/, '').replace(/"$/, '');
  
  return fixedKey;
}

// Create credentials object from environment variables
const credentials = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: fixPrivateKey(process.env.GOOGLE_PRIVATE_KEY),
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
console.log('Private key starts with:', credentials.private_key ? credentials.private_key.substring(0, 50) + '...' : 'NULL');

// Validate required environment variables
const requiredVars = ['GOOGLE_PROJECT_ID', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_CLIENT_EMAIL'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

if (!credentials.private_key) {
  throw new Error('GOOGLE_PRIVATE_KEY is not properly formatted');
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
    console.error(credentials)
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
      throw new Error('Private key format error. Check your GOOGLE_PRIVATE_KEY environment variable format.');
    } else if (error.message.includes('storage quota')) {
      throw new Error(`Google Drive storage quota issue. Make sure to share a folder from your personal Drive with ${credentials.client_email}`);
    } else if (error.message.includes('access')) {
      throw new Error(`Access denied. Share the folder ${folderId} with ${credentials.client_email} as Editor`);
    } else if (error.message.includes('Auth')) {
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

module.exports = { uploadPDFToDrive, testFolderAccess };