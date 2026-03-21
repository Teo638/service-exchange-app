const pool = require('../config/db');

const askQuestion = async (req, res) => {
    const { service_id, question } = req.body;
    const userId = req.user.id;

    try {
        const newQuestion = await pool.query(
            'INSERT INTO public_questions (service_id, user_id, question) VALUES ($1, $2, $3) RETURNING *',
            [service_id, userId, question]
        );
        res.status(201).json(newQuestion.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};


const answerQuestion = async (req, res) => {
    const { id } = req.params; 
    const { answer } = req.body;
    const userId = req.user.id;

    try {
        
        const questionData = await pool.query(
            `SELECT public_questions.*, services.user_id as owner_id 
             FROM public_questions 
             JOIN services ON public_questions.service_id = services.id 
             WHERE public_questions.id = $1`, [id]
        );

        if (questionData.rows.length === 0) return res.status(404).json({ message: "Pitanje nije pronađeno." });
        if (questionData.rows[0].owner_id !== userId) return res.status(403).json({ message: "Samo vlasnik oglasa može odgovoriti." });

        const updatedQuestion = await pool.query(
            'UPDATE public_questions SET answer = $1 WHERE id = $2 RETURNING *',
            [answer, id]
        );

        res.json(updatedQuestion.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};


const getQuestionsByService = async (req, res) => {
    const { serviceId } = req.params;
    try {
        const questions = await pool.query(
            `SELECT public_questions.*, users.name as user_name 
             FROM public_questions 
             JOIN users ON public_questions.user_id = users.id 
             WHERE service_id = $1 ORDER BY created_at DESC`,
            [serviceId]
        );
        res.json(questions.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

module.exports = { askQuestion, answerQuestion, getQuestionsByService };