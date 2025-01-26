/**
 * ProyectosAsignadosProfesor.jsx
 * Muestra los anteproyectos asignados a un profesor (según token).
 */
import { useEffect, useState } from "react";
import { descargarAnteproyecto } from "../../../controller/DescargarPDF";
import Profesor from "../../../controller/profesor";
import Layout from "../../components/layout";
import SidebarProfesor from "../../components/SidebarProfesor";
import SettingsProfesor from "../../components/SettingsProfesor";
import supabase from "../../../model/supabase";

const ProyectosAsignadosProfesor = () => {
  const [proyectos, setProyectos] = useState([]);
  const profesorId = sessionStorage.getItem("token"); // Or however you get the professor

  useEffect(() => {
    async function fetchProyectos() {
      try {
        const { data, error } = await supabase
          .from("Proyecto")
          .select(`
            id,
            profesor_id,
            estado,
            anteproyecto_id,
            estudiante_id,
            Anteproyecto:anteproyecto_id (
              nombreEmpresa, -- or other columns
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
          .eq("profesor_id", profesorId);  // or filter if needed

        if (error) {
          console.error("Error fetching Proyectos:", error);
          return;
        }
        setProyectos(data || []);
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    }
    fetchProyectos();
  }, [profesorId]);

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
            <button
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => descargarAnteproyecto({ ...proyecto.Anteproyecto, estudiantes: proyecto.Estudiante })}
            >
              Descargar
            </button>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default ProyectosAsignadosProfesor;
