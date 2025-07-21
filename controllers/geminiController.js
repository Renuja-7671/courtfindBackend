const axios = require("axios");
require("dotenv").config();

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";
const API_KEY = process.env.GEMINI_API_KEY;

exports.chatWithGemini = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const systemInstruction = `
            You are a helpful assistant for "COURTFIND" online sports arena booking system.
            You should ONLY answer questions related to:
            - Booking a sports arena
            - sports
            - Health benifits gained from sports
            - Available sports facilities
            - Pricing and timings of sports arenas
            - User registration for booking
            - Payment and cancellation policies
            - Rules and regulations of the sports center
            - Customer support related to arena bookings
            
            If a user asks about **anything unrelated** (e.g., general knowledge, weather, history, coding, etc.), politely respond:
            "I can only assist with sports arena booking-related queries."
        `;

        const response = await axios.post(`${GEMINI_API_URL}?key=${API_KEY}`, {
            contents: [
                { role: "user", parts: [{ text: systemInstruction }] }, // System instructions
                { role: "user", parts: [{ text: message }] } // User input
            ]
        });


        // Extract response properly
        const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "I can only assist with sports arena booking-related queries.";

        res.json({ reply });
    } catch (error) {
        console.error("Gemini API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Error communicating with Gemini AI" });
    }
};
