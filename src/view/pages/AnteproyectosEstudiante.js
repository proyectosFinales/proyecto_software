import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AnteproyectosEstudiante.module.css'; // Cambiado a módulo CSS
import { supabase } from '../../model/Cliente';
import Footer from '../components/Footer';
import HeaderEstudiante from '../components/HeaderEstudiante';
import {descargarAnteproyecto} from '../../controller/DescargarPDF';
import styles2 from '../styles/table.module.css';

const AnteproyectosEstudiante = () => {
  const [anteproyectos, setAnteproyectos] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    consultarAnteproyectos();
  }, []);

  async function consultarAnteproyectos() {
    try {
      const { data, error } = await supabase.from('anteproyectos').
      select(`id,
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
          estudiantes(id, nombre, carnet, telefono, correo)`)
          .eq('idEstudiante',sessionStorage.getItem('token'))
          .eq('semestreActual', 1)
          .or('estado.eq.Aprobado,estado.eq.Reprobado,estado.eq.Pendiente');;
      if (error) {
        alert('No se pudieron obtener los anteproyectos');
        return;
      }
      setAnteproyectos(data);
    } catch (error) {
      alert('Error al consultar anteproyectos:', error);
    }
  }

  async function editarAnteproyecto(id) {
    console.log(id);
    navigate(`/editarFormulario?id=${id}`);
  }

  // Función para eliminar anteproyectos
  async function eliminarAnteproyecto(id, estado) {
    const confirmarEnvio=window.confirm("¿Está seguro que desea eliminar este anteproyecto?");

    if(!confirmarEnvio){return;}

    if(estado == 'Aprobado'){
      alert("No se puede eliminar un anteproyecto aprobado.");
      return;
    }

    try {
      // Eliminar anteproyecto de la base de datos en Supabase
      const { error } = await supabase
        .from('anteproyectos')
        .delete()
        .eq('id', id)
        .in('estado', ['Reprobado', 'Pendiente']);

      if (error) {
        alert('Error al eliminar anteproyecto:', error);
        return;
      }

      // Actualizar el estado local eliminando el anteproyecto del array
      setAnteproyectos(anteproyectos.filter((anteproyecto) => anteproyecto.id !== id));
      console.log(`Anteproyecto con ID ${id} eliminado exitosamente.`);
    } catch (error) {
      alert('Error al eliminar anteproyecto:', error);
    }
  }

  return (
    <div className={styles.contenedor_anteproyectos_estudiante}>
        <HeaderEstudiante title="Anteproyectos"/>
      <div>
        <main className={styles.lista_anteproyectos_estudiante}>
          <button className={styles.crear_anteproyecto} onClick={() => navigate('/formulario-estudiantes')}>
            Crear anteproyecto
          </button>
          <table className={styles2.table}>
            <thead>
              <tr>
                <th>Anteproyectos creados</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {anteproyectos.map((anteproyecto) => (
                <tr key={anteproyecto.id}>
                  <td>{anteproyecto.nombreEmpresa}</td>
                  <td>{anteproyecto.estado}</td>
                  <td>
                    <div className={styles.contenedor_botones_anteproyectos_estudiante}>
                      <button onClick={() => editarAnteproyecto(anteproyecto.id)} className={styles.btn + ' ' + styles.editar}>
                        Editar
                      </button>
                      <button onClick={() => descargarAnteproyecto(anteproyecto)} className={styles.btn + ' ' + styles.descargar}>
                        Descargar
                      </button>
                      <button onClick={() => eliminarAnteproyecto(anteproyecto.id, anteproyecto.estado)} className={styles.btn + ' ' + styles.eliminar}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AnteproyectosEstudiante;
