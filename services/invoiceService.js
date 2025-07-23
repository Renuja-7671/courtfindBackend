const ejs = require("ejs");
const path = require("path");
const pdf = require("html-pdf");
const fs = require("fs");

exports.generateInvoicePDF = async (bookingData, outputPath) => {
  const templatePath = path.join(__dirname, "../views/invoiceTemplate.ejs");
  
  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Invoice template not found at: ${templatePath}`);
  }
  
  const html = await ejs.renderFile(templatePath, { booking: bookingData });

  return new Promise((resolve, reject) => {
    const options = {
      format: 'A4',
      orientation: 'portrait',
      border: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    };

    pdf.create(html, options).toFile(outputPath, (err, res) => {
      if (err) {
        console.error('PDF creation error:', err);
        reject(err);
      } else {
        console.log('PDF created successfully:', res.filename);
        resolve(res.filename);
      }
    });
  });
};

exports.generateArenaInvoicePDF = async (arenaData, outputPath) => {
  const templatePath = path.join(__dirname, "../views/arenaInvoiceTemplate.ejs");
  
  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    console.error(`Arena invoice template not found at: ${templatePath}`);
    throw new Error(`Arena invoice template not found at: ${templatePath}`);
  }

  console.log('Using template:', templatePath);
  console.log('Arena data for template:', arenaData);

  try {
    const html = await ejs.renderFile(templatePath, { arena: arenaData });
    console.log('HTML generated, creating PDF...');

    return new Promise((resolve, reject) => {
      const options = {
        format: 'A4',
        orientation: 'portrait',
        border: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        timeout: 30000 // 30 second timeout
      };

      pdf.create(html, options).toFile(outputPath, (err, res) => {
        if (err) {
          console.error('PDF creation error:', err);
          reject(err);
        } else {
          console.log('PDF created successfully:', res.filename);
          resolve(res.filename);
        }
      });
    });
  } catch (error) {
    console.error('Error rendering EJS template:', error);
    throw error;
  }
};