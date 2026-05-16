function sendEmail(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  const data = {
    name: form['full-name'].value,
    phone: form['phone'].value,
    email: form['email'].value,
    service: form['service'].value,
    details: form['project-details'].value
  };

  fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then((res) => {
    if (!res.ok) throw new Error('Server error');
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
    showToast('Message Sent!');
  }).catch((error) => {
    console.error('Failed:', error);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
    alert('Something went wrong. Please try again.');
  });
}

function showToast(message) {
  const toast = document.getElementById('toast-notification');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

window.sendEmail = sendEmail;
export default sendEmail;
