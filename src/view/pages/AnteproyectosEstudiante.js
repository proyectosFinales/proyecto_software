import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AnteproyectosEstudiante.module.css'; // Cambiado a módulo CSS
import { supabase } from '../../model/Cliente';
import jsPDF from 'jspdf';
import SidebarCoordinador from '../components/SidebarCoordinador';
import Footer from '../components/Footer';
import Header from '../components/HeaderEstudiante';
import HeaderEstudiante from '../components/HeaderEstudiante';

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
          .eq('idEstudiante',localStorage.getItem('token'))
      if (error) {
        console.error('Error al consultar anteproyectos:', error);
        return;
      }
      setAnteproyectos(data);
    } catch (error) {
      console.error('Error al consultar anteproyectos:', error);
    }
  }

  async function editarAnteproyecto(id) {
    console.log(id);
    navigate(`/editarFormulario?id=${id}`);
  }

  // Función para eliminar anteproyectos
  async function eliminarAnteproyecto(id) {
    const confirmarEnvio=window.confirm("¿Está seguro que desea eliminar este anteproyecto?");

    if(!confirmarEnvio){return;}

    try {
      // Eliminar anteproyecto de la base de datos en Supabase
      const { error } = await supabase
        .from('anteproyectos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error al eliminar anteproyecto:', error);
        return;
      }

      // Actualizar el estado local eliminando el anteproyecto del array
      setAnteproyectos(anteproyectos.filter((anteproyecto) => anteproyecto.id !== id));
      console.log(`Anteproyecto con ID ${id} eliminado exitosamente.`);
    } catch (error) {
      console.error('Error al eliminar anteproyecto:', error);
    }
  }

  function descargarAnteproyecto(anteproyecto) {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Información del Anteproyecto', 20, 20);

    let yPosition = 40;
    const lineSpacing = 10;

    const pageWidth = doc.internal.pageSize.getWidth(); 
    const textWidth = pageWidth - 40; // Ancho disponible (20 de margen a cada lado)
    const pageHeight = doc.internal.pageSize.getHeight(); 

    // Función para añadir texto de manera dinámica, manejando el espacio vertical
    function addText(text) {
      const textDividido = doc.splitTextToSize(text, textWidth); // Dividir el texto para ajustarse al ancho
      const requiredHeight = textDividido.length * lineSpacing; // Calcular altura necesaria para este texto

      // Verificar si hay espacio suficiente en la página actual
      if (yPosition + requiredHeight > pageHeight - 20) { // Deja un margen de 20 px al final de la página
        doc.addPage(); // Agregar nueva página
        yPosition = 20; // Reiniciar la posición Y en la nueva página
      }

      // Imprimir el texto en la posición actual
      console.log(yPosition);
      doc.text(textDividido, 20, yPosition);
      yPosition += requiredHeight; 
    }

    // Información del anteproyecto
    doc.setFontSize(12);
    addText(`Nombre del estudiante: ${anteproyecto.estudiantes.nombre}`);
    addText(`Carnet: ${anteproyecto.estudiantes.carnet}`);
    addText(`Teléfono: ${anteproyecto.estudiantes.telefono}`);
    addText(`Correo: ${anteproyecto.estudiantes.correo}`);
    addText(`Sede: ${anteproyecto.sede}`);
    addText(`Nombre de la Empresa: ${anteproyecto.nombreEmpresa}`);
    addText(`Tipo de Empresa: ${anteproyecto.tipoEmpresa}`);
    addText(`Actividad de la empresa: ${anteproyecto.actividadEmpresa}`);
    addText(`Ubicación de la empresa (distrito): ${anteproyecto.distritoEmpresa}`);
    addText(`Ubicación de la empresa (cantón): ${anteproyecto.cantonEmpresa}`);
    addText(`Ubicación de la empresa (provincia): ${anteproyecto.provinciaEmpresa}`);
    addText(`Nombre del asesor industrial: ${anteproyecto.nombreAsesor}`);
    addText(`Puesto que desempeña el asesor industrial en la empresa: ${anteproyecto.puestoAsesor}`);
    addText(`Teléfono del contacto: ${anteproyecto.telefonoContacto}`);
    addText(`Correo del contacto: ${anteproyecto.correoContacto}`);
    addText(`Nombre del contacto de recursos humanos: ${anteproyecto.nombreHR}`);
    addText(`Teléfono del contacto de recursos humanos: ${anteproyecto.telefonoHR}`);
    addText(`Correo del contacto de recursos humanos: ${anteproyecto.correoHR}`);
    addText(`Contexto: ${anteproyecto.contexto}`, 20, 220);
    addText(`Justificación del trabajo: ${anteproyecto.justificacion}`);
    addText(`Síntomas principales (a lo sumo 3): ${anteproyecto.sintomas}`);
    addText(`Efectos o impactos para la empresa: ${anteproyecto.impacto}`);
    addText(`Nombre del departamento a realizar el proyecto: ${anteproyecto.nombreDepartamento}`);
    addText(`Tipo de proyecto: ${anteproyecto.tipoProyecto}`);
    addText(`Estado del proyecto: ${anteproyecto.estado}`); 

    // Descarga del PDF
    doc.save(`Anteproyecto_${anteproyecto.nombreEmpresa}.pdf`);
  }

  return (
    <div className={styles.contenedor_anteproyectos_estudiante}>
        <HeaderEstudiante title="Anteproyectos"/>
      <div>
        <main className={styles.lista_anteproyectos_estudiante}>
          <button className={styles.crear_anteproyecto} onClick={() => navigate('/formulario-estudiantes')}>
            Crear anteproyecto
          </button>
          <table className={styles.tabla_anteproyectos_estudiante}>
            <thead>
              <tr>
                <th>Anteproyectos creados</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {anteproyectos.map((anteproyecto) => (
                <tr key={anteproyecto.id}>
                  <td>{anteproyecto.nombreEmpresa}</td>
                  <td>
                    <div className={styles.contenedor_botones_anteproyectos_estudiante}>
                      <button onClick={() => editarAnteproyecto(anteproyecto.id)} className={styles.btn + ' ' + styles.editar}>
                        Editar
                      </button>
                      <button onClick={() => descargarAnteproyecto(anteproyecto)} className={styles.btn + ' ' + styles.descargar}>
                        Descargar
                      </button>
                      <button onClick={() => eliminarAnteproyecto(anteproyecto.id)} className={styles.btn + ' ' + styles.eliminar}>
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
