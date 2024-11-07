import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate
import styles from '../styles/AprobarProyecto.module.css';
import { supabase } from '../../model/Cliente';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { AiOutlineArrowDown, AiOutlineArrowUp, AiOutlineInfoCircle } from 'react-icons/ai';
import styles2 from '../styles/table.module.css';
import {errorToast, successToast} from '../components/toast';


const AprobarProyectos = () => {
  const [anteproyectos, setAnteproyectos] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();
  const [infoVisible, setInfoVisible] = useState({});

  // Función para obtener los datos de la base de datos
  useEffect(() => {
    fetchAnteproyectos();
  }, []);

  const toggleInfo = (field) => {
    setInfoVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const fetchAnteproyectos = async () => {
    const { data, error } = await supabase
    .from('anteproyectos')
    .select(`id,
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
        estudiantes(id, nombre, carnet, telefono, correo)`).or('estado.eq.Aprobado,estado.eq.Perdido,estado.eq.Finalizado')
        .eq('semestreActual', 1);
    if (error) {
      alert('No se pudieron obtener los anteproyectos');
    } else {
      setAnteproyectos(data);
      
    }
  };

  async function aprobar(id) {
    const confirmAprobar=window.confirm("¿Está seguro de APROBAR el proyecto?");

    if(!confirmAprobar){return;}

    try {
      const { data, error } = await supabase
        .from('anteproyectos')
        .update({estado:"Finalizado"})
        .eq('id', id);
      if (error) {
        console.error('Error al actualizar proyecto:', error);
        return;
      
      }

      successToast('Proyecto actualizado exitosamente');

      fetchAnteproyectos();

    } catch (error) {
      alert('Error al actualizar proyecto:', error);
    }
  }

  async function reprobar(id) {
    const confirmAprobar=window.confirm("¿Está seguro de REPROBAR el proyecto?");

    if(!confirmAprobar){return;}

    try {
      const { data, error } = await supabase
        .from('anteproyectos')
        .update({estado:"Perdido"})
        .eq('id', id);
      if (error) {
        console.error('Error al actualizar proyecto:', error);
        return;
      }

      successToast('Proyecto actualizado exitosamente');

      fetchAnteproyectos();
    } catch (error) {
      alert('Error al actualizar proyecto:', error);
    }
  }

  const toggleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id); // Si la fila está expandida, la colapsa; si no, la expande
  };

  return (
    <div className={styles.anteproyectos_coordinador_contenedor}>
        <Header title="Aprobar proyectos"/> 
      <div>
        <main>
          <div className={styles.lista_anteproyectos_coordinador}>
            <table className={styles2.table}>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Propuesta de proyecto</th>
                  <th>Estado del proyecto
                      <AiOutlineInfoCircle 
                        className={styles.infoIcon}
                        onClick={() => toggleInfo('estados')} 
                        title="contexto_info"
                        />
                        {infoVisible.estados && <p className={styles.infoText}>(Finalizado: Curso aprobado, Perdido: Curso perdido).</p>}
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {anteproyectos.map((anteproyecto) => (
                <>
                  <tr key={anteproyecto.id}>
                    <td>{anteproyecto.estudiantes ? anteproyecto.estudiantes.nombre : 'Sin estudiante asignado'}</td>
                    <td>{anteproyecto.nombreEmpresa}</td>
                    <td>{anteproyecto.estado==='Aprobado' ? 'Pendiente' : anteproyecto.estado}</td>
                    <td>
                        <div className={styles.contenedor_botones_anteproyectos_coordinador}>
                            <button onClick={() => aprobar(anteproyecto.id)} className={styles.btn + ' ' + styles.revisar}>Aprobar</button>
                            <button onClick={() => reprobar(anteproyecto.id)} className={styles.btn + ' ' + styles.descargar}>Reprobar</button>
                            <button onClick={() => toggleExpandRow(anteproyecto.id)} className={styles.btn + ' ' + styles.descargar}>
                                {expandedRow === anteproyecto.id ? <AiOutlineArrowUp className={styles.icono_arrow_down} /> : <AiOutlineArrowDown className={styles.icono_arrow_down} />}
                            </button>
                        </div>
                    </td>
                  </tr>
                  {expandedRow === anteproyecto.id && (
                    <tr className={styles.expandedRow}>
                      <td colSpan="4">
                        <div className={styles.info_adicional}>
                          <p><strong>Asesor:</strong> {anteproyecto.nombreAsesor} ({anteproyecto.puestoAsesor})</p>
                          <p><strong>Teléfono:</strong> {anteproyecto.telefonoContacto}</p>
                          <p><strong>Correo:</strong> {anteproyecto.correoContacto}</p>
                          <p><strong>Contexto:</strong> {anteproyecto.contexto}</p>
                          <p><strong>Justificación:</strong> {anteproyecto.justificacion}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  </>
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

export default AprobarProyectos;
