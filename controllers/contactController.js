const Contact = require("../models/contactModel");

exports.submitContactForm = (req, res) => {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    Contact.createMessage({ name, email, phone, message }, (err, result) => {
        if (err) {
            console.error("Error saving contact message:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "Message received successfully" });
    });
};

exports.getAllMessages = async (req, res) => {
    try {
        Contact.receiveMessages((err,results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "No messages found" });
            }
            //console.log("All messages:", results); // Debugging line
            res.json(results);
        });
        } catch (err) {
            console.error("Error:", err);
            res.status(500).json({ error: err.message });
        }
};  

exports.updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = req.body.status;
        Contact.updateMessageStatus(id, status, (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            //console.log("Status updated:", result); // Debugging line
            res.json(result[0]);
        })

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: err.message });
    } 
}       


