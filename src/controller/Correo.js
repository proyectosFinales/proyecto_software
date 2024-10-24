import emailjs from 'emailjs-com';

const Correo = (nombre, destinatario, contraseña, plantilla) => {

    const templateParams = {
        to_email:destinatario,
        user_name: nombre,
        user_email: destinatario,
        user_password: contraseña
    };

    emailjs.send('service_fynfzt7', plantilla, templateParams, 'RVzuF8Rk6oOqnKI5f' 
    )
        .then((result) => {
            console.log(result.text);
        }, (error) => {
            console.log(error.text);
        });
    };

export const CorreoRecuperacion = (link, destinatario, plantilla) => {

    const templateParams = {
        to_email:destinatario,
        enlace: link
    };

    emailjs.send('service_fynfzt7', plantilla, templateParams, 'RVzuF8Rk6oOqnKI5f')
        .then((result) => {
            return result;
        }, (error) => {
            throw new Error("No se logró enviar la solicitud al correo. Por favor inténtelo de nuevo.")
        });
};
 
export default Correo;