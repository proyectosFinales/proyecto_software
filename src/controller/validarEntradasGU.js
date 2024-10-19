
export async function validateInfo(carnet, tel, email, password) {

    const emailRegex = /^[a-zA-Z0-9._%+-]+@estudiantec\.cr$/;
    const telRegex = /^[2-9][0-9]{7}$/;
    const carnetRegex = /^[0-9]{10}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!carnetRegex.test(carnet)) {
        throw new Error("El carnet no cumple con un formato válido, asegúrese de que el carnet cumpla con el formato de la institución.");
    } else if (!telRegex.test(tel)) {
        throw new Error("El número de teléfono no cumple con un formato válido, asegúrese de que sea un número de teléfono válido.");
    } else if (!emailRegex.test(email)) {
        throw new Error("El correo no cumple con un formato válido, asegúrese de ingresar su correo de la institución.");
    } else if (!passwordRegex.test(password)) {
        throw new Error("La contraseña no es válida, debe contener al menos 8 caracteres \
y que mínimo contenga:\n- 1 minúscula\n- 1 mayúscula\n- 1 número\n- 1 caracter especial");
    } else {
        return true;
    }

}

export default validateInfo;