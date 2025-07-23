// services/invoiceService.js - Replace with html-pdf-node (lighter than Puppeteer)

const ejs = require("ejs");
const path = require("path");
const htmlPdf = require("html-pdf-node");
const fs = require("fs");

exports.generateInvoicePDF = async (bookingData, outputPath) => {
  const templatePath = path.join(__dirname, "../views/invoiceTemplate.ejs");
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Invoice template not found at: ${templatePath}`);
  }
  
  const html = await ejs.renderFile(templatePath, { booking: bookingData });

  const options = { 
    format: 'A4',
    margin: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in'
    }
  };
  
  const file = { content: html };
  
  try {
    console.log('Generating invoice PDF...');
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log('Invoice PDF created successfully:', outputPath);
    return outputPath;
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw error;
  }
};

exports.generateArenaInvoicePDF = async (arenaData, outputPath) => {
  const templatePath = path.join(__dirname, "../views/arenaInvoiceTemplate.ejs");
  
  console.log('=== HTML-PDF-NODE GENERATION START ===');
  console.log('Template path:', templatePath);
  console.log('Output path:', outputPath);
  console.log('Arena data:', arenaData);
  
  if (!fs.existsSync(templatePath)) {
    console.error(`Arena invoice template not found at: ${templatePath}`);
    throw new Error(`Arena invoice template not found at: ${templatePath}`);
  }

  try {
    // Render HTML from template
    console.log('Rendering EJS template...');
    const html = await ejs.renderFile(templatePath, { arena: arenaData });
    console.log('EJS template rendered successfully');

    // PDF generation options
    const options = { 
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    };
    
    const file = { content: html };

    // Generate PDF
    console.log('Generating PDF with html-pdf-node...');
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    // Write to file
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('=== HTML-PDF-NODE GENERATION SUCCESS ===');
    console.log('PDF created at:', outputPath);
    
    // Verify file was created
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log('PDF file size:', stats.size, 'bytes');
    }

    return outputPath;

  } catch (error) {
    console.error('=== HTML-PDF-NODE GENERATION ERROR ===');
    console.error('Error details:', error);
    throw error;
  }
};