const pool = require('../config/db');
const fs = require('fs'); 
const path = require('path');


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
    const { search, category, location, minPrice, maxPrice, type} = req.query;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const offset = (page - 1) * limit;

    try {
        let queryText = `
            SELECT services.*, users.name as provider_name, users.avatar_url as provider_avatar
            FROM services 
            JOIN users ON services.user_id = users.id 
            WHERE 1=1`; 
        
        let queryParams = [];

        
        if (search) {
            queryParams.push(`%${search}%`);
            queryText += ` AND (services.title ILIKE $${queryParams.length} OR services.description ILIKE $${queryParams.length})`;
        }

        if (category) {
            queryParams.push(category);
            queryText += ` AND services.category = $${queryParams.length}`;
        }

        if (location) {
            queryParams.push(location);
            queryText += ` AND services.location ILIKE $${queryParams.length}`;
        }

        if (minPrice) {
            queryParams.push(minPrice);
            queryText += ` AND services.price >= $${queryParams.length}`;
        }

        if (maxPrice) {
            queryParams.push(maxPrice);
            queryText += ` AND services.price <= $${queryParams.length}`;
        }

        if (type) {
            queryParams.push(type);
            queryText += ` AND services.service_type = $${queryParams.length}`;
        }

        const countText = `SELECT COUNT(*) FROM (${queryText}) AS total_query`;
        const totalCountResult = await pool.query(countText, queryParams);
        const totalCount = parseInt(totalCountResult.rows[0].count);

        
        queryText += ` ORDER BY services.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);

        const services = await pool.query(queryText, queryParams);

        

        res.json({
            services: services.rows,
            pagination: {
                totalServices: totalCount,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

const getServiceById = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE services SET views_count = views_count + 1 WHERE id = $1', [id]);

        const service = await pool.query(
            'SELECT services.*, users.name as provider_name, users.email as provider_email, users.avatar_url as provider_avatar FROM services JOIN users ON services.user_id = users.id WHERE services.id = $1',
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

        let imageUrl = service.rows[0].image_url;
        if (req.file) {
            if (imageUrl) {
                const oldPath = path.join(__dirname, '../../', service.rows[0].image_url);
                if (fs.existsSync(oldPath)) await fs.promises.unlink(oldPath);
            }
            imageUrl = `/uploads/${req.file.filename}`;
        }

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
    const isAdmin = req.user.is_admin;

    try {
        const serviceResult = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
        const service = serviceResult.rows[0];

        if (!service) return res.status(404).json({ message: "Usluga nije pronađena." });
        
        if (service.user_id !== userId && !isAdmin) {
            return res.status(403).json({ message: "Nemate ovlasti za brisanje ove usluge." });
        }

         if (service.image_url) {
            const imagePath = path.join(__dirname, '../../', service.image_url);
            if (fs.existsSync(imagePath)) await fs.promises.unlink(imagePath);
        }

        await pool.query('DELETE FROM services WHERE id = $1', [id]);
        res.json({ message: "Usluga uspješno obrisana." });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

module.exports = { createService, getAllServices, getServiceById, updateService, deleteService };