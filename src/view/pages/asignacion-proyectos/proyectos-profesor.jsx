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

const ProyectosAsignadosProfesor = () => {
  const [anteproyectos, setAnteproyectos] = useState([]);

  useEffect(() => {
    Profesor.fromID(sessionStorage.getItem("token")).then(profesor => {
      setAnteproyectos(profesor?.anteproyectos || []);
    });
  }, []);

  return (
    <Layout
      title="Proyectos asignados a profesor"
      Sidebar={SidebarProfesor}
      Settings={SettingsProfesor}
    >
      <ul className="list-none border-2 border-slate-800 m-4 p-0 rounded shadow-sm">
        <li className="bg-slate-200 font-bold border-b-2 border-slate-800 px-4 py-2">
          Anteproyectos asignados
        </li>
        {anteproyectos.map((anteproyecto, index) => (
          <li key={`anteproyecto-${index}`} className="px-4 py-4 border-b border-slate-300">
            <p className="mt-2"><span className="font-semibold">Empresa:</span> {anteproyecto.nombreEmpresa}</p>
            <p><span className="font-semibold">Estudiante:</span> {anteproyecto.estudiante?.nombre}</p>
            <p><span className="font-semibold">Correo:</span> {anteproyecto.estudiante?.correo}</p>
            <p><span className="font-semibold">Carnet:</span> {anteproyecto.estudiante?.carnet}</p>
            <p><span className="font-semibold">Teléfono:</span> {anteproyecto.estudiante?.telefono}</p>
            <button
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => descargarAnteproyecto({ ...anteproyecto, estudiantes: anteproyecto.estudiante })}
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
