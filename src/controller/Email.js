
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

  return fetch('/.netlify/functions/sendMail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ destino, asunto, mensaje }),
  })
  .then(async (response) => {
    if (!response.ok) {
      let detalle = "Error desconocido";
      try {
        const errBody = await response.json();
        detalle = errBody?.error || detalle;
      } catch (e) {
        detalle = `HTTP ${response.status}`;
      }
      console.error("sendMail: fallo del servidor:", detalle);
      throw new Error("No pudimos enviar el correo de recuperación. Por favor, inténtalo de nuevo más tarde.");
    }
    return response.json();
  })
  .then(data => {
    console.log("sendMail: email response received:", data);
    return data;
  })
  .catch(error => {
    console.error("sendMail: error sending email:", error);
    throw error;
  });
};

export default sendMail;
