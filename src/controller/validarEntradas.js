import supabase from "../model/supabase";

export function validateInfo(carnet, tel, email, password, checkPass = true) {

    const telRegex = /^[2-9][0-9]{7}$/;
    const carnetRegex = /^[0-9]{10}$/;

    if (!carnetRegex.test(carnet)) {
        throw new Error("El carnet no cumple con un formato válido, asegúrese su ingresar el carnet de la institución.");
    } else if (!telRegex.test(tel)) {
        throw new Error("El número de teléfono no cumple con un formato válido, asegúrese de ingresar su número correctamente.");
    } else if (!validarCorreo(email)) {
        throw new Error("El correo no cumple con un formato válido, asegúrese de ingresar su correo de la institución.");
    } else if (!validarContraseña(password) && checkPass) {
        throw new Error("La contraseña no es válida, debe contener al menos 8 caracteres y que mínimo contenga:\n- 1 minúscula\n- 1 mayúscula\n- 1 número\n- 1 caracter especial");
    } else {
        return true;
    }

}

export function validarContraseña(contraseña) {

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
    return passwordRegex.test(contraseña);
}

export function validarCorreo(correo) {

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(estudiantec\.cr|itcr\.ac\.cr)$/;
    return emailRegex.test(correo);
}

export function validarCorreoEstudiante(correo) {

    const emailRegex = /^[a-zA-Z0-9._%+-]+@estudiantec\.cr$/;
    if (!emailRegex.test(correo)) {
        throw new Error("El correo no cumple con un formato válido, asegúrese de ingresar su correo de la institución.");
    };
}

export async function validarCorreoExistente(correo, id) {

    const { data } = await supabase
        .from('usuarios')
        .select('id, correo')
        .eq('correo', correo)
        .single();


    if (!data) {
        return true;
    } else if (data.id !== id) {
        if (id === "" && data.correo !== correo) {
            return true;
        }
        return false;
    }

    return true;
}

export default validateInfo;