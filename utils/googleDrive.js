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
  
  // Fix private key formatting issues
  if (credentials.private_key) {
    // Ensure proper line breaks
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    console.log('Private key formatted properly');
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
  // Use the JSON file path directly instead of credentials object
  auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,  // Use file path instead of credentials object
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
      fields: 'id, name'
    });
    
    console.log('Folder access test successful!');
    console.log('Folder name:', response.data.name);
    
    return true;
  } catch (error) {
    console.error('Folder access test failed!');
    console.error('Error message:', error.message);
    console.error('Error details:', {
      code: error.code,
      status: error.status,
      message: error.message
    });
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

    // Get authenticated client
    console.log('Getting authenticated client...');
    const authClient = await auth.getClient();
    console.log('Authentication successful');

    // Test folder access with retry
    console.log('Testing folder access...');
    let hasAccess = false;
    let retryCount = 0;
    const maxRetries = 3;

    while (!hasAccess && retryCount < maxRetries) {
      try {
        hasAccess = await testFolderAccess(folderId);
        if (!hasAccess) {
          retryCount++;
          console.log(`Folder access failed, retry ${retryCount}/${maxRetries}`);
          
          if (retryCount < maxRetries) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      } catch (testError) {
        retryCount++;
        console.error(`Folder access test error (attempt ${retryCount}):`, testError.message);
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (!hasAccess) {
      throw new Error(`After ${maxRetries} attempts, service account still doesn't have access to folder ${folderId}. Please ensure the folder is shared with ${credentials.client_email} as Editor`);
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

    // Upload with retry logic
    let uploadSuccess = false;
    let uploadRetries = 0;
    const maxUploadRetries = 3;
    let response;

    while (!uploadSuccess && uploadRetries < maxUploadRetries) {
      try {
        uploadRetries++;
        console.log(`Upload attempt ${uploadRetries}/${maxUploadRetries}`);

        response = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: "id, name, webViewLink, parents",
        });

        uploadSuccess = true;
        console.log('File uploaded successfully with ID:', response.data.id);

      } catch (uploadError) {
        console.error(`Upload attempt ${uploadRetries} failed:`, uploadError.message);
        
        if (uploadRetries < maxUploadRetries) {
          console.log(`Retrying upload in 3 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Reset the file stream for retry
          media.body = fs.createReadStream(localPath);
        } else {
          throw uploadError;
        }
      }
    }

    const fileId = response.data.id;

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
    
    // Provide more specific error messages
    if (error.message.includes('invalid_grant') || error.message.includes('Invalid JWT')) {
      throw new Error(`Authentication failed - Service account credentials are invalid. Please check your service.json file or recreate the service account.`);
    } else if (error.message.includes('access') || error.message.includes('permission')) {
      throw new Error(`Access denied. Make sure folder ${folderId} is shared with ${credentials.client_email} as Editor. Go to Google Drive, right-click the folder, click Share, and add this email.`);
    } else if (error.message.includes('quota')) {
      throw new Error('Google Drive quota exceeded. Try again later.');
    } else {
      throw new Error(`Google Drive upload failed: ${error.message}`);
    }
  }
}

module.exports = { uploadPDFToDrive, testFolderAccess };
