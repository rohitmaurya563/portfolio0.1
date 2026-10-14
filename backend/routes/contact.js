const express = require('express');
const router = express.Router();

const { validateContact } = require('../middleware/validateContact');
const { contactLimiter } = require('../middleware/rateLimiter');
const { sendContactEmail } = require('../utils/mailer');

// POST /api/contact
router.post('/', contactLimiter, validateContact, async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    // If SMTP isn't configured yet, don't crash — log instead so local dev still works.
   if (!process.env.MAIL_SCRIPT_URL || !process.env.MAIL_SCRIPT_SECRET) {
      console.log('--- Contact form submission (SMTP not configured, logging only) ---');
      console.log({ name, email, subject, message });
      return res.status(200).json({
        success: true,
        note: 'Message received (email sending is not configured yet — see .env.example).',
      });
    }

    await sendContactEmail({ name, email, subject, message });
    return res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Failed to send contact email:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong while sending your message. Please try again later.',
    });
  }
});

module.exports = router;
