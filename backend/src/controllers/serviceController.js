const pool = require('../config/db');


const createService = async (req, res) => {
    const { title, description, price, category, location, service_type  } = req.body;
    const userId = req.user.id; 
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const newService = await pool.query(
            'INSERT INTO services (user_id, title, description, price, category, location, service_type, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [userId, title, description, price, category, location, service_type, imageUrl]
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

const getServiceById = async (req, res) => {
    const { id } = req.params;
    try {
        const service = await pool.query(
            'SELECT services.*, users.name as provider_name, users.email as provider_email FROM services JOIN users ON services.user_id = users.id WHERE services.id = $1',
            [id]
        );

        if (service.rows.length === 0) {
            return res.status(404).json({ message: "Usluga nije pronađena." });
        }
        res.json(service.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};


const updateService = async (req, res) => {
    const { id } = req.params;
    const { title, description, price, category,location, service_type } = req.body;
    const userId = req.user.id;

    try {
        const service = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
        
        if (service.rows.length === 0) return res.status(404).json({ message: "Usluga nije pronađena." });
        if (service.rows[0].user_id !== userId) return res.status(403).json({ message: "Nemate ovlasti za izmjenu ove usluge." });

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : service.rows[0].image_url;

        const updatedService = await pool.query(
            `UPDATE services 
             SET title = $1, description = $2, price = $3, category = $4, location = $5, service_type = $6, image_url = $7 
             WHERE id = $8 RETURNING *`,
            [title, description, price, category, location, service_type, imageUrl, id]
        );

        res.json(updatedService.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};


const deleteService = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const service = await pool.query('SELECT * FROM services WHERE id = $1', [id]);

        if (service.rows.length === 0) return res.status(404).json({ message: "Usluga nije pronađena." });
        if (service.rows[0].user_id !== userId) return res.status(403).json({ message: "Nemate ovlasti za brisanje ove usluge." });

        await pool.query('DELETE FROM services WHERE id = $1', [id]);
        res.json({ message: "Usluga uspješno obrisana." });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

module.exports = { createService, getAllServices, getServiceById, updateService, deleteService };