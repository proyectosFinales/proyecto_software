/**
 * AnteproyectosCoordinador.jsx
 * Muestra una lista de anteproyectos con posibilidad de descargar y revisar (coord).
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AnteproyectosCoordinador.module.css';
import * as XLSX from 'xlsx';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { descargarAnteproyecto } from '../../controller/DescargarPDF';
import styles2 from '../styles/table.module.css';
import { errorToast } from '../components/toast';

const AnteproyectosCoordinador = () => {
  const [anteproyectos, setAnteproyectos] = useState([]);
  const navigate = useNavigate();

  const handleRevisar = (id) => {
    navigate('/formulario-coordinador?id=' + id);
  };

  // Función para obtener los datos de la base de datos
  useEffect(() => {
    const fetchAnteproyectos = async () => {
    const { data, error } = await supabase
      .from('Anteproyecto')
      .select(`
        id,
        empresa_id,
        estado,
        estudiante_id,
        Empresa:Empresa!anteproyecto_empresa_id_fkey (
          nombre         
        ),
        Estudiante:estudiante_id (
          nombre
          Usuario:id_usuario (
            nombre
          )
        )
      `);
      if (error) {
        alert('No se pudieron obtener los anteproyectos. ' + error.message);
        return;
      }
      if (error) {
        errorToast('No se pudieron obtener los anteproyectos');
      } else {
        setAnteproyectos(data || []);
      }
    };
    fetchAnteproyectos();
  }, []);

  // Función para generar el reporte en Excel
  const handleGenerateReport = () => {
    if (anteproyectos.length === 0) {
      alert("No hay anteproyectos para generar el reporte");
      return;
    }

    // Preparamos los datos para el archivo Excel
    const dataToExport = anteproyectos.map((proyecto) => ({
      ID: proyecto.id,
      'Nombre del Estudiante': proyecto.Estudiante?.nombre || 'N/A',
      Carnet: proyecto.Estudiante?.carnet || 'N/A',
      Teléfono: proyecto.Estudiante?.telefono || 'N/A',
      Correo: proyecto.Estudiante?.correo || 'N/A',
      Sede: proyecto.sede,
      'Nombre de la Empresa': proyecto.nombreEmpresa,
      'Tipo de Empresa': proyecto.tipoEmpresa,
      'Actividad de la empresa': proyecto.actividadEmpresa,
      Distrito: proyecto.distritoEmpresa,
      Cantón: proyecto.cantonEmpresa,
      Provincia: proyecto.provinciaEmpresa,
      'Nombre del asesor industrial': proyecto.nombreAsesor,
      'Puesto del Asesor': proyecto.puestoAsesor,
      'Teléfono de Contacto': proyecto.telefonoContacto,
      'Correo del Contacto': proyecto.correoContacto,
      'Nombre del contacto de RRHH': proyecto.nombreHR,
      'Teléfono RRHH': proyecto.telefonoHR,
      'Correo RRHH': proyecto.correoHR,
      Contexto: proyecto.contexto,
      'Justificación del trabajo': proyecto.justificacion,
      'Síntomas principales': proyecto.sintomas,
      'Efectos o impactos': proyecto.impacto,
      Departamento: proyecto.nombreDepartamento,
      'Tipo de Proyecto': proyecto.tipoProyecto,
      'Estado del proyecto': proyecto.estado
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Anteproyectos');
    XLSX.writeFile(workbook, 'Reporte_Anteproyectos.xlsx');
  };

  const cambiarEstado = async (anteproyecto) => {
    try {
      const { error } = await supabase
        .from('Anteproyecto')
        .update({ estado: 'Pendiente' })
        .eq('id', anteproyecto.id);
  
      if (error) {
        alert('No se pudo cambiar el estado del anteproyecto. ' + error.message);
      } else {
        // Actualizar el estado local de anteproyectos
        setAnteproyectos((prev) =>
          prev.map((item) =>
            item.id === anteproyecto.id
              ? { ...item, estado: 'Pendiente' }
              : item
          )
        );
        alert('Estado del anteproyecto cambiado exitosamente.');
      }
    } catch (err) {
      console.error('Error cambiando el estado:', err);
      alert('Ocurrió un error al intentar cambiar el estado.');
    }
  };
  

  return (
    <div className={styles.anteproyectos_coordinador_contenedor}>
      <Header title="Anteproyectos"/>
      <div>
        <main>
          <div className={styles.lista_anteproyectos_coordinador}>
            <button
              className={styles.generar_reporte}
              onClick={handleGenerateReport}
            >
              Generar reporte de anteproyectos
            </button>
            <div className={styles.contenedor_tabla}>
              <table className={styles2.table}>
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Nombre de la empresa</th>
                    <th>Estado del proyecto</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {anteproyectos.map((anteproyecto) => (
                    <tr key={anteproyecto.id}>
                      <td>
                        {anteproyecto.Estudiante
                          ? anteproyecto.Estudiante.nombreUsuario.nombre
                          : 'Sin estudiante asignado'}
                      </td>
                      <td>{anteproyecto.Empresa.nombre}</td>
                      <td>{anteproyecto.estado}</td>
                      <td>
                        <div className={styles.contenedor_botones_anteproyectos_coordinador}>
                          <button
                            onClick={() => handleRevisar(anteproyecto.id)}
                            className={`${styles.btn} ${styles.revisar}`}
                          >
                            Revisar
                          </button>
                          <button
                            onClick={() => descargarAnteproyecto(anteproyecto)}
                            className={`${styles.btn} ${styles.descargar}`}
                          >
                            Descargar
                          </button>
                          {anteproyecto.estado === 'Aprobado' && (
                            <button
                              onClick={() => cambiarEstado(anteproyecto)}
                              className={`${styles.btn} ${styles.pendiente}`}
                            >
                              Pendiente
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AnteproyectosCoordinador;
