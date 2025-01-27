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
              estado
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
            <p className="mt-2"><span className="font-semibold">Proyecto ID:</span> {proyecto.id}</p>
            <p><span className="font-semibold">Estado:</span> {proyecto.estado}</p>
            <p><span className="font-semibold">Estudiante:</span> {proyecto.Estudiante?.Usuario?.nombre}</p>
            <div className="flex gap-2 mt-4">
              <button
                className="btn btn-primary"
                onClick={() => descargarAnteproyecto({ ...proyecto.Anteproyecto, estudiantes: proyecto.Estudiante })}
              >
                Descargar
              </button>
              <button className="btn btn-primary" 
                onClick={() => navigate(`/avances/${proyecto.id}`)}>Avances</button>
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default ProyectosAsignadosProfesor;
