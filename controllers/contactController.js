const Contact = require("../models/contactModel");

exports.submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !phone || !message) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const result = await Contact.createMessage({ name, email, phone, message });
        res.status(201).json({ message: "Message received successfully" });
    } catch (error) {
        console.error("Error saving contact message:", error);
        res.status(500).json({ error: "Database error" });
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const results = await Contact.receiveMessages();
        
        if (results.length === 0) {
            return res.status(404).json({ message: "No messages found" });
        }
        //console.log("All messages:", results); // Debugging line
        res.json(results);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error" });
    }
};  

exports.updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = req.body.status;
        
        const result = await Contact.updateMessageStatus(id, status);
        //console.log("Status updated:", result); // Debugging line
        res.json(result);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error" });
    }
};