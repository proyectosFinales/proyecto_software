const axios = require('axios');

exports.handler = async function(event, context) {
  const { destino, asunto, mensaje } = JSON.parse(event.body);

  const data = JSON.stringify({
    "Messages": [{
      "From": {
        "Email": "proyectosoftware07@gmail.com",
        "Name": "Proyectos finales escuela de Produccion Industrial"
      },
      "To": [{
        "Email": destino,
        "Name": "Querido usuario"
      }],
      "Subject": asunto,
      "TextPart": mensaje
    }]
  });

  const config = {
    method: 'post',
    url: process.env.MAIL_JET_URL,
    data: data,
    headers: { 'Content-Type': 'application/json' },
    auth: {
      username: process.env.MAIL_JET_USERNAME,
      password: process.env.MAIL_JET_PASSWORD
    },
  };

  try {
    await axios(config);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully!" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
