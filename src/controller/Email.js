
/**
 * Hace fecth de la funcion definida en la carpeta netlify/functions para enviar un correo.
 * La funcion habilitada en la pagina de Netlify habilita un endpoint para enviar correos.
 * 
 * NOTA: para hacer pruebas de forma local, se debe ejecutar: npx netlify dev
 * de lo contrario no servira el endpoint abreviado en el controlador
 * y no se enviaran los correos.
 * 
 * @param {*} destino direccion de correo al que se le enviara el correo.
 * @param {*} asunto asunto del correo.
 * @param {*} mensaje todo el texto que se le quiera enviar al destinatario.
 */
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
