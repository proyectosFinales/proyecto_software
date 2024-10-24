import { v4 as uuidv4 } from 'uuid';
import supabase from "../model/supabase";
import { CorreoRecuperacion } from "../controller/Correo";

export async function sendRecovery(email) {

    const { data } = await supabase
        .from('usuarios')
        .select("id")
        .eq('correo', email)
        .single();

    if (!data) {
        throw new Error("No se encontró un usuario con el correo ingresado. Por favor inténtelo de nuevo.");
    }

    const token = uuidv4();
    const expiration = new Date();

    expiration.setMinutes(expiration.getMinutes() + 5);

    const { error1 } = await supabase
        .from('usuarios')
        .update({
            recoveryToken: token,
            expRecuperacion: expiration
        })
        .eq('id', data.id);
    
    if (error1) {
        throw new Error("Hubo un error al intentar recuperar tu cuenta. Por favor inténtalo de nuevo.")
    }

    const resetLink = `${window.location.origin}/cambiar-contraseña/${token}`;

    CorreoRecuperacion(resetLink, email, "template_recovery");

    return resetLink;
};

export async function validarToken(token) {

    const { data, error } = await supabase
        .from("usuarios")
        .select("id")
        .eq("recoveryToken", token)
        .single()


    if (error) {
        throw new Error("No se encontró ningun usuario con la solicitud de recuperación de contraseña.")
    }

    return data;

}

export async function cambiarContraseña(id, nuevaContraseña) {

    const { error } = await supabase
        .from("usuarios")
        .update({
            contraseña: nuevaContraseña
        })
        .eq("id", id)


    if (error) {
        throw new Error(error.message)
    }

    return;

}

export default sendRecovery;