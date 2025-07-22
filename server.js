require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require("path");
const fs = require("fs");

const routes = require("./routes");
const { dir } = require('console');
const app = express();

// Middleware
app.use(cors({
  origin: 'https://courtfind-frontend.vercel.app',
  credentials: true
}));
app.options('*', cors()); // handle preflight

app.use(express.json()); // JSON Parsing (No need for bodyParser.json())
app.use(express.urlencoded({ extended: true })); // Handle form data

//Ensure uploads, uploads/Arenas, uploads/Courts directories exist
const uploadDirs = ['uploads', 'uploads/arenas', 'uploads/courts', 'uploads/player', 'uploads/invoices'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if(!fs.existsSync(fullPath)){
        fs.existsSync(fullPath,{recursive: true});
         }

});

// Static File Serving (For profile image uploads, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/invoices", express.static(path.join(__dirname, "uploads/invoices")));


// Routes
app.use('/api', routes);

// Starting the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});