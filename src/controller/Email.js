const sendMail = (destino, asunto, mensaje) => {
  console.log("sendMail: preparing to send email to", destino);

  fetch('/.netlify/functions/sendMail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ destino, asunto, mensaje }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("sendMail: email response received:", data);
  })
  .catch(error => {
    console.error("sendMail: error sending email:", error);
  });
};

export default sendMail;
