import { useEffect, useState } from "react";
import listStyles from "../../styles/list.module.css";
import Header from "../../components/HeaderProfesor";
import Footer from "../../components/Footer";
import Styles from "../../styles/proyectos-profesor.module.css";
import { descargarAnteproyecto } from "../../../controller/DescargarPDF";
import { supabase } from "../../../model/Cliente";

const ProyectosAsignadosProfesor = () => {
    const [anteproyectos, setAnteproyectos] = useState([]);

    useEffect(() => {
        consultarAnteproyectos();
    }, []);

    async function consultarAnteproyectos() {
        try {
            const { data, error } = await supabase.from('anteproyectos')
                .select(`
                    id,
                    sede,
                    tipoEmpresa,
                    nombreEmpresa,
                    actividadEmpresa,
                    distritoEmpresa,
                    cantonEmpresa,
                    provinciaEmpresa,
                    nombreAsesor,
                    puestoAsesor,
                    telefonoContacto,
                    correoContacto,
                    nombreHR,
                    telefonoHR,
                    correoHR,
                    tipoEmpresa,
                    contexto,
                    justificacion,
                    sintomas,
                    impacto,
                    nombreDepartamento,
                    tipoProyecto,
                    observaciones,
                    estado,
                    idEstudiante,
                    estudiantes(id, nombre, carnet, telefono, correo)
                `)
                .eq('idEncargado', localStorage.getItem('token'))
                .eq('semestreActual', 1);
            if (error) {
                alert('No se pudieron obtener los anteproyectos');
                return;
            }
            setAnteproyectos(data);
        } catch (error) {
            alert('Error al consultar anteproyectos:', error);
        }
    }

    return (
        <>
            <Header title="Proyecto asignados a profesor" />
            <div className={Styles.lista_proyectos}>
                <ul className={listStyles.list}>
                    <li className={listStyles.title}>Anteproyectos asignados</li>
                    {anteproyectos.map((anteproyecto, index) => {
                        return (
                            <li key={`anteproyecto-${index}`}>
                                <p><label>Empresa:</label> {anteproyecto.nombreEmpresa}</p>
                                <p><label>Estudiante:</label> {anteproyecto.estudiantes.nombre}</p>
                                <p><label>Correo:</label> {anteproyecto.estudiantes.correo}</p>
                                <p><label>Carnet:</label> {anteproyecto.estudiantes.carnet}</p>
                                <p><label>Teléfono:</label> {anteproyecto.estudiantes.telefono}</p>
                                <button
                                    className={Styles.descargar}
                                    onClick={() => descargarAnteproyecto(anteproyecto)}
                                >
                                    Descargar
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <Footer />
        </>
    );
};

export default ProyectosAsignadosProfesor;
