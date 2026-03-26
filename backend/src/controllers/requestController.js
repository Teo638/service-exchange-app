const pool = require('../config/db');


const sendRequest = async (req, res) => {
    const { service_id, preferred_time, message } = req.body;
    const buyer_id = req.user.id;

    try {
        
        const service = await pool.query('SELECT * FROM services WHERE id = $1', [service_id]);
        if (service.rows.length === 0) return res.status(404).json({ message: "Usluga nije pronađena." });

        
        if (service.rows[0].user_id === buyer_id) {
            return res.status(400).json({ message: "Ne možete poslati zahtjev za vlastitu uslugu." });
        }

        const newRequest = await pool.query(
            'INSERT INTO requests (service_id, buyer_id, status, preferred_time, message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [service_id, buyer_id, 'pending', preferred_time, message]
        );

        res.status(201).json(newRequest.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};


const getMySentRequests = async (req, res) => {
    const userId = req.user.id;
    try {
        const requests = await pool.query(
            `SELECT requests.*, services.title as service_title, users.name as seller_name 
             FROM requests 
             JOIN services ON requests.service_id = services.id 
             JOIN users ON services.user_id = users.id 
             WHERE requests.buyer_id = $1`,
            [userId]
        );
        res.json(requests.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};


const getReceivedRequests = async (req, res) => {
    const userId = req.user.id;
    try {
        const requests = await pool.query(
            `SELECT requests.*, services.title as service_title, users.name as buyer_name 
             FROM requests 
             JOIN services ON requests.service_id = services.id 
             JOIN users ON requests.buyer_id = users.id 
             WHERE services.user_id = $1`,
            [userId]
        );
        res.json(requests.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};


const updateRequestStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 
    const userId = req.user.id;

    try {
        
        const request = await pool.query(
            `SELECT requests.*, services.user_id as seller_id FROM requests 
             JOIN services ON requests.service_id = services.id 
             WHERE requests.id = $1`, [id]
        );

        if (request.rows.length === 0) return res.status(404).json({ message: "Zahtjev nije pronađen." });
        if (request.rows[0].seller_id !== userId) return res.status(403).json({ message: "Nemate ovlasti za ovu akciju." });

        const updatedRequest = await pool.query(
            'UPDATE requests SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        res.json(updatedRequest.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

module.exports = { sendRequest, getMySentRequests, getReceivedRequests, updateRequestStatus };