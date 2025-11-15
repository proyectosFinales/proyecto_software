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
  const [proyectosFiltrados, setProyectosFiltrados] = useState([]);
  
  // Obtener año y semestre actual
  const añoActual = new Date().getFullYear();
  const mesActual = new Date().getMonth() + 1; // 0-11, por eso +1
  const semestreActual = mesActual <= 6 ? 1 : 2;
  
  const [filtroAño, setFiltroAño] = useState(añoActual.toString());
  const [filtroSemestre, setFiltroSemestre] = useState(semestreActual.toString());
  const [añosDisponibles, setAñosDisponibles] = useState([]);
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

        // Ordenar proyectos por año descendente, luego por semestre descendente
        const proyectosOrdenados = proyectosData.sort((a, b) => {
          // Primero ordenar por año (descendente)
          if (b.Anteproyecto?.año !== a.Anteproyecto?.año) {
            return b.Anteproyecto?.año - a.Anteproyecto?.año;
          }
          // Si el año es igual, ordenar por semestre (descendente)
          return b.Anteproyecto?.semestre - a.Anteproyecto?.semestre;
        });

        setProyectos(proyectosOrdenados);
        
        // Generar años disponibles: año siguiente, presente y 5 anteriores
        const años = [];
        for (let i = añoActual + 1; i >= añoActual - 5; i--) {
          años.push(i);
        }
        setAñosDisponibles(años);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchProyectos();
  }, [userId]);

  // Efecto para aplicar filtros
  useEffect(() => {
    let resultado = [...proyectos];

    if (filtroAño && filtroAño !== '') {
      resultado = resultado.filter(p => p.Anteproyecto?.año === parseInt(filtroAño));
    }

    if (filtroSemestre && filtroSemestre !== '') {
      resultado = resultado.filter(p => p.Anteproyecto?.semestre === parseInt(filtroSemestre));
    }

    setProyectosFiltrados(resultado);
  }, [filtroAño, filtroSemestre, proyectos]);

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
      {/* Filtros */}
      <div className="m-4 p-4 bg-white border-2 border-slate-800 rounded shadow-sm">
        <h3 className="font-bold mb-3">Filtros</h3>
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Año:</label>
            <select 
              className="border border-gray-300 rounded px-3 py-2"
              value={filtroAño}
              onChange={(e) => setFiltroAño(e.target.value)}
            >
              <option value="">Todos</option>
              {añosDisponibles.map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Semestre:</label>
            <select 
              className="border border-gray-300 rounded px-3 py-2"
              value={filtroSemestre}
              onChange={(e) => setFiltroSemestre(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>

          {(filtroAño || filtroSemestre) && (
            <div className="flex items-end">
              <button 
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                onClick={() => {
                  setFiltroAño('');
                  setFiltroSemestre('');
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Mostrando {proyectosFiltrados.length} de {proyectos.length} proyecto(s)
        </p>
      </div>

      <ul className="list-none border-2 border-slate-800 m-4 p-0 rounded shadow-sm">
        <li className="bg-slate-200 font-bold border-b-2 border-slate-800 px-4 py-2">
          Proyectos asignados
        </li>
        {proyectosFiltrados.map((proyecto) => (
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
