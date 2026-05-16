function sendEmail(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  Promise.all([
    emailjs.sendForm('service_f3petev', 'template_abouckx', form, 'tGpRMPWgA3I6GyErH'),
    emailjs.sendForm('service_f3petev', 'template_t8mkodm', form, 'tGpRMPWgA3I6GyErH')
  ]).then(() => {
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit"
    showToast('Message Sent!');
  }).catch((error) => {
    console.error('Failed:', error);
    submitBtn.disabled = false;
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
