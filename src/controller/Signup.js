import supabase from "../model/supabase";
import validateInfo from "./validarEntradasGU";

export async function signUpNewUser(fullName, carnet, tel, email, password) {

    validateInfo(carnet, tel, email, password);

    const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert([
            {
                nombre: fullName,
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
                usuarioID: usuarioID,
            },
        ]);

    if (studentError) {
        throw new Error(studentError.message);
    }

    return userData;
}