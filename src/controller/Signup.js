import supabase from "../model/supabase";
import validateInfo from "./validarEntradas";

export async function signUpNewUser(fullName, carnet, tel, email, password) {

    try {
        validateInfo(carnet, tel, email, password);
    } catch (error) {
        alert(error.message);
    }

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
}

export async function registroProfesor(nombre, correo, contraseña) {


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

    const { data1, error1 } = await supabase
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

}