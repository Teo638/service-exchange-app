const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
       
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Molimo ispunite sva polja." });
        }

        
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Korisnik s tim emailom već postoji." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        res.status(201).json({
            message: "Korisnik uspješno registriran!",
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: "Pogrešan email ili lozinka." });
        }

        
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: "Pogrešan email ili lozinka." });
        }

       
        const token = jwt.sign(
            { id: user.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } 
        );

        res.json({
            message: "Prijava uspješna!",
            token: token,
            user: {
                id: user.rows[0].id,
                name: user.rows[0].name,
                email: user.rows[0].email
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

const googleLogin = async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, sub: google_id } = ticket.getPayload();

        let userResult = await pool.query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [google_id, email]);

        let user;
        if (userResult.rows.length === 0) {
            const newUser = await pool.query(
                'INSERT INTO users (name, email, google_id) VALUES ($1, $2, $3) RETURNING id, name, email',
                [name, email, google_id]
            );
            user = newUser.rows[0];
        } else {
            user = userResult.rows[0];
            if (!user.google_id) {
                await pool.query('UPDATE users SET google_id = $1 WHERE email = $2', [google_id, email]);
            }
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: "Google prijava uspješna!",
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(400).json({ message: "Google verifikacija neuspješna." });
    }
};

const getNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const messageCount = await pool.query(
            'SELECT COUNT(*)::int FROM messages WHERE receiver_id = $1 AND is_read = false',
            [userId]
        );
        const receivedCount = await pool.query(
            `SELECT COUNT(*)::int FROM requests 
             JOIN services ON requests.service_id = services.id
             WHERE services.user_id = $1 AND requests.is_read_by_seller = false`,
            [userId]
        );
        const sentCount = await pool.query(
            'SELECT COUNT(*)::int FROM requests WHERE buyer_id = $1 AND is_read_by_buyer = false',
            [userId]
        );
        res.json({
            messages: messageCount.rows[0].count,
            unreadReceived: receivedCount.rows[0].count,
            unreadSent: sentCount.rows[0].count
        });
    } catch (err) {
        console.error("Greška pri brojanju obavijesti:", err.message);
        res.status(500).json({ messages: 0, unreadReceived: 0, unreadSent: 0 });
    }
};

module.exports = { registerUser, loginUser, googleLogin, getNotifications };