const pool = require('../config/db');

const admin = async (req, res, next) => {
    try {
        const user = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
        
        if (user.rows[0] && user.rows[0].is_admin) {
            next();
        } else {
            res.status(403).json({ message: "Pristup odbijen. Potrebne su admin ovlasti." });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = admin;