import supabase from "../model/supabase";
import validateInfo, { validarContraseña, validarCorreo, validarCorreoExistente } from "./validarEntradas";

export async function signUpNewUser(fullName, carnet, tel, email, password, sede) {

    try {

        const result = await validarCorreoExistente(email, "");
        if (!result) {
            throw new Error("El correo ingresado ya se encuentra registrado, asegúrese de ingresar su correo de la institución.");
        }

        validateInfo(carnet, tel, email, password)

        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .insert([
                {
                    correo: email,
                    contraseña: password,
                    rol: 3,
                    sede: sede
                },
            ])
            .select();

        if (userError) {
            throw new Error(userError.message);
        }

        const usuarioID = userData[0].id;

        const { error: studentError } = await supabase
            .from('estudiantes')
            .insert([
                {
                    nombre: fullName,
                    carnet: carnet,
                    telefono: tel,
                    correo: email,
                    id: usuarioID,
                },
            ]);

        if (studentError) {
            throw new Error(studentError.message);
        }

        return userData;

    } catch (error) {
        throw new Error(error.message);
    }
}

export async function registroProfesor(nombre, correo, contraseña, sede) {

    try {
        if (!validarCorreo(correo)) {
            throw new Error("El correo no cumple con un formato válido, asegúrese de ingresar su correo de la institución.");
        } else if (!validarContraseña(contraseña)) {
            throw new Error("La contraseña no es válida, debe contener al menos 8 caracteres y que mínimo contenga:\n- 1 minúscula\n- 1 mayúscula\n- 1 número\n- 1 caracter especial")
        } 

        const result = await validarCorreoExistente(correo, "");
        if (!result) {
            throw new Error("El correo ingresado ya se encuentra registrado, asegúrese de ingresar su correo de la institución.");
        }
        

        const { data, error } = await supabase
            .from('usuarios')
            .insert([
                {
                    correo: correo,
                    contraseña: contraseña,
                    rol: 2,
                    sede: sede
                },
            ])
            .select();

        if (error) {
            throw new Error(error.message);
        }

        const usuarioID = data[0].id;

        const { error: error1 } = await supabase
            .from('profesores')
            .insert([
                {
                    id: usuarioID,
                    nombre: nombre
                },
            ]);

        if (error1) {
            throw new Error(error1.message);
        }

    } catch (error) {
        throw new Error(error.message);
    }

}