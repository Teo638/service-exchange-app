const pool = require('../config/db');

const sendMessage = async (req, res) => {
    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;

    try {
        const newMessage = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
            [sender_id, receiver_id, content]
        );
        res.status(201).json(newMessage.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};


const getChatHistory = async (req, res) => {
    const myId = req.user.id;
    const otherUserId = req.params.userId;

    try {
        const messages = await pool.query(
            `SELECT * FROM messages 
             WHERE (sender_id = $1 AND receiver_id = $2) 
             OR (sender_id = $2 AND receiver_id = $1) 
             ORDER BY created_at ASC`,
            [myId, otherUserId]
        );
        res.json(messages.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

const getContacts = async (req, res) => {
    const userId = req.user.id;
    try {
        
        const contacts = await pool.query(
            `SELECT DISTINCT ON (u.id) 
                u.id, 
                u.name, 
                m.content as last_message, 
                m.created_at
             FROM users u
             JOIN messages m ON (u.id = m.sender_id OR u.id = m.receiver_id)
             WHERE (m.sender_id = $1 OR m.receiver_id = $1) AND u.id != $1
             ORDER BY u.id, m.created_at DESC`,
            [userId]
        );
        res.json(contacts.rows);
    } catch (err) {
        console.error("Greška:", err.message);
        res.status(500).send("Server error");
    }
};

module.exports = { sendMessage, getChatHistory, getContacts };