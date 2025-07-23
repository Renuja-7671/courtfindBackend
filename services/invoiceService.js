// services/invoiceService.js - Replace with Puppeteer

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

    console.log('PDF created successfully with Puppeteer:', outputPath);
    return outputPath;

  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

exports.generateArenaInvoicePDF = async (arenaData, outputPath) => {
  const templatePath = path.join(__dirname, "../views/arenaInvoiceTemplate.ejs");
  
  console.log('Looking for template at:', templatePath);
  
  if (!fs.existsSync(templatePath)) {
    console.error(`Arena invoice template not found at: ${templatePath}`);
    throw new Error(`Arena invoice template not found at: ${templatePath}`);
  }

  console.log('Arena data for template:', arenaData);

  try {
    const html = await ejs.renderFile(templatePath, { arena: arenaData });
    console.log('HTML template rendered successfully');

    let browser;
    try {
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

      const page = await browser.newPage();
      console.log('Setting page content...');
      
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

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

      console.log('PDF created successfully with Puppeteer:', outputPath);
      return outputPath;

    } finally {
      if (browser) {
        await browser.close();
        console.log('Browser closed');
      }
    }

  } catch (error) {
    console.error('Error in generateArenaInvoicePDF:', error);
    throw error;
  }
};