const db = require("../config/db");

const Contact = {
    createMessage: (data, callback) => {
        const query = "INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)";
        db.query(query, [data.name, data.email, data.phone, data.message], callback);
    },

    receiveMessages: (callback) => {
        const query = "SELECT id, name, message, email, phone, status, created_at FROM contact_messages ORDER BY created_at DESC";
         db.query(query,callback);
    }, 

    updateMessageStatus: (id, status, callback) => {
        const query = "UPDATE contact_messages SET status = ? WHERE id = ?";
        db.query(query, [status, id], callback);
    }
 };
    


module.exports = Contact;
