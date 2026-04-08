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
            'UPDATE public_questions SET answer = $1, is_answer_read = false WHERE id = $2 RETURNING *',
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
    const userId = req.user.id;
    try {
        const questions = await pool.query(
            `SELECT public_questions.*, users.name as user_name 
             FROM public_questions 
             JOIN users ON public_questions.user_id = users.id 
             WHERE service_id = $1 ORDER BY created_at DESC`,
            [serviceId]
        );
         if (userId) {
            await pool.query(
                `UPDATE public_questions SET is_read = true 
                 FROM services WHERE public_questions.service_id = services.id 
                 AND services.user_id = $1 AND public_questions.service_id = $2
                 AND public_questions.is_read = false`,
                [userId, serviceId]
            );
             await pool.query(
                `UPDATE public_questions SET is_answer_read = true 
                 WHERE user_id = $1 AND service_id = $2
                 AND is_answer_read = false`,
                [userId, serviceId]
            );
        }
        res.json(questions.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

const deleteQuestion = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.is_admin;

    try {
        const questionData = await pool.query(
            `SELECT q.*, s.user_id as service_owner_id 
             FROM public_questions q
             JOIN services s ON q.service_id = s.id
             WHERE q.id = $1`, [id]
        );

        if (questionData.rows.length === 0) return res.status(404).json({ message: "Pitanje nije pronađeno." });
        const q = questionData.rows[0];

        if (q.user_id !== userId && q.service_owner_id !== userId && !isAdmin) {
            return res.status(403).json({ message: "Nemate ovlasti za brisanje ovog pitanja." });
        }

        await pool.query('DELETE FROM public_questions WHERE id = $1', [id]);
        res.json({ message: "Pitanje uspješno obrisano." });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

const markQuestionsAsRead = async (req, res) => {
    const userId = req.user.id;
    try {
        await pool.query(
            `UPDATE public_questions SET is_read = true 
             FROM services WHERE public_questions.service_id = services.id 
             AND services.user_id = $1`, [userId]
        );
        res.json({ message: "Pitanja označena kao pročitana." });
    } catch (err) {
        res.status(500).send("Server error");
    }
};

const markAnswerAsRead = async (req, res) => {
    const userId = req.user.id;
    try {
        await pool.query(
            'UPDATE public_questions SET is_answer_read = true WHERE user_id = $1 AND is_answer_read = false', 
            [userId]
        );
        res.json({ message: "Odgovori označeni kao pročitani." });
    } catch (err) {
        res.status(500).send("Server error");
    }
};

module.exports = { askQuestion, answerQuestion, getQuestionsByService, deleteQuestion, markQuestionsAsRead, markAnswerAsRead };