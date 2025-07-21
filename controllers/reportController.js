const reportService = require('../models/reportModel');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

exports.downloadArenaRevenueReport = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const data = await reportService.getArenaRevenues(ownerId);

    const doc = new PDFDocument({ margin: 50 });
    const filename = `Arena_Revenue_Report_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, `../uploads/reports/${filename}`);
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // === Add Logo ===
    const logoPath = path.join(__dirname, '../uploads/assets/logoOnly.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width - 100, 30, { width: 50 });
    }

    // === Title ===
    doc
      .fontSize(22)
      .fillColor('#2E86C1')
      .text('Arena Revenue Insight Report', { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .fillColor('black')
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' })
      .moveDown(2);

    if (data.length === 0) {
      doc.fontSize(14).text('No revenue data available.', { align: 'center' });
    } else {
      const maxTotal = Math.max(...data.map(d => d.total));
      const barMaxWidth = 300;

      data.forEach((row, index) => {
        const barWidth = (row.total / maxTotal) * barMaxWidth;
        const y = doc.y;

        // Arena name
        doc
          .fontSize(12)
          .fillColor('#000')
          .text(`${index + 1}. ${row.name}`, 50, y);

        // Bar background
        doc
          .rect(200, y, barMaxWidth, 15)
          .fill('#E5E8E8')
          .stroke();

        // Revenue bar
        doc
          .rect(200, y, barWidth, 15)
          .fill('#3498DB');

        // Revenue amount
        doc
          .fillColor('#000')
          .text(`Rs. ${parseFloat(row.total).toFixed(2)}`, 510, y);

        doc.moveDown(2);
      });
    }

    doc.end();

    writeStream.on('finish', () => {
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Download error:', err);
          return res.status(500).json({ error: 'Failed to download file' });
        }

        // Optional: delete file after download
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
      });
    });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

exports.getMostBookedCourts = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const data = await reportService.getMostBookedCourts(ownerId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching most booked courts:', error);
    res.status(500).json({ message: 'Failed to fetch court data' });
  }
};
