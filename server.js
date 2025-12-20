require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require("path");
const fs = require("fs");

const routes = require("./routes");
const app = express();

// Fix CORS configuration
app.use(cors({
  origin:true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Static file serving
const uploadDirs = ['uploads', 'uploads/arenas', 'uploads/courts', 'uploads/player', 'uploads/invoices'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if(!fs.existsSync(fullPath)){
        fs.mkdirSync(fullPath, {recursive: true}); // Fixed: mkdirSync instead of existsSync
    }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/invoices", express.static(path.join(__dirname, "uploads/invoices")));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});