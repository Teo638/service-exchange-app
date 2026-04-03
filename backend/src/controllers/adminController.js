const pool = require('../config/db');

const getDashboardStats = async (req, res) => {
    try {
        
        const [usersCount, servicesCount, requestsCount, latestUsers] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM users'),
            pool.query('SELECT COUNT(*) FROM services'),
            pool.query('SELECT COUNT(*) FROM requests'),
            pool.query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5')
]);

        res.json({
            totalUsers: parseInt(usersCount.rows[0].count),
            totalServices: parseInt(servicesCount.rows[0].count),
            totalRequests: parseInt(requestsCount.rows[0].count),
            latestUsers: latestUsers.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await pool.query('SELECT id, name, email, is_admin, created_at FROM users ORDER BY created_at DESC');
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await pool.query('SELECT is_admin FROM users WHERE id = $1', [id]);
        if (user.rows.length === 0) return res.status(404).json({ message: "Korisnik nije pronađen." });

        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: "Ne možete obrisati vlastiti račun putem admin panela." });
        }

        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: "Korisnik i svi njegovi podaci su uspješno obrisani." });
    } catch (err) {
        res.status(500).send("Server error");
    }
};


const toggleAdminRole = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await pool.query('SELECT is_admin FROM users WHERE id = $1', [id]);
        if (user.rows.length === 0) return res.status(404).json({ message: "Korisnik nije pronađen." });

        const newStatus = !user.rows[0].is_admin;
        await pool.query('UPDATE users SET is_admin = $1 WHERE id = $2', [newStatus, id]);

        res.json({ message: `Korisnik je sada ${newStatus ? 'Admin' : 'običan korisnik'}.` });
    } catch (err) {
        res.status(500).send("Server error");
    }
};


const getExtendedStats = async (req, res) => {
    try {
        
        const categoryStats = await pool.query(
            'SELECT category, COUNT(*) FROM services GROUP BY category ORDER BY count DESC'
        );

        const recentRequests = await pool.query(
            "SELECT COUNT(*) FROM requests WHERE created_at > NOW() - INTERVAL '7 days'"
        );

        res.json({
            categories: categoryStats.rows,
            requestsLast7Days: parseInt(recentRequests.rows[0].count)
        });
    } catch (err) {
        res.status(500).send("Server error");
    }
};

module.exports = { getDashboardStats, getAllUsers, deleteUser, toggleAdminRole, getExtendedStats };