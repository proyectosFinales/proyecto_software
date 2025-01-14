/**
 * ProyectosAsignadosProfesor.jsx
 * Muestra los anteproyectos asignados a un profesor (según token).
 */
import { useEffect, useState } from "react";
import listStyles from "../../styles/list.module.css";
import Styles from "../../styles/proyectos-profesor.module.css";
import { descargarAnteproyecto } from "../../../controller/DescargarPDF";
import Profesor from "../../../controller/profesor";
import Layout from "../../components/layout";
import SidebarProfesor from "../../components/SidebarProfesor";
// Ajustar si tu settings es "SettingsProfesor" o "SettingsCoordinador".
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
      <ul className={listStyles.list}>
        <li className={listStyles.title}>Anteproyectos asignados</li>
        {anteproyectos.map((anteproyecto, index) => (
          <li key={`anteproyecto-${index}`}>
            <p><label>Empresa:</label> {anteproyecto.nombreEmpresa}</p>
            <p><label>Estudiante:</label> {anteproyecto.estudiante.nombre}</p>
            <p><label>Correo:</label> {anteproyecto.estudiante.correo}</p>
            <p><label>Carnet:</label> {anteproyecto.estudiante.carnet}</p>
            <p><label>Teléfono:</label> {anteproyecto.estudiante.telefono}</p>
            <button
              className={Styles.descargar}
              onClick={() =>
                descargarAnteproyecto({
                  ...anteproyecto,
                  estudiantes: anteproyecto.estudiante
                })
              }
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
