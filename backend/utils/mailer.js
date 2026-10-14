async function sendContactEmail({ name, email, subject, message }) {
  const res = await fetch(process.env.MAIL_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      secret: process.env.MAIL_SCRIPT_SECRET,
      name,
      email,
      subject,
      message,
    }),
    redirect: 'follow',
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Mail script failed');
  }
}

module.exports = { sendContactEmail };