const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./src/config/db'); 


const authRoutes = require('./src/routes/authRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json()); 


app.get('/', (req, res) => {
    res.send('Server radi, baza je povezana.');
});


app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);


pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Greška pri povezivanju na bazu:', err);
    } else {
        console.log('PostgreSQL povezan uspješno');
    }
});

app.listen(PORT, () => {
    console.log(`Server je pokrenut na portu ${PORT}`);
});