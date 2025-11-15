/**
 * ProyectosAsignadosProfesor.jsx
 * Muestra los anteproyectos asignados a un profesor (según token).
 */
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { descargarAnteproyecto } from "../../../controller/DescargarPDF";
import Profesor from "../../../controller/profesor";
import Layout from "../../components/layout";
import SidebarProfesor from "../../components/SidebarProfesor";
import SettingsProfesor from "../../components/SettingsProfesor";
import supabase from "../../../model/supabase";

const ProyectosAsignadosProfesor = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const userId = sessionStorage.getItem("token"); // Or however you get the professor

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        // Obtener el profesor_id usando el user_id
        const { data: profesorData, error: profesorError } = await supabase
          .from('Profesor')
          .select('profesor_id')
          .eq('id_usuario', userId)
          .single();

        if (profesorError)
          throw new Error('Error fetching Profesor:', profesorError);

        const profesorId = profesorData.profesor_id;

        // Usar el profesor_id para obtener los proyectos
        const { data: proyectosData, error: proyectosError } = await supabase
          .from('Proyecto')
          .select(`
            id,
            estado,
            anteproyecto_id,
            estudiante_id,
            Anteproyecto:anteproyecto_id (
              estado,
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
            ),
            Estudiante:estudiante_id (
              estudiante_id,
              Usuario:id_usuario (
                nombre,
                correo
              )
            )
          `)
          .eq('profesor_id', profesorId);

        if (proyectosError) 
          throw new Error('Error fetching Proyectos:', proyectosError);

        setProyectos(proyectosData);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchProyectos();
  }, [userId]);

  const handleCambiarEstadoProyecto = async (proyectoId, nuevoEstado) => {
    const confirmacion = window.confirm(`¿Está seguro de cambiar el estado del proyecto a "${nuevoEstado}"?`);
    if (!confirmacion) return;

    try {
      const { error } = await supabase
        .from('Proyecto')
        .update({ estado: nuevoEstado })
        .eq('id', proyectoId);
      
      if (error) throw error;
      
      // Actualizar el estado local
      setProyectos(proyectos.map(p => 
        p.id === proyectoId ? { ...p, estado: nuevoEstado } : p
      ));
      
      alert(`Proyecto ${nuevoEstado.toLowerCase()} exitosamente`);
    } catch (error) {
      console.error('Error al cambiar estado del proyecto:', error);
      alert('Error al cambiar el estado del proyecto');
    }
  };

  return (
    <Layout
      title="Proyectos asignados a profesor"
      Sidebar={SidebarProfesor}
      Settings={SettingsProfesor}
    >
      <ul className="list-none border-2 border-slate-800 m-4 p-0 rounded shadow-sm">
        <li className="bg-slate-200 font-bold border-b-2 border-slate-800 px-4 py-2">
          Proyectos asignados
        </li>
        {proyectos.map((proyecto) => (
          <li key={proyecto.id} className="px-4 py-4 border-b border-slate-300">
            <p className="mt-2"><span className="font-semibold">Empresa:</span> {proyecto.Anteproyecto?.Empresa?.nombre || 'N/A'}</p>
            <p><span className="font-semibold">Estudiante:</span> {proyecto.Estudiante?.Usuario?.nombre}</p>
            <p><span className="font-semibold">Semestre:</span> {proyecto.Anteproyecto?.semestre || 'N/A'}</p>
            <p><span className="font-semibold">Año:</span> {proyecto.Anteproyecto?.año || 'N/A'}</p>
            <p>
              <span className="font-semibold">Estado:</span> 
              <span className={`ml-2 px-2 py-1 rounded ${
                proyecto.estado === 'Aprobado' ? 'bg-green-200 text-green-800' : 
                proyecto.estado === 'Reprobado' ? 'bg-red-200 text-red-800' : 
                'bg-gray-200 text-gray-800'
              }`}>
                {proyecto.estado}
              </span>
            </p>
            <div className="flex gap-2 mt-4">
              <div className="flex gap-2 flex-grow">
                <button
                  className="btn btn-primary"
                  onClick={() => descargarAnteproyecto({ ...proyecto.Anteproyecto, estudiantes: proyecto.Estudiante })}
                >
                  Descargar
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate(`/verProyectoProfesor?id=${proyecto.id}`)}
                >
                  Ver Proyecto
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate(`/avances/${proyecto.id}`)}
                >
                  Avances
                </button>
              </div>
              <div className="flex gap-2 ml-auto">
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => handleCambiarEstadoProyecto(proyecto.id, 'Asignado')}
                  disabled={proyecto.estado === 'Asignado'}
                >
                  Asignado
                </button>
                <button 
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => handleCambiarEstadoProyecto(proyecto.id, 'Aprobado')}
                  disabled={proyecto.estado === 'Aprobado'}
                >
                  Aprobar
                </button>
                <button 
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => handleCambiarEstadoProyecto(proyecto.id, 'Reprobado')}
                  disabled={proyecto.estado === 'Reprobado'}
                >
                  Reprobar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default ProyectosAsignadosProfesor;
