const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs'); 
const path = require('path');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateAccessToken = (user) => {
    
    return jwt.sign(
        { id: user.id, is_admin: user.is_admin }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

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
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Pogrešan email ili lozinka." });
        }

        
        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Pogrešan email ili lozinka." });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        
        await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)', 
            [user.id, refreshToken, expiresAt]);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, 
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.json({
            message: "Prijava uspješna!",
            accessToken, 
            user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url, is_admin: user.is_admin }
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

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)', [user.id, refreshToken, expiresAt]);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: "Google prijava uspješna!",
            accessToken,
            user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url, is_admin: user.is_admin }
        });

    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(400).json({ message: "Google verifikacija neuspješna." });
    }
};

const handleRefreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Niste prijavljeni." });

    try {
        const result = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [refreshToken]);
        if (result.rows.length === 0) return res.status(403).json({ message: "Neispravan token." });

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Token je istekao." });
            const userResult = await pool.query(
                'SELECT id, is_admin FROM users WHERE id = $1',
                [decoded.id]
            );
            if (userResult.rows.length === 0) {
                return res.status(403).json({ message: "Korisnik nije pronađen." });
            }
            
            const accessToken = generateAccessToken(userResult.rows[0]);
            res.json({ accessToken });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

const logoutUser = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    try {
        if (refreshToken) {
            await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
        }
        res.clearCookie('refreshToken');
        res.json({ message: "Odjava uspješna." });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};


const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { name, password } = req.body;
    let avatarUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        if (!user) return res.status(404).json({ message: "Korisnik nije pronađen." });

        let hashedPassword = user.password;
        
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        
        if (req.file && user.avatar_url) {
            const oldPath = path.join(__dirname, '../../', user.avatar_url);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        } else if (!req.file) {
            avatarUrl = user.avatar_url; 
        }

        
        const updatedUser = await pool.query(
            'UPDATE users SET name = $1, password = $2, avatar_url = $3 WHERE id = $4 RETURNING id, name, email, avatar_url, is_admin',
            [name || user.name, hashedPassword, avatarUrl, userId]
        );

        res.json({
            message: "Profil uspješno ažuriran!",
            user: updatedUser.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

const getUserPublicProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const userResult = await pool.query(
            'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1',
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "Korisnik nije pronađen." });
        }

        res.json(userResult.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

const deleteMyAccount = async (req, res) => {
    const userId = req.user.id;

    try {
        const servicesResult = await pool.query('SELECT image_url FROM services WHERE user_id = $1', [userId]);
        servicesResult.rows.forEach(service => {
            if (service.image_url) {
                const imagePath = path.join(__dirname, '../../', service.image_url);
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            }
        });

        const userResult = await pool.query('SELECT avatar_url FROM users WHERE id = $1', [userId]);
        const avatarUrl = userResult.rows[0]?.avatar_url;
        if (avatarUrl) {
            const avatarPath = path.join(__dirname, '../../', avatarUrl);
            if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
        }

   
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        
        res.clearCookie('refreshToken');

        res.json({ message: "Vaš račun i svi povezani podaci su trajno obrisani." });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};




module.exports = { registerUser, loginUser, googleLogin, handleRefreshToken, logoutUser,  updateProfile, getUserPublicProfile, deleteMyAccount};