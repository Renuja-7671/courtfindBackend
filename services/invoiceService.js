const ejs = require("ejs");
const path = require("path");
const puppeteer = require("puppeteer");
const fs = require("fs");

exports.generateInvoicePDF = async (bookingData, outputPath) => {
  const templatePath = path.join(__dirname, "../views/invoiceTemplate.ejs");
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Invoice template not found at: ${templatePath}`);
  }
  
  const html = await ejs.renderFile(templatePath, { booking: bookingData });

  let browser;
  try {
    console.log('Launching Puppeteer for invoice PDF...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    });

    console.log('Invoice PDF created successfully:', outputPath);
    return outputPath;

  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

exports.generateArenaInvoicePDF = async (arenaData, outputPath) => {
  const templatePath = path.join(__dirname, "../views/arenaInvoiceTemplate.ejs");
  
  console.log('=== PUPPETEER PDF GENERATION START ===');
  console.log('Template path:', templatePath);
  console.log('Output path:', outputPath);
  console.log('Arena data:', arenaData);
  
  if (!fs.existsSync(templatePath)) {
    console.error(`Arena invoice template not found at: ${templatePath}`);
    throw new Error(`Arena invoice template not found at: ${templatePath}`);
  }

  let browser;
  try {
    // Render HTML from template
    console.log('Rendering EJS template...');
    const html = await ejs.renderFile(templatePath, { arena: arenaData });
    console.log('EJS template rendered successfully');

    // Launch Puppeteer
    console.log('Launching Puppeteer browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    console.log('Puppeteer browser launched successfully');

    // Create new page and set content
    const page = await browser.newPage();
    console.log('Setting page content...');
    
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    console.log('Page content set successfully');

    // Generate PDF
    console.log('Generating PDF...');
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    });

    console.log('=== PUPPETEER PDF GENERATION SUCCESS ===');
    console.log('PDF created at:', outputPath);
    
    // Verify file was created
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log('PDF file size:', stats.size, 'bytes');
    }

    return outputPath;

  } catch (error) {
    console.error('=== PUPPETEER PDF GENERATION ERROR ===');
    console.error('Error details:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('Puppeteer browser closed');
    }
  }
};