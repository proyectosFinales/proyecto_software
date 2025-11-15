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
