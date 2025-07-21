const ejs = require("ejs");
const path = require("path");
const pdf = require("html-pdf");
const fs = require("fs");

exports.generateInvoicePDF = async (bookingData, outputPath) => {
  const templatePath = path.join(__dirname, "../views/invoiceTemplate.ejs");
  const html = await ejs.renderFile(templatePath, { booking: bookingData });

  return new Promise((resolve, reject) => {
    pdf.create(html).toFile(outputPath, (err, res) => {
      if (err) reject(err);
      else resolve(res.filename);
    });
  });
};


exports.generateArenaInvoicePDF = async (arenaData, outputPath) => {
  const templatePath = path.join(__dirname, "../views/arenaInvoiceTemplate.ejs");
  const html = await ejs.renderFile(templatePath, { arena: arenaData });

  return new Promise((resolve, reject) => {
    pdf.create(html).toFile(outputPath, (err, res) => {
      if (err) reject(err);
      else resolve(res.filename);
    });
  });
};

