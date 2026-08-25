import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import supabase from '../../model/supabase';
import Proyecto from '../../controller/Proyecto';
import Footer from '../components/Footer';
import HeaderProfesor from '../components/HeaderProfesor';
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

const VerProyectoProfesor = () => {
  const [proyecto, setProyecto] = useState(null);
  const [anteproyecto, setAnteproyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profesorAsignado, setProfesorAsignado] = useState(null);
  const location = useLocation();
  const [estadoActual, setEstadoActual] = useState(''); // Estado para el dropdown
  const [mensaje, setMensaje] = useState(''); // Mensaje de feedback
  const [isUpdating, setIsUpdating] = useState(false); // Deshabilitar botón al guardar

  // Utilidad para obtener query param
  const getQueryParam = (param) => {
    const params = new URLSearchParams(location.search);
    return params.get(param);
  };


  /**
   * Genera las opciones de estado válidas según el estado actual del proyecto,
   * basándose en los requisitos REQ-40 a REQ-44.
   * @param {string} estadoActual - El estado actual del proyecto (ej: "Informe Final")
   * @returns {Array<{value: string, label: string}>} - Opciones para el <select>
   */
  const getOpcionesDeEstado = (estadoActual) => {
    let opciones = []; // Array para las nuevas transiciones

    const estadosAvance = [
      'Avance I', 'Avance II', 'Avance III', 'Informe Preliminar',
      'Pasa', 'A Mejorar', 'No Pasa' // Incluir los mismos estados para poder cambiarlos
    ];
    const estadosFinal = ['Informe Final', 'Informe a Coordinación'];
    const estadoDefensa = ['Defensa'];

    if (estadosAvance.includes(estadoActual)) {
      opciones = [
        { value: "Pasa", label: "Pasa (Avance / Preliminar)" },
        { value: "A Mejorar", label: "A Mejorar (Avance / Preliminar)" },
        { value: "No Pasa", label: "No Pasa (Avance / Preliminar)" },
      ];
    } 
    else if (estadosFinal.includes(estadoActual)) {
      opciones = [
        { value: "Aprobado", label: "Aprobado (Final / Coordinación)" },
        { value: "Suspendido", label: "Suspendido (Final / Coordinación)" },
      ];
    } 
    else if (estadoDefensa.includes(estadoActual)) {
      opciones = [
        { value: "Aprobado", label: "Aprobado (Defensa)" },
        { value: "Reprobado", label: "Reprobado (Defensa)" },
      ];
    }

    // --- Lógica para el <select> ---
    // 1. Verificamos si el estado actual ya es una de las opciones (ej: 'Pasa')
    // 2. Si no está incluido (ej: 'Informe Final'), lo agregamos al inicio
    // 3. Si el estado es terminal (Aprobado, Suspendido, Reprobado), solo se muestra a sí mismo.
    const estadoYaIncluido = opciones.some(op => op.value === estadoActual);

    if (!estadoYaIncluido) {
      opciones.unshift({ value: estadoActual, label: `Actual: ${estadoActual}` });
    }

    const estadosTerminales = ['Aprobado', 'Suspendido', 'Reprobado'];
    if (estadosTerminales.includes(estadoActual)) {
      return [{ value: estadoActual, label: `Estado Final: ${estadoActual}` }];
    }

    return opciones;
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
          estado,
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
    };
    fetchProyecto();
    // eslint-disable-next-line
  }, [location]);

  /**
   * Manejador para actualizar el estado del proyecto
   */
  const handleEstadoSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMensaje('Actualizando estado...');

    if (!proyecto) {
      setMensaje('Error: No se ha cargado el proyecto.');
      setIsUpdating(false);
      return;
    }

    // Se crea una instancia temporal de Proyecto para usar el método
    const proj = new Proyecto(
      proyecto.id, 
      estadoActual, 
      proyecto.anteproyecto_id, 
      proyecto.estudiante_id, 
      proyecto.profesor_id
    );

    // Llamar al método del controlador
    const success = await proj.actualizarEstado(estadoActual);

    if (success) {
      setMensaje('¡Estado actualizado exitosamente!');
    } else {
      setMensaje('Error al actualizar el estado. Intente de nuevo.');
    }
    setIsUpdating(false);
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (!proyecto || !anteproyecto) return <div className="p-8 text-red-600 font-bold">No se encontró el proyecto.</div>;

  // Render igual a FormularioCoordinador, pero solo lectura
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <HeaderProfesor title="Ver Proyecto" />
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

          {/* Nueva Sección: Gestión de Estado (Editable) */}
<h3 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginTop: '2.5rem', marginBottom: '0.75rem', borderBottom: '3px solid #1d4ed8', paddingBottom: '0.25rem', color: '#1d3557' }}>Gestión de Estado del Proyecto</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="estado-proyecto">Actualizar Estado del Proyecto</label>
            <select 
              id="estado-proyecto" 
              value={estadoActual} 
              onChange={(e) => setEstadoActual(e.target.value)}
              disabled={isUpdating}
              style={{ padding: '8px', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              {/* Renderizado dinámico de opciones */}
              {getOpcionesDeEstado(proyecto?.estado || estadoActual).map(opcion => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isUpdating}
            style={{
              backgroundColor: isUpdating ? '#ccc' : '#1d4ed8',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              marginTop: '1rem'
            }}
          >
            {isUpdating ? 'Guardando...' : 'Guardar Cambio de Estado'}
          </button>

          {/* Mensaje de feedback */}
          {mensaje && (
            <div style={{ marginTop: '1rem', color: mensaje.includes('Error') ? 'red' : 'green', fontWeight: 'bold' }}>
              {mensaje}
            </div>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default VerProyectoProfesor;
