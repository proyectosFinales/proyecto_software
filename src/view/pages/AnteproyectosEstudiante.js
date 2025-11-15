/**
 * AnteproyectosEstudiante.jsx
 * Muestra los anteproyectos creados por el estudiante logueado (sessionStorage).
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import HeaderEstudiante from '../components/HeaderEstudiante';
import { descargarAnteproyecto } from '../../controller/DescargarPDF';

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
          categoria_id,
          semestre,
          año,
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
          Correcciones:correcciones_anteproyecto_id_fkey (
            seccion,
            contenido
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
          ),
          Categoria:categoria_id (
            nombre
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

  /**
   * FUNCIÓN TEMPORAL para eliminar completamente un anteproyecto
   * 
   * Esta función elimina de forma completa y en cascada un anteproyecto junto con todas sus relaciones:
   * 
   * 1. PROYECTO ASOCIADO (si existe):
   *    - Elimina todos los avances del proyecto
   *    - Si hay profesor asignado:
   *      * Decrementa el contador de proyectos asignados del profesor
   *      * Desasigna el asesor del estudiante
   *    - Elimina el registro del proyecto
   * 
   * 2. CORRECCIONES:
   *    - Elimina todas las correcciones asociadas al anteproyecto
   * 
   * 3. RELACIONES DE CONTACTO:
   *    - Elimina los registros en AnteproyectoContacto
   * 
   * 4. ANTEPROYECTO:
   *    - Elimina el registro del anteproyecto
   * 
   * 5. LIMPIEZA INTELIGENTE (filtrada por semestre y año):
   *    - Contacto de Empresa: Solo se elimina si no está siendo usado por otros anteproyectos del mismo semestre/año
   *    - Contacto de RRHH: Solo se elimina si no está siendo usado por otros anteproyectos del mismo semestre/año
   *    - Empresa: Solo se elimina si no está siendo usada por otros anteproyectos del mismo semestre/año
   * 
   * Esta función está diseñada para ser resiliente:
   * - Si algún elemento no existe, simplemente lo salta y continúa
   * - Usa .maybeSingle() para evitar errores cuando no hay datos
   * - Proporciona logs detallados en consola para seguimiento
   * - Muestra confirmación antes de ejecutar
   * - Recarga la lista de anteproyectos después de eliminar
   * 
   * @param {Object} anteproyecto - Objeto completo del anteproyecto a eliminar
   */
  async function eliminarAnteproyectoCompleto(anteproyecto) {
    const confirmDelete = window.confirm(`¿Está seguro de ELIMINAR COMPLETAMENTE el anteproyecto "${anteproyecto.Empresa.nombre}"? Esta acción eliminará:\n- El proyecto asociado (si existe)\n- Las asignaciones del profesor\n- Los contactos (si no están siendo usados por otros)\n- La empresa (si no está siendo usada por otros)\n- Todas las correcciones\n- El anteproyecto\n\nEsta acción NO se puede deshacer.`);
    
    if (!confirmDelete) return;

    try {
      const anteproyectoId = anteproyecto.id;
      const semestreAnteproyecto = anteproyecto.semestre;
      const añoAnteproyecto = anteproyecto.año;
      const nombreContactoEmpresa = anteproyecto?.AnteproyectoContacto?.[0]?.ContactoEmpresa?.nombre;
      const nombreRRHH = anteproyecto?.AnteproyectoContacto?.[0]?.RRHH?.nombre;
      const nombreEmpresa = anteproyecto?.Empresa?.nombre;

      console.log("Iniciando eliminación completa del anteproyecto:", anteproyectoId);

      // PASO 1: Buscar si existe un proyecto asociado
      const { data: proyectoData, error: proyectoError } = await supabase
        .from('Proyecto')
        .select('id, profesor_id, estudiante_id')
        .eq('anteproyecto_id', anteproyectoId)
        .maybeSingle();

      if (proyectoError && proyectoError.code !== 'PGRST116') {
        throw proyectoError;
      }

      // PASO 2: Si hay proyecto, eliminarlo con todo lo asociado
      if (proyectoData) {
        console.log("Proyecto encontrado:", proyectoData.id);

        // 2a. Eliminar avances del proyecto
        const { error: deleteAvancesError } = await supabase
          .from('Avance')
          .delete()
          .eq('proyecto_id', proyectoData.id);
        
        if (deleteAvancesError) {
          console.log("No hay avances o error:", deleteAvancesError.message);
        } else {
          console.log("Avances eliminados");
        }

        // 2b. Si hay profesor asignado, decrementar sus asignaciones
        if (proyectoData.profesor_id) {
          const { data: asignacionData, error: asignacionError } = await supabase
            .from('AsignacionesProfesor')
            .select('asignados')
            .eq('idProfesor', proyectoData.profesor_id)
            .eq('semestre', semestreAnteproyecto)
            .eq('año', añoAnteproyecto)
            .maybeSingle();

          if (!asignacionError && asignacionData) {
            const nuevosAsignados = Math.max(0, asignacionData.asignados - 1);
            const { error: updateAsignadosError } = await supabase
              .from('AsignacionesProfesor')
              .update({ asignados: nuevosAsignados })
              .eq('idProfesor', proyectoData.profesor_id)
              .eq('semestre', semestreAnteproyecto)
              .eq('año', añoAnteproyecto);

            if (updateAsignadosError) {
              console.log("Error al decrementar asignados:", updateAsignadosError.message);
            } else {
              console.log("Asignados del profesor decrementados");
            }
          }

          // 2c. Desasignar asesor del estudiante
          if (proyectoData.estudiante_id) {
            const { error: updateEstudianteError } = await supabase
              .from('Estudiante')
              .update({ asesor: null })
              .eq('estudiante_id', proyectoData.estudiante_id);

            if (updateEstudianteError) {
              console.log("Error al desasignar asesor:", updateEstudianteError.message);
            } else {
              console.log("Asesor desasignado del estudiante");
            }
          }
        }

        // 2d. Eliminar el proyecto
        const { error: deleteProyectoError } = await supabase
          .from('Proyecto')
          .delete()
          .eq('id', proyectoData.id);

        if (deleteProyectoError) throw deleteProyectoError;
        console.log("Proyecto eliminado");
      }

      // PASO 3: Eliminar correcciones
      const { error: deleteCorreccionesError } = await supabase
        .from('Correcciones')
        .delete()
        .eq('anteproyecto_id', anteproyectoId);

      if (deleteCorreccionesError) {
        console.log("No hay correcciones o error:", deleteCorreccionesError.message);
      } else {
        console.log("Correcciones eliminadas");
      }

      // PASO 4: Eliminar AnteproyectoContacto
      const { error: deleteAnteContactoError } = await supabase
        .from('AnteproyectoContacto')
        .delete()
        .eq('anteproyecto_id', anteproyectoId);

      if (deleteAnteContactoError) {
        console.log("No hay AnteproyectoContacto o error:", deleteAnteContactoError.message);
      } else {
        console.log("AnteproyectoContacto eliminado");
      }

      // PASO 5: Eliminar el anteproyecto
      const { error: deleteAnteproyectoError } = await supabase
        .from('Anteproyecto')
        .delete()
        .eq('id', anteproyectoId);

      if (deleteAnteproyectoError) throw deleteAnteproyectoError;
      console.log("Anteproyecto eliminado");

      // PASO 6: Verificar y eliminar contacto empresa si solo estaba usado por este anteproyecto en el mismo semestre/año
      if (nombreContactoEmpresa) {
        const { data: contactoData, error: contactoError } = await supabase
          .from('ContactoEmpresa')
          .select(`
            id,
            nombre,
            AnteproyectoContact:anteproyectocontacto_contacto_id_fkey (
              contacto_id,
              Anteproyecto:anteproyecto_id (
                semestre,
                año
              )
            )
          `)
          .eq('nombre', nombreContactoEmpresa)
          .maybeSingle();

        if (!contactoError && contactoData && contactoData.AnteproyectoContact) {
          // Filtrar solo anteproyectos del mismo semestre/año
          const relacionesMismoSemestreAño = contactoData.AnteproyectoContact.filter(
            rel => rel.Anteproyecto && 
                   rel.Anteproyecto.semestre === semestreAnteproyecto && 
                   rel.Anteproyecto.año === añoAnteproyecto
          );

          // Si no hay más relaciones en el mismo semestre/año, eliminar el contacto
          if (relacionesMismoSemestreAño.length === 0) {
            const { error: deleteContactoError } = await supabase
              .from('ContactoEmpresa')
              .delete()
              .eq('nombre', nombreContactoEmpresa);

            if (!deleteContactoError) {
              console.log("Contacto empresa eliminado");
            }
          } else {
            console.log("Contacto empresa NO eliminado (usado por otros anteproyectos)");
          }
        }
      }

      // PASO 7: Verificar y eliminar contacto RRHH si solo estaba usado por este anteproyecto en el mismo semestre/año
      if (nombreRRHH) {
        const { data: rrhhData, error: rrhhError } = await supabase
          .from('ContactoEmpresa')
          .select(`
            id,
            nombre,
            AnteproyectoContact:AnteproyectoContacto_rrhh_id_fkey (
              contacto_id,
              Anteproyecto:anteproyecto_id (
                semestre,
                año
              )
            )
          `)
          .eq('nombre', nombreRRHH)
          .maybeSingle();

        if (!rrhhError && rrhhData && rrhhData.AnteproyectoContact) {
          // Filtrar solo anteproyectos del mismo semestre/año
          const relacionesMismoSemestreAño = rrhhData.AnteproyectoContact.filter(
            rel => rel.Anteproyecto && 
                   rel.Anteproyecto.semestre === semestreAnteproyecto && 
                   rel.Anteproyecto.año === añoAnteproyecto
          );

          // Si no hay más relaciones en el mismo semestre/año, eliminar el contacto
          if (relacionesMismoSemestreAño.length === 0) {
            const { error: deleteRRHHError } = await supabase
              .from('ContactoEmpresa')
              .delete()
              .eq('nombre', nombreRRHH);

            if (!deleteRRHHError) {
              console.log("Contacto RRHH eliminado");
            }
          } else {
            console.log("Contacto RRHH NO eliminado (usado por otros anteproyectos)");
          }
        }
      }

      // PASO 8: Verificar y eliminar empresa si solo estaba usada por este anteproyecto en el mismo semestre/año
      if (nombreEmpresa) {
        const { data: empresaData, error: empresaError } = await supabase
          .from('Empresa')
          .select(`
            id,
            nombre,
            ContactoEmpresa:contactoempresa_empresa_id_fkey(
              nombre,
              AnteproyectoContact:anteproyectocontacto_contacto_id_fkey (
                contacto_id,
                Anteproyecto:anteproyecto_id (
                  semestre,
                  año
                )
              )
            )
          `)
          .eq('nombre', nombreEmpresa)
          .maybeSingle();

        if (!empresaError && empresaData) {
          let puedeEliminarEmpresa = true;

          // Verificar si algún contacto de la empresa tiene relaciones con otros anteproyectos del mismo semestre/año
          if (empresaData.ContactoEmpresa && empresaData.ContactoEmpresa.length > 0) {
            for (const contacto of empresaData.ContactoEmpresa) {
              if (contacto.AnteproyectoContact && contacto.AnteproyectoContact.length > 0) {
                const relacionesMismoSemestreAño = contacto.AnteproyectoContact.filter(
                  rel => rel.Anteproyecto && 
                         rel.Anteproyecto.semestre === semestreAnteproyecto && 
                         rel.Anteproyecto.año === añoAnteproyecto
                );

                if (relacionesMismoSemestreAño.length > 0) {
                  puedeEliminarEmpresa = false;
                  break;
                }
              }
            }
          }

          if (puedeEliminarEmpresa) {
            const { error: deleteEmpresaError } = await supabase
              .from('Empresa')
              .delete()
              .eq('nombre', nombreEmpresa);

            if (!deleteEmpresaError) {
              console.log("Empresa eliminada");
            }
          } else {
            console.log("Empresa NO eliminada (usada por otros anteproyectos)");
          }
        }
      }

      alert('Anteproyecto eliminado completamente con éxito.');
      consultarAnteproyectos(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar anteproyecto completo:', error);
      alert('Error al eliminar el anteproyecto: ' + error.message);
    }
  }

  async function verDetallesProyecto(anteproyectoId) {
    try {
      // Buscar si existe un proyecto asociado a este anteproyecto
      const { data, error } = await supabase
        .from('Proyecto')
        .select('id')
        .eq('anteproyecto_id', anteproyectoId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          alert('Este anteproyecto aún no tiene un proyecto asociado.');
        } else {
          throw error;
        }
        return;
      }
      
      if (data && data.id) {
        navigate(`/verProyectoEstudiante?id=${data.id}`);
      } else {
        alert('Este anteproyecto aún no tiene un proyecto asociado.');
      }
    } catch (error) {
      console.error('Error al buscar proyecto:', error);
      alert('Error al buscar el proyecto asociado: ' + error.message);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HeaderEstudiante title="Mis Anteproyectos" />
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto bg-white p-4 rounded shadow">
          <button
            onClick={() => navigate('/formularioEstudiantes')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mb-4"
          >
            Crear Anteproyecto
          </button>

          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200 border-b">
                <th className="p-3 border-r text-left">Nombre del proyecto</th>
                <th className="p-3 border-r text-left">Semestre</th>
                <th className="p-3 border-r text-left">Año</th>
                <th className="p-3 border-r text-left">Estado</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {anteproyectos.map((anteproyecto) => (
                <tr key={anteproyecto.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 border-r">{anteproyecto.Empresa.nombre}</td>
                  <td className="p-3 border-r">{anteproyecto.semestre || 'N/A'}</td>
                  <td className="p-3 border-r">{anteproyecto.año || 'N/A'}</td>
                  <td className="p-3 border-r">{anteproyecto.estado}</td>
                  <td className="p-3 flex space-x-2">
                    <button
                      onClick={() => editarAnteproyecto(anteproyecto.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                      disabled={anteproyecto.estado === "Aprobado"}
                      style={anteproyecto.estado === "Aprobado" ? { backgroundColor: '#d1d5db', color: '#888', cursor: 'not-allowed' } : {}}
                    >
                      {anteproyecto.estado === "Correccion" ? "Corregir" : "Editar"}
                    </button>
                    <button
                      onClick={() => descargarAnteproyecto(anteproyecto)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    >
                      Descargar
                    </button>
                    {anteproyecto.estado === "Aprobado" && (
                      <button
                        onClick={() => verDetallesProyecto(anteproyecto.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      >
                        Ver Detalles
                      </button>
                    )}
                    {/* 
                      BOTÓN TEMPORAL DE ELIMINACIÓN COMPLETA - OCULTO
                      
                      Este botón permite eliminar completamente un anteproyecto con todas sus relaciones.
                      Para activarlo, simplemente descomenta el siguiente bloque de código.
                      
                      La función eliminarAnteproyectoCompleto() ya está implementada arriba y realiza:
                      - Eliminación en cascada del proyecto y sus avances
                      - Limpieza de asignaciones de profesor
                      - Eliminación de correcciones
                      - Limpieza inteligente de contactos y empresas (solo si no están en uso)
                      
                      USAR CON PRECAUCIÓN: Esta acción es irreversible.
                    */}
                    { /*
                    <button
                      onClick={() => eliminarAnteproyectoCompleto(anteproyecto)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      title="TEMPORAL: Eliminar completamente este anteproyecto"
                    >
                      🗑️ TEMP
                    </button>
                    */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AnteproyectosEstudiante;
