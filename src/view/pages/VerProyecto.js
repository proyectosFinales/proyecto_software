import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import styles from '../styles/FormularioCoordinador.module.css';

// Para obtener datos del profesor asignado
const fetchProfesorAsignado = async (profesor_id) => {
  if (!profesor_id) return null;
  const { data, error } = await supabase
    .from('Profesor')
    .select(`profesor_id, Usuario:id_usuario(nombre), Categoria:categoria_id(nombre)`) 
    .eq('profesor_id', profesor_id)
    .single();
  if (error || !data) return null;
  return {
    nombre: data.Usuario?.nombre || '',
    categoria: data.Categoria?.nombre || '',
  };
};

const VerProyecto = () => {
  const [proyecto, setProyecto] = useState(null);
  const [anteproyecto, setAnteproyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profesorAsignado, setProfesorAsignado] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [haPerdido, setHaPerdido] = useState(false);
  const [historialReprobacion, setHistorialReprobacion] = useState([]);

  // Utilidad para obtener query param
  const getQueryParam = (param) => {
    const params = new URLSearchParams(location.search);
    return params.get(param);
  };

  useEffect(() => {
    const fetchProyecto = async () => {
      setLoading(true);
      const id = getQueryParam('id');
      if (!id) {
        setLoading(false);
        return;
      }
      // Buscar el proyecto y su anteproyecto relacionado
      const { data: proyectoData, error: proyectoError } = await supabase
        .from('Proyecto')
        .select(`
          id,
          anteproyecto_id,
          estudiante_id,
          profesor_id,
          Anteproyecto:anteproyecto_id (
            id,
            contexto,
            justificacion,
            sintomas,
            impacto,
            tipo,
            comentario,
            actividad,
            departamento,
            categoria_id,
            semestre,
            año,
            estado,
            Categoria:categoria_id (
              nombre
            ),
            Estudiante:estudiante_id (
              carnet,
              id_usuario,
              situacion_laboral,
              Usuario:id_usuario (
                nombre,
                correo,
                telefono,
                sede,
                canton
              )
            ),
            Empresa:empresa_id (
              nombre,
              tipo,
              provincia,
              canton,
              distrito,
              actividad
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
          )
        `)
        .eq('id', id)
        .single();
      if (proyectoError || !proyectoData) {
        setProyecto(null);
        setAnteproyecto(null);
        setProfesorAsignado(null);
        setLoading(false);
        return;
      }
      setProyecto(proyectoData);
      setAnteproyecto(proyectoData.Anteproyecto);
      // Buscar profesor asignado
      if (proyectoData.profesor_id) {
        const prof = await fetchProfesorAsignado(proyectoData.profesor_id);
        setProfesorAsignado(prof);
      } else {
        setProfesorAsignado(null);
      }
      setLoading(false);

      //Solicitar info sobre el historial de reprobacion
      const { data: historial, error: historialError } = await supabase
        .from('HistorialReprobacion')
        .select('*')
        .eq('estudiante_id', proyectoData.estudiante_id); // Usamos el ID de estudiante cargado

      if (historialError) {
        console.error("Error cargando historial:", historialError);
      }

      if (historial && historial.length > 0) {
        setHaPerdido(true);
        setHistorialReprobacion(historial); 
      }
    };
    fetchProyecto();
    // eslint-disable-next-line
  }, [location]);

  // Función para eliminar el proyecto y revertirlo a anteproyecto
  const eliminarProyecto = async () => {
    const confirmDelete = window.confirm("¿Está seguro de ELIMINAR este proyecto? El anteproyecto volverá a estado Pendiente.");
    if (!confirmDelete) return;

    try {
      const proyectoId = proyecto.id;
      const anteproyectoId = proyecto.anteproyecto_id;
      const profesorId = proyecto.profesor_id;
      const estudianteId = proyecto.estudiante_id;
      const semestreProyecto = anteproyecto.semestre;
      const añoProyecto = anteproyecto.año;

      // 1. Eliminar los avances asociados al proyecto
      const { error: deleteAvancesError } = await supabase
        .from('Avance')
        .delete()
        .eq('proyecto_id', proyectoId);
      
      if (deleteAvancesError) throw deleteAvancesError;
      console.log("Avances eliminados");

      // 2. Si hay profesor asignado, restarle 1 a sus proyectos asignados
      if (profesorId) {
        // Obtener la información actual del profesor en AsignacionesProfesor
        const { data: asignacionData, error: asignacionError } = await supabase
          .from('AsignacionesProfesor')
          .select('asignados')
          .eq('idProfesor', profesorId)
          .eq('semestre', semestreProyecto)
          .eq('año', añoProyecto)
          .maybeSingle();

        if (!asignacionError && asignacionData) {
          const nuevosAsignados = Math.max(0, asignacionData.asignados - 1);
          const { error: updateAsignadosError } = await supabase
            .from('AsignacionesProfesor')
            .update({ asignados: nuevosAsignados })
            .eq('idProfesor', profesorId)
            .eq('semestre', semestreProyecto)
            .eq('año', añoProyecto);

          if (updateAsignadosError) throw updateAsignadosError;
          console.log("Proyectos asignados del profesor decrementados");
        }

        // 3. Desasignar asesor del estudiante (poner en null)
        const { error: updateEstudianteError } = await supabase
          .from('Estudiante')
          .update({ asesor: null })
          .eq('estudiante_id', estudianteId);

        if (updateEstudianteError) throw updateEstudianteError;
        console.log("Asesor desasignado del estudiante");
      }

      // 4. Eliminar el proyecto
      const { error: deleteProyectoError } = await supabase
        .from('Proyecto')
        .delete()
        .eq('id', proyectoId);

      if (deleteProyectoError) throw deleteProyectoError;
      console.log("Proyecto eliminado");

      // 5. Cambiar el estado del anteproyecto a "Pendiente"
      const { error: updateAnteproyectoError } = await supabase
        .from('Anteproyecto')
        .update({ estado: 'Pendiente' })
        .eq('id', anteproyectoId);

      if (updateAnteproyectoError) throw updateAnteproyectoError;
      console.log("Estado del anteproyecto cambiado a Pendiente");

      alert('Proyecto eliminado exitosamente. El anteproyecto ha vuelto a estado Pendiente.');
      navigate('/asignaciones/manual');
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      alert('Error al eliminar el proyecto: ' + error.message);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (!proyecto || !anteproyecto) return <div className="p-8 text-red-600 font-bold">No se encontró el proyecto.</div>;

  // Render igual a FormularioCoordinador, pero solo lectura
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title="Ver Proyecto" />
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-6">
        <form className={styles.form}>
          <h2 className="text-2xl font-bold mb-4">Datos del Proyecto y Anteproyecto</h2>

            {/* Sección: Estudiante */}
            <h3 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginTop: '2.5rem', marginBottom: '0.75rem', borderBottom: '3px solid #1d4ed8', paddingBottom: '0.25rem', color: '#1d3557' }}>Estudiante</h3>
          <div className={styles.formGroup}>
            <label>Nombre del estudiante</label>
            <div>{anteproyecto?.Estudiante?.Usuario?.nombre || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Carnet</label>
            <div>{anteproyecto?.Estudiante?.carnet || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Correo e-oficial TEC</label>
            <div>{anteproyecto?.Estudiante?.Usuario?.correo || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Teléfono</label>
            <div>{anteproyecto?.Estudiante?.Usuario?.telefono || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Sede</label>
            <div>{anteproyecto?.Estudiante?.Usuario?.sede || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Cantón</label>
            <div>{anteproyecto?.Estudiante?.Usuario?.canton || ''}</div>
          </div>


          {/* Sección: Profesor asignado */}
          <h3 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginTop: '2.5rem', marginBottom: '0.75rem', borderBottom: '3px solid #1d4ed8', paddingBottom: '0.25rem', color: '#1d3557' }}>Profesor asignado</h3>
          <div className={styles.formGroup}>
            <label>Nombre del profesor</label>
            <div>{profesorAsignado?.nombre || 'No asignado'}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Categoría</label>
            <div>{profesorAsignado?.categoria || ''}</div>
          </div>
          

          {/* Sección: Empresa */}
          <h3 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginTop: '2.5rem', marginBottom: '0.75rem', borderBottom: '3px solid #1d4ed8', paddingBottom: '0.25rem', color: '#1d3557' }}>Empresa</h3>
          <div className={styles.formGroup}>
            <label>Nombre de la empresa</label>
            <div>{anteproyecto?.Empresa?.nombre || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Tipo de empresa</label>
            <div>{anteproyecto?.Empresa?.tipo || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Provincia</label>
            <div>{anteproyecto?.Empresa?.provincia || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Cantón empresa</label>
            <div>{anteproyecto?.Empresa?.canton || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Distrito</label>
            <div>{anteproyecto?.Empresa?.distrito || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Actividad de la empresa</label>
            <div>{anteproyecto?.Empresa?.actividad || ''}</div>
          </div>

          {/* Sección: Contacto Empresa */}
          <h3 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginTop: '2.5rem', marginBottom: '0.75rem', borderBottom: '3px solid #1d4ed8', paddingBottom: '0.25rem', color: '#1d3557' }}>Contacto Empresa</h3>
          <div className={styles.formGroup}>
            <label>Nombre del asesor industrial</label>
            <div>{anteproyecto?.AnteproyectoContacto?.[0]?.ContactoEmpresa?.nombre || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Puesto que desempeña el asesor industrial</label>
            <div>{anteproyecto?.AnteproyectoContacto?.[0]?.ContactoEmpresa?.departamento || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Teléfono del asesor industrial</label>
            <div>{anteproyecto?.AnteproyectoContacto?.[0]?.ContactoEmpresa?.telefono || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Correo del asesor industrial</label>
            <div>{anteproyecto?.AnteproyectoContacto?.[0]?.ContactoEmpresa?.correo || ''}</div>
          </div>

          {/* Sección: Recursos Humanos */}
          <h3 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginTop: '2.5rem', marginBottom: '0.75rem', borderBottom: '3px solid #1d4ed8', paddingBottom: '0.25rem', color: '#1d3557' }}>Recursos Humanos</h3>
          <div className={styles.formGroup}>
            <label>Nombre del contacto de recursos humanos</label>
            <div>{anteproyecto?.AnteproyectoContacto?.[0]?.RRHH?.nombre || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Teléfono del contacto de recursos humanos</label>
            <div>{anteproyecto?.AnteproyectoContacto?.[0]?.RRHH?.telefono || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Correo del contacto de recursos humanos</label>
            <div>{anteproyecto?.AnteproyectoContacto?.[0]?.RRHH?.correo || ''}</div>
          </div>

          {/* Sección: Anteproyecto */}
          <h3 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginTop: '2.5rem', marginBottom: '0.75rem', borderBottom: '3px solid #1d4ed8', paddingBottom: '0.25rem', color: '#1d3557' }}>Anteproyecto</h3>
          <div className={styles.formGroup}>
            <label>Contexto</label>
            <div>{anteproyecto?.contexto || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Justificación</label>
            <div>{anteproyecto?.justificacion || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Síntomas</label>
            <div>{anteproyecto?.sintomas || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Impacto</label>
            <div>{anteproyecto?.impacto || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Departamento donde realizará el proyecto</label>
            <div>{anteproyecto?.departamento || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Tipo de proyecto</label>
            <div>{anteproyecto?.tipo || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Categoría del proyecto</label>
            <div>{anteproyecto?.Categoria?.nombre || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Situación Laboral</label>
            <div>{anteproyecto?.Estudiante?.situacion_laboral || 'No especificada'}</div>
          </div>
          
          <div className={`${styles.formGroup} ${haPerdido ? styles.historialBox : ''}`}>
            <label style={{ fontWeight: 'bold' }}>Historial de Reprobación</label>
            
            {haPerdido ? (
              /* Si haPerdido es true, muestra la tabla */
              <table className={styles.historialTable}>
                <thead>
                  <tr>
                    <th>Causa</th>
                    <th>Semestre</th>
                    <th>Año</th>
                  </tr>
                </thead>
                <tbody>
                  {historialReprobacion.map((item, index) => (
                    <tr key={index}>
                      <td>{item.causa}</td>
                      <td>{item.semestre ?? item.semestre_id ?? ''}</td>
                      <td>{item.año ?? item.anio ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* Si haPerdido es false, muestra el aviso */
              <p>
                El estudiante no reporta reprobar previamente.
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Semestre</label>
            <div>{anteproyecto?.semestre || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Año</label>
            <div>{anteproyecto?.año || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Estado</label>
            <div>{anteproyecto?.estado || ''}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Observaciones</label>
            <div>{anteproyecto?.comentario || ''}</div>
          </div>

          {/* Botón para eliminar el proyecto */}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={eliminarProyecto}
              className={`${styles.button}`}
              style={{ 
                backgroundColor: '#dc2626', 
                color: 'white',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                border: 'none',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              Eliminar Proyecto
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default VerProyecto;
