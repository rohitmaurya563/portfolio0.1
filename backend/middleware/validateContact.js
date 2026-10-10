const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContact(req, res, next) {
  const { name, email, subject, message } = req.body || {};

  if ([name, email, subject, message].some((v) => typeof v !== 'string')) {
    return res.status(400).json({ success: false, error: 'Invalid form data.' });
  }

  const errors = [];

  if (name.trim().length < 2) errors.push('Name must be at least 2 characters.');
  if (!EMAIL_RE.test(email.trim())) errors.push('Please provide a valid email address.');
  if (!subject.trim()) errors.push('Subject cannot be empty.');
  if (message.trim().length < 10) errors.push('Message must be at least 10 characters.');

  if (name.length > 100 || email.length > 150 || subject.length > 150 || message.length > 5000) {
    errors.push('One of the fields is too long.');
  }

  const links = message.match(/https?:\/\//g);
  if (links && links.length > 3) errors.push('Message looks like spam (too many links).');

  if (errors.length) {
    return res.status(400).json({ success: false, error: errors.join(' ') });
  }

  req.body.name = name.trim();
  req.body.email = email.trim();
  req.body.subject = subject.trim();
  req.body.message = message.trim();
  next();
}

module.exports = { validateContact };