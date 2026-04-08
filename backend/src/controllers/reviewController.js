const pool = require('../config/db');


const addReview = async (req, res) => {
    const { request_id, rating, comment } = req.body;
    const reviewerId = req.user.id;

    try {
        
        const request = await pool.query(
            `SELECT requests.*, services.user_id as seller_id 
             FROM requests 
             JOIN services ON requests.service_id = services.id 
             WHERE requests.id = $1`, [request_id]
        );

        if (request.rows.length === 0) return res.status(404).json({ message: "Zahtjev nije pronađen." });
        
        const data = request.rows[0];
        
        if (data.status !== 'completed') return res.status(400).json({ message: "Možete ocijeniti samo završene usluge." });
        if (data.buyer_id !== reviewerId) return res.status(403).json({ message: "Samo kupac može ostaviti recenziju." });

        
        const existingReview = await pool.query('SELECT * FROM reviews WHERE request_id = $1', [request_id]);
        if (existingReview.rows.length > 0) return res.status(400).json({ message: "Već ste ocijenili ovu uslugu." });

        const newReview = await pool.query(
            'INSERT INTO reviews (request_id, reviewer_id, reviewee_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [request_id, reviewerId, data.seller_id, rating, comment]
        );

        res.status(201).json(newReview.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};


const getUserReviews = async (req, res) => {
    const { userId } = req.params;
    const loggedInUserId = req.user ? req.user.id : null;
    try {
        const reviews = await pool.query(
            `SELECT reviews.*, users.name as reviewer_name 
             FROM reviews 
             JOIN users ON reviews.reviewer_id = users.id 
             WHERE reviewee_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        if (loggedInUserId && parseInt(userId) === loggedInUserId) {
            await pool.query(
                'UPDATE reviews SET is_read = true WHERE reviewee_id = $1 AND is_read = false', 
                [loggedInUserId]
            );
        }
        res.json(reviews.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

const markReviewsAsRead = async (req, res) => {
    const userId = req.user.id;
    try {
        await pool.query(
            'UPDATE reviews SET is_read = true WHERE reviewee_id = $1 AND is_read = false', 
            [userId]
        );
        res.json({ message: "Recenzije označene kao pročitane." });
    } catch (err) {
        console.error("Greška u markReviewsAsRead:", err.message);
        res.status(500).send("Server error");
    }
};

module.exports = { addReview, getUserReviews, markReviewsAsRead };