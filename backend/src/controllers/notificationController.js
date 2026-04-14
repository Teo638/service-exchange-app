const pool = require('../config/db');

const getNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const [
            messageCount,
            receivedCount,
            sentCount,
            questionCount,
            reviewCount,
            answerCount
        ] = await Promise.all([
            pool.query(
                'SELECT COUNT(*)::int FROM messages WHERE receiver_id = $1 AND is_read = false',
                [userId]
            ),
            pool.query(
                `SELECT COUNT(*)::int FROM requests 
                 JOIN services ON requests.service_id = services.id
                 WHERE services.user_id = $1 AND requests.is_read_by_seller = false`,
                [userId]
            ),
            pool.query(
                'SELECT COUNT(*)::int FROM requests WHERE buyer_id = $1 AND is_read_by_buyer = false',
                [userId]
            ),
            pool.query(
                `SELECT COUNT(*)::int FROM public_questions q
                 JOIN services s ON q.service_id = s.id
                 WHERE s.user_id = $1 AND q.is_read = false`,
                [userId]
            ),
            pool.query(
                'SELECT COUNT(*)::int FROM reviews WHERE reviewee_id = $1 AND is_read = false',
                [userId]
            ),
            pool.query(
                'SELECT COUNT(*)::int FROM public_questions WHERE user_id = $1 AND is_answer_read = false',
                [userId]
            )
        ]);

        res.json({
            messages: messageCount.rows[0].count,
            unreadReceived: receivedCount.rows[0].count,
            unreadSent: sentCount.rows[0].count,
            unreadQuestions: questionCount.rows[0].count,
            unreadReviews: reviewCount.rows[0].count,
            unreadAnswers: answerCount.rows[0].count
        });
    } catch (err) {
        console.error("Greška pri brojanju obavijesti:", err.message);
        res.status(500).json({ messages: 0, unreadReceived: 0, unreadSent: 0 });
    }
};

module.exports = { getNotifications };