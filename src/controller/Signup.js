import supabase from "../model/supabase";
import validateInfo, { validarContraseña, validarCorreo } from "./validarEntradas";

export async function signUpNewUser(fullName, carnet, tel, email, password) {

    try {
        validateInfo(carnet, tel, email, password)

        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .insert([
                {
                    correo: email,
                    contraseña: password,
                    rol: 3
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

export async function registroProfesor(nombre, correo, contraseña) {

    try {
        if (!validarCorreo(correo)) {
            throw new Error("El correo no cumple con un formato válido, asegúrese de ingresar su correo de la institución.");
        }
         else if (!validarContraseña(contraseña)) {
            throw new Error("La contraseña no es válida, debe contener al menos 8 caracteres y que mínimo contenga:\n- 1 minúscula\n- 1 mayúscula\n- 1 número\n- 1 caracter especial")
        }
        

        const { data, error } = await supabase
            .from('usuarios')
            .insert([
                {
                    correo: correo,
                    contraseña: contraseña,
                    rol: 2
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