import { v4 as uuidv4 } from 'uuid';
import supabase from "../model/supabase";
import {CorreoRecuperacion} from "../controller/Email";

export async function sendRecovery(email) {
  // Buscamos en tabla "Usuario"
  const { data, error } = await supabase
    .from('Usuario')
    .select("id")
    .eq("correo", email)
    .single();

  if (error || !data) {
    throw new Error("No se encontró un usuario con el correo ingresado.");
  }

  const token = uuidv4();
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 5);

  const { error: updateError } = await supabase
    .from('Usuario')
    .update({
      recovery_token: token,
      exp_recuperacion: expiration.toISOString()
    })
    .eq('id', data.id);

  if (updateError) {
    throw new Error("Hubo un error al intentar establecer la recuperación.");
  }

  const resetLink = `${window.location.origin}/cambiar-contraseña/${token}`;
  const mensaje = `Buenas,
Se ha realizado una solicitud para restablecer tu contraseña. 
Por favor ingresa al siguiente enlace:
${resetLink}
Si no realizaste ninguna solicitud, ignora este mensaje.

Instituto Tecnológico de Costa Rica,
Escuela de Producción Industrial.`;

  console.log("puta sal");
  CorreoRecuperacion(resetLink, email, "template_recovery");
  return resetLink;
}

export async function validarToken(token) {
  const { data, error } = await supabase
    .from("Usuario")
    .select("id")
    .eq("recovery_token", token)
    .single();

  if (error || !data) {
    throw new Error("No se encontró un usuario con ese token de recuperación.");
  }

  return data;
}

export async function cambiarContraseña(id, nuevaContraseña) {
  const { error } = await supabase
    .from("Usuario")
    .update({
      contrasena: nuevaContraseña,
      recovery_token: null,
      exp_recuperacion: null
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
  return;
}

export default sendRecovery;
