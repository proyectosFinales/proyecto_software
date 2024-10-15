import supabase from "../model/supabase"

export async function signUpNewUser(fullName, carnet, number, email, password) {

    const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert([
            {
                nombre: fullName,
                correo: email,
                contraseña: password
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
                telefono: number,
                correo: email,
                usuarioID: usuarioID,
            },
        ]);

    if (studentError) {
        throw new Error(studentError.message);
    }

    return userData;
}

