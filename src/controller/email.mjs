import axios from "axios";

const sendMail = async (destino, asunto, mensaje) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      "Messages": [{
        "From": {
          "Email": "proyectosoftware07@gmail.com",
          "Name": "Zephyr"
        },
        "To": [{
          "Email": destino,
          "Name": "Zephyr User"
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
        password: 'f08f70def4137fad4976c0b6e32888e9'
      },
    };

    axios(config)
      .then(resolve)
      .catch(reject);
  });
};

export default sendMail;

//sendMail("j.a_alvarado99@hotmail.com", "Prueba", "Hola, este es un mensaje de prueba");
