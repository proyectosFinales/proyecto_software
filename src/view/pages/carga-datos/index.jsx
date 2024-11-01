import { Link } from "react-router-dom";
import { AiOutlineCloudUpload } from "react-icons/ai";
import Header from "../../components/HeaderCoordinador";
import Footer from "../../components/Footer";
import Modal from '../../components/Modal';
import React, { useState } from 'react';
import { supabase } from '../../../model/Cliente';

const InicioCargaDatos = () => {
    const [modal, setModal] = useState(false);

    const ReiniciarBaseDatos = async () => {
        if (window.confirm('¿Está seguro(a) de que desea eliminar los registros?')) {
            try {
                // const { data: usuariosDeleted, error: usuariosError } = await supabase
                //     .from('usuarios')
                //     .delete()
                //     .in('id', supabase.from('anteproyectos').select('idEstudiante').eq('estado', 'Aprobado'));

                // if (usuariosError) throw usuariosError;

                // const { data: disponibilidadDeleted, error: disponibilidadError } = await supabase
                //     .from('disponibilidadCitas')
                //     .delete()
                //     .neq('id', null);

                // if (disponibilidadError) throw disponibilidadError;

                const { data: anteproyectosUpdated, error: anteproyectosError } = await supabase
                    .from('anteproyectos')
                    .update({ semestreActual: 0 })
                    .eq('semestreActual', 1);
                if (anteproyectosError) throw anteproyectosError;

                const { data: citasUpdated, error: citasError } = await supabase
                    .from('citas')
                    .update({ semestreActual: 0 })
                    .eq('semestreActual', 1);
                if (citasError) throw citasError;

                alert('Los registros han sido eliminados correctamente.');
            } catch (error) {
                console.error('Error al eliminar registros:', error);
                alert('Hubo un error al eliminar los registros.');
            }
        }
    };


    return (
        <>
            <Header title="Menú de carga de datos" />
            <div className="menu-grid" style={{ textAlign: "center" }}>
                <Link
                    className="menu-item"
                    to="/carga-datos/cantidad-proyectos-profesor"
                    style={{ textDecoration: "none", color: "var(--primary1)" }}
                >
                    <i className="fa-solid fa-chalkboard-user" style={{ color: "var(--primary1)" }}></i>
                    <p>Cantidad de proyectos por profesor</p>
                </Link>
                <Link
                    className="menu-item"
                    to="/cargarProfesores"
                    style={{ textDecoration: "none", color: "var(--primary1)" }}
                >
                    <AiOutlineCloudUpload
                        style={{ color: "var(--primary1)", fontSize: "80px" }}
                    />
                    <p>Carga de datos</p>
                </Link>
                <div className="menu-item" onClick={() => setModal(true)}>
                    <i className="fas fa-clock"></i>
                    <p>Reiniciar base de datos</p>
                </div>
            </div>
            <Modal show={modal} onClose={() => setModal(false)}>
                <>
                    <h2>LEA CUIDADOSAMENTE!</h2>
                    <p>¿Está seguro(a) que quiere borrar toda la información de este semestre? Si preciona el botón de eliminar se perderá permantemente la información del semestre actual. Esta funcionalidad se debe utilizar únicamente cuando ya haya finalizado el semestre lectivo. Asegúrese de que ya no quiera realizar ninguna otra acción en el sistema este semestre antes de borrar la base de datos. (Algunos registros se mantendrán en la base de datos para realizar asignaciones en el futuro, pero no se mostrarán en el sistema.)  </p>
                    <div className="modal-actions">
                        <button className="cita-btn cita-btn-error w-50" onClick={() => ReiniciarBaseDatos()}>Eliminar</button>
                        <button className="cita-btn w-50" onClick={() => setModal(false)}>Cancelar</button>
                    </div>
                </>
            </Modal>
            <Footer />
        </>
    );
};

export default InicioCargaDatos;
