const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.handler = async function(event, context) {
  const { destino, asunto, mensaje } = JSON.parse(event.body);

  try {
    let info = await transporter.sendMail({
      from: `"Proyectos finales escuela de Produccion Industrial" <${process.env.SMTP_USER}>`,
      to: destino,
      subject: asunto,
      text: mensaje
    });

    console.log(`Correo enviado a: ${destino}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully!" })
    };
  } catch (error) {
    console.error(`Error enviando a ${destino}:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};