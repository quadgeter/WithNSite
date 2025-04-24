function sendEmail(e) {
  emailjs.sendForm(
    'service_f3petev',
    'template_abouckx',
    e.target,
    'tGpRMPWgA3I6GyErH' // Public key
  ).then(
    (result) => {
      console.log('Success:', result.text);
    },
    (error) => {
      console.log('Failed:', error.text);
    }
  );

  emailjs.sendForm(
    'service_f3petev',
    'template_t8mkodm',
    e.target,
    'tGpRMPWgA3I6GyErH' // Public key
  ).then(
    (result) => {
      console.log('Success:', result.text);
    },
    (error) => {
      console.log('Failed:', error.text);
    }
  );

}

window.sendEmail = sendEmail;
export default sendEmail;
