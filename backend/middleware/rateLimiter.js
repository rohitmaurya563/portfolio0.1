const rateLimit = require('express-rate-limit');

// Stops one visitor from spamming the contact form: max 5 submissions
// per 15 minutes per IP address.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many messages sent from this device. Please try again in a while.',
  },
});

module.exports = { contactLimiter };
