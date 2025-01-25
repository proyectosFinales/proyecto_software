/**
 * AnteproyectosEstudiante.jsx
 * Muestra los anteproyectos creados por el estudiante logueado (sessionStorage).
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AnteproyectosEstudiante.module.css';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import HeaderEstudiante from '../components/HeaderEstudiante';
import { descargarAnteproyecto } from '../../controller/DescargarPDF';
import styles2 from '../styles/table.module.css';

const AnteproyectosEstudiante = () => {
  const [anteproyectos, setAnteproyectos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    consultarAnteproyectos();
  }, []);

  async function consultarInfoEstudiante() {
    try {
      const userToken = sessionStorage.getItem('token');
      const { data, error } = await supabase
        .from('Usuario')
        .select(`
          Estudiante:Estudiante!Estudiante_id_usuario_fkey (
            estudiante_id,
            carnet
          )
        `)
        .eq('id', userToken)
        .single();
      if (error) throw error;
      if (!data) {
        return;
      }
      return data.Estudiante[0].estudiante_id;
    } catch (error) {
      alert('Error al buscar estudiante' + error);
    }
  }

  async function crearAnteproyecto() {
    try {
      const studentID = await consultarInfoEstudiante();
      const { data, error } = await supabase
        .from('Anteproyecto')
        .select(`
          id
        `)
        .eq('estudiante_id', studentID);
      if (error) {
        alert('No se pudieron obtener los anteproyectos. ' + error.message);
        return;
      }
      if(data.length != 0){
        alert("Ya tiene un anteproyecto activo");
      }
      else{
        navigate('/formulario-estudiantes');
      }
    } catch (error) {
      alert('Error al consultar anteproyectos: ' + error);
    }
  }

  async function consultarAnteproyectos() {
    try {
      const studentID = await consultarInfoEstudiante();
      const { data, error } = await supabase
        .from('Anteproyecto')
        .select(`
          id,
          empresa_id,
          contexto,
          justificacion,
          sintomas,
          estado,
          impacto,
          tipo,
          comentario,
          estudiante_id,
          actividad,
          departamento,
          comentario,
          Estudiante:estudiante_id (
            carnet,
            id_usuario,
            Usuario:id_usuario (
              nombre,
              correo,
              telefono,
              sede
            )
          ),
          Empresa:empresa_id (
            nombre,
            tipo,
            provincia,
            canton,
            distrito
          ),
          AnteproyectoContacto:anteproyectocontacto_anteproyecto_id_fkey (
            ContactoEmpresa:contacto_id(
              nombre,
              correo,
              departamento,
              telefono
            ),
            RRHH:rrhh_id(
              nombre,
              correo,
              telefono
            )
          )
        `)
        .eq('estudiante_id', studentID);
      if (error) {
        alert('No se pudieron obtener los anteproyectos. ' + error.message);
        return;
      }
      setAnteproyectos(data || []);
    } catch (error) {
      alert('Error al consultar anteproyectos: ' + error);
    }
  }

  function editarAnteproyecto(id) {
    navigate(`/editarFormulario?id=${id}`);
  }

  // Función para eliminar anteproyectos (solo si Pendiente o Reprobado)
  async function eliminarAnteproyecto(id, estado) {
    const confirmarEnvio = window.confirm(
      "¿Está seguro que desea eliminar este anteproyecto?"
    );
    if (!confirmarEnvio) return;

    if (estado === 'Aprobado') {
      alert("No se puede eliminar un anteproyecto aprobado.");
      return;
    }

    try {
      const { error } = await supabase
        .from('Anteproyecto')
        .delete()
        .eq('id', id)
        .in('estado', ['Reprobado', 'Pendiente']); // filtra para no borrar uno aprobado
      if (error) {
        alert('Error al eliminar anteproyecto: ' + error.message);
        return;
      }

      setAnteproyectos((prev) => prev.filter((ap) => ap.id !== id));
      console.log(`Anteproyecto con ID ${id} eliminado exitosamente.`);
    } catch (error) {
      alert('Error al eliminar anteproyecto:' + error);
    }
  }

  return (
    <div className={styles.contenedor_anteproyectos_estudiante}>
      <HeaderEstudiante title="Anteproyectos" />
      <div>
        <main className={styles.lista_anteproyectos_estudiante}>
          <button
            className={styles.crear_anteproyecto}
            onClick={() => crearAnteproyecto()}
          >
            Crear anteproyecto
          </button>
          <div className={styles.contenedor_tabla}>
            <table className={styles2.table}>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {anteproyectos.map((anteproyecto) => (
                  <tr key={anteproyecto.id}>
                    <td>{anteproyecto.Empresa.nombre}</td>
                    <td>{anteproyecto.estado}</td>
                    <td>
                      <div className={styles.contenedor_botones_anteproyectos_estudiante}>
                        <button
                          onClick={() => editarAnteproyecto(anteproyecto.id)}
                          className={`${styles.btn} ${styles.editar}`}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => descargarAnteproyecto(anteproyecto)}
                          className={`${styles.btn} ${styles.descargar}`}
                        >
                          Descargar
                        </button>
                        <button
                          onClick={() =>
                            eliminarAnteproyecto(anteproyecto.id, anteproyecto.estado)
                          }
                          className={`${styles.btn} ${styles.eliminar}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AnteproyectosEstudiante;
