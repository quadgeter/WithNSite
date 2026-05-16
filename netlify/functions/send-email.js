export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { name, phone, email, service, details } = await req.json();

  const payload = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    user_id: process.env.EMAILJS_PUBLIC_KEY,
    template_params: { name, phone, email, service, details }
  };

  const sendTemplate = async (template_id) => {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, template_id })
    });
    if (!res.ok) throw new Error(await res.text());
  };

  try {
    await Promise.all([
      sendTemplate(process.env.EMAILJS_TEMPLATE_CLIENT),
      sendTemplate(process.env.EMAILJS_TEMPLATE_ADMIN)
    ]);
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('EmailJS error:', err.message);
    return new Response('Failed to send', { status: 500 });
  }
};

export const config = { path: '/api/send-email' };
