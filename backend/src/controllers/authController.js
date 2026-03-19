const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

module.exports = { registerUser, loginUser };