const pool = require('../config/db');


const createService = async (req, res) => {
    const { title, description, price, category } = req.body;
    const userId = req.user.id; 

    try {
        const newService = await pool.query(
            'INSERT INTO services (user_id, title, description, price, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, title, description, price, category]
        );
        res.status(201).json(newService.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};


const getAllServices = async (req, res) => {
    try {
        const services = await pool.query(
            'SELECT services.*, users.name as provider_name FROM services JOIN users ON services.user_id = users.id ORDER BY created_at DESC'
        );
        res.json(services.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

module.exports = { createService, getAllServices };