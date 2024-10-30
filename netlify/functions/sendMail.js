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
    url: 'https://api.mailjet.com/v3.1/send',
    data: data,
    headers: { 'Content-Type': 'application/json' },
    auth: {
      username: '3a4ac386b4ed148b6357eeccac0ab83b',
      password: '33cbb34c0f2241405b48c81dbccb64d4'
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
