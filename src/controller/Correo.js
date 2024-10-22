import emailjs from 'emailjs-com';

const Correo = (nombre, destinatario, contraseña) => {

    const templateParams = {
        to_email:destinatario,
        user_name: nombre,
        user_email: destinatario,
        user_password: contraseña
    };

    emailjs.send('service_fynfzt7', 'template_password',templateParams, 'RVzuF8Rk6oOqnKI5f' 
    )
        .then((result) => {
            console.log(result.text);
        }, (error) => {
            console.log(error.text);
        });
    };

 

export default Correo;
