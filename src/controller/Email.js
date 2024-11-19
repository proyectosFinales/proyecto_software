const sendMail = (destino, asunto, mensaje) => {
  fetch('/.netlify/functions/sendMail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ destino: destino, asunto: asunto, mensaje: mensaje }),
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
};

export default sendMail;
