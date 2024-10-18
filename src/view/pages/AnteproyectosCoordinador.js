import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate
import styles from '../styles/AnteproyectosCoordinador.module.css';
import * as XLSX from 'xlsx'; // Importa xlsx para generar el archivo Excel
import { supabase } from '../../model/Cliente';
import SidebarCoordinador from '../components/SidebarCoordinador';

const AnteproyectosCoordinador = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anteproyectos, setAnteproyectos] = useState([]);

  const navigate = useNavigate(); // Hook para redireccionar

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleRevisar = (id) => {
    navigate('/formulario-coordinador?id=' + id)
    // Lógica para editar
  };

  const handleReporte = (id) => {
    console.log(`Descargando anteproyecto con id ${id}`);
    // Lógica para descargar
  };

  // Función para obtener los datos de la base de datos
  useEffect(() => {
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
          estudiantes(id, nombre, carnet, telefono, correo)`);
      if (error) {
        console.error('Error al obtener anteproyectos:', error);
      } else {
        setAnteproyectos(data);
        
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
      'ID': proyecto.id,
      'Nombre del Estudiante': proyecto.estudiantes.nombre,
      'Carnet': proyecto.estudiantes.carnet,
      'Teléfono': proyecto.estudiantes.telefono,
      'Correo': proyecto.estudiantes.correo,
      'Sede': proyecto.sede,
      'Nombre de la Empresa': proyecto.nombreEmpresa,
      'Tipo de Empresa': proyecto.tipoEmpresa,
      'Actividad de la empresa': proyecto.actividadEmpresa,
      'Distrito': proyecto.distritoEmpresa,
      'Cantón': proyecto.cantonEmpresa,
      'Provincia': proyecto.provinciaEmpresa,
      'Nombre del asesor industrial': proyecto.nombreAsesor,
      'Puesto del Asesor': proyecto.puestoAsesor,
      'Teléfono de Contacto': proyecto.telefonoContacto,
      'Correo del Contacto': proyecto.correoContacto,
      'Nombre del contacto de recursos humanos': proyecto.nombreHR,
      'Teléfono del contacto de recursos humanos': proyecto.telefonoHR,
      'Correo del contacto de recursos humanos': proyecto.correoHR,
      'Contexto': proyecto.contexto,
      'Justificación del trabajo': proyecto.justificacion,
      'Síntomas principales (a lo sumo 3)': proyecto.sintomas,
      'Efectos o impactos para la empresa': proyecto.impacto,
      'Departamento': proyecto.nombreDepartamento,
      'Tipo de Proyecto': proyecto.tipoProyecto,
      'Estado del proyecto': proyecto.estado
    }));

    // Creamos un nuevo libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(dataToExport); // Convierte los datos a una hoja de trabajo
    const workbook = XLSX.utils.book_new(); // Crea un nuevo libro de trabajo
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Anteproyectos'); // Añade la hoja al libro

    // Exportamos el archivo Excel
    XLSX.writeFile(workbook, 'Reporte_Anteproyectos.xlsx'); // Descarga el archivo con el nombre especificado
  };

  return (
    <div className={styles.anteproyectos_coordinador_contenedor}>
      <header>
        <div className={styles.header}>
          <button className={styles.menuIcon} onClick={toggleMenu}>
            &#9776;
          </button>
          <h1>Anteproyectos</h1>
        </div>
      </header>
      
      <div className={styles.contenedor_menu_lateral}>
        {/* Menú lateral */}
        {isMenuOpen && (
          <SidebarCoordinador />
        )}
        
        <main>
          <div className={styles.lista_anteproyectos_coordinador}>
            <button className={styles.generar_reporte} onClick={handleGenerateReport}>Generar reporte de anteproyectos</button>
            <table className={styles.tabla_anteproyectos_coordinador}>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Propuesta de proyecto</th>
                  <th>Estado del proyecto</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {anteproyectos.map((anteproyecto) => (
                  <tr key={anteproyecto.id}>
                    <td>{anteproyecto.estudiantes ? anteproyecto.estudiantes.nombre : 'Sin estudiante asignado'}</td>
                    <td>{anteproyecto.nombreEmpresa}</td>
                    <td>{anteproyecto.estado}</td>
                    <td>
                        <div className={styles.contenedor_botones_anteproyectos_coordinador}>
                            <button onClick={() => handleRevisar(anteproyecto.id)} className={styles.btn + ' ' + styles.revisar}>Revisar</button>
                            <button onClick={() => handleReporte(anteproyecto.id)} className={styles.btn + ' ' + styles.descargar}>Descargar</button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      
      <footer>
        <p>Instituto Tecnológico de Costa Rica 2024</p>
      </footer>
    </div>
  );
};

export default AnteproyectosCoordinador;
