const getNotificationCount = async (req, res) => {
    const userId = req.user.id;
    try {
        
        const msgCount = await pool.query('SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = false', [userId]);
         
        const reqSellerCount = await pool.query(
            'SELECT COUNT(*) FROM requests r JOIN services s ON r.service_id = s.id WHERE s.user_id = $1 AND r.is_read_by_seller = false', 
            [userId]
        );

        const reqBuyerCount = await pool.query('SELECT COUNT(*) FROM requests WHERE buyer_id = $1 AND is_read_by_buyer = false', [userId]);

        res.json({
            messages: parseInt(msgCount.rows[0].count),
            requests: parseInt(reqSellerCount.rows[0].count) + parseInt(reqBuyerCount.rows[0].count)
        });
    } catch (err) {
        res.status(500).send("Server error");
    }
};