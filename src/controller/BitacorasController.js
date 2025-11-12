
import supabase from '../model/supabase';
import * as XLSX from 'xlsx';

/**
 * Funcion que le pide a la BD las entradas relacionadas a una bitacora.
 * @param {*} idBitacora El id de la bitacora que queremos obtener las entradas.
 * @returns La información consultada y errores si los hubiera.
 */
export async function fetchEntradasBitacora(idBitacora) {
    try {
        const { data, error } = await supabase
        .from('Entrada')
        .select(`
            id,
            bitacora_id,
            fecha, 
            contenido, 
            aprobada_prof,
            aprobada_est
        `)
        .eq('bitacora_id', idBitacora);
        return {data, error}
    } catch (error) {
        alert("Error al pedir las entradas a la BD: ", error)
        console.log("Error al pedir las entradas a la BD: ", error );
    }
};

/**
 * Funcion que pide a la BD las bitacoras relacionadas con el usuario logueado.
 * @param {*} userID id del usuario logueado.
 * @returns las bitacoras creadas del usuario.
 */
export async function fetchBitacoras(userID) {
    const { data, error } = await supabase
    .from('Bitacora')
    .select(`
        id, 
        fecha_creacion, 
        estudiante_id, 
        profesor_id,
        Estudiante:estudiante_id (
        nombre
        Usuario:id_usuario (
            nombre
        )
        ),
        Profesor:profesor_id (
        nombre
        Usuario:id_usuario (
            nombre
        )
        )
    `)
    .eq('profesor_id', userID);
    
    return { data, error}
};

/**
 * Funcion que hace un reporte en formato excel de las bitacoras.
 * @param {*} bitacorasYentradas 
 * @returns 
 */
export function crearReporteBitacoras(bitacorasYentradas) {
    try {
        if (bitacorasYentradas.length === 0) {
          alert('No hay bitácoras para generar el reporte');
          return;
        }
        
        const dataToExport = bitacorasYentradas.map((p) => ({
            'Fecha Creación Bitácora': p.fecha_creacion,
            'Estudiante': p.Estudiante.nombreUsuario.nombre,
            'Profesor': p.Profesor.nombreUsuario.nombre,
            ' ': ' ',
            'Fecha Creación Entrada': p.entradas[0]?.fecha || 'Bitácora sin entradas',
            'Estatus Profesor': p.entradas[0]?.aprobada_prof.toString() || 'Bitácora sin entradas',
            'Estatus Estudiante': p.entradas[0]?.aprobada_est.toString() || 'Bitácora sin entradas',
            'Estatus': p.entradas[0]
                ?
                p.entradas[0].aprobada_est === true && p.entradas[0].aprobada_est === true ? 'Aprobada' : 'Pendiente'
                : 'Bitácora sin entradas',
            'Fecha Ultima Actualización': p.entradas[0]?.fecha || 'Bitácora sin entradas',
            'Puntos Analizados': p.entradas[0]?.contenido ? JSON.parse(p.entradas[0].contenido || "Mal parseado")[0] : 'Bitácora sin entradas',
            'Asuntos Pendientes': p.entradas[0]?.contenido ? JSON.parse(p.entradas[0].contenido || "Mal parseado")[1] : 'Bitácora sin entradas',
            'Observaciones': p.entradas[0]?.contenido ? JSON.parse(p.entradas[0].contenido || "Mal parseado")[2] : 'Bitácora sin entradas'
        })); 
        
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bitácoras');
        const nombreArchivo = `Reporte Bitácoras (${bitacorasYentradas[0].Profesor.nombreUsuario.nombre} - ${bitacorasYentradas[0].Estudiante.nombreUsuario.nombre}).xlsx`;
        XLSX.writeFile(workbook, nombreArchivo);
        
    } catch (error) {
        alert("Error al trata de crear el reporte: ", error);
    }
};

