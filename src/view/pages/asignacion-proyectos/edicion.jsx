/**
 * EdicionAsignacionProyectos.jsx
 * Ventana para asignar manualmente Anteproyectos a profesores,
 * ver reporte, deasignar, etc.
 */
import { useEffect, useRef, useState } from "react";
import Anteproyecto from "../../../controller/anteproyecto";
import Profesor from "../../../controller/profesor";
import { generarReporteAsignaciones } from "../../../controller/asignacion.js";
import Button from "../../components/button";
import Layout from "../../components/layout";
import styles from "../../styles/table.module.css";
import Modal from "../../components/modal.jsx";
import { FloatInput } from "../../components/input.jsx";
import { errorToast, successToast } from "../../components/toast";

const EdicionAsignacionProyectos = () => {
  const [profesores, setProfesores] = useState([]);

  useEffect(() => {
    actualizarProfesores();
  }, []);
    
  const actualizarProfesores = () => {
    Profesor.obtenerEncargados().then(setProfesores);
  };

  /**
   * Deasigna un anteproyecto (quita el profesor encargado).
   * @param {Anteproyecto} anteproyecto
   */
  const desencargarAnteproyecto = async (anteproyecto) => {
    if(!window.confirm(`Remover la asignación del proyecto de ${anteproyecto.estudiante.nombre}?`)) return;
    anteproyecto.encargado = null;
    await anteproyecto.guardarAsignacion();
    successToast(`La asignación del proyecto de ${anteproyecto.estudiante.nombre} fue removida`);
    actualizarProfesores();
  };

  return (
    <>
      <h2 className="text-xl font-bold my-4">Edición de Asignaciones</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-300 rounded p-4">
          {/* Sección con tabla de profesores */}
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-2 text-left font-semibold">Profesor</th>
                <th className="p-2 text-left font-semibold">Proyectos</th>
              </tr>
            </thead>
            <tbody>
              {profesores.map((prof) => (
                <tr key={prof.profesor_id} className="border-b">
                  <td className="p-2">{prof.nombre}</td>
                  <td className="p-2">
                    {/* Muestra sus anteproyectos asignados */}
                    {prof.anteproyectos?.map((ap) => (
                      <div key={ap.id} className="my-2">
                        {ap.estudiante?.nombre} — {ap.nombreEmpresa}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Botón para generar reporte */}
          <button
            onClick={() => generarReporteAsignaciones(profesores)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Generar Reporte
          </button>
        </div>
        <div className="border border-gray-300 rounded p-4">
          {/* Modal add project, etc. */}
          <AdicionAnteproyectoProfesor
            profesor={profesores[0]}
            onAdicion={actualizarProfesores}
          />
        </div>
      </div>
    </>
  );
};

/**
 * Modal para agregar un anteproyecto asignable al profesor.
 */
const AdicionAnteproyectoProfesor = ({ profesor, onAdicion }) => {
  const modalRef = useRef({});
  const [anteproyectos, setAnteproyectos] = useState([]);
  const [seleccionado, setSeleccionado] = useState("");

  const abrir = async () => {
    const asignables = await Anteproyecto.obtenerAsignables();
    setAnteproyectos(asignables);
    modalRef.current.open();
  };

  const agregar = async () => {
    if(!seleccionado) {
      errorToast("Selecciona un proyecto a asignar");
      return;
    }
    /** @type {Anteproyecto} */
    const anteproyectoSeleccionado = anteproyectos.find(ap => ap.id === seleccionado);
    anteproyectoSeleccionado.encargado = profesor;
    await anteproyectoSeleccionado.guardarAsignacion();
    onAdicion();
    successToast("Proyecto agregado");
    setSeleccionado("");
    modalRef.current.close();
  };

  return (
    <>
      <Button onClick={abrir}>Agregar proyecto</Button>
      <Modal
        title={`Adición de proyecto a ${profesor.nombre}`}
        modalRef={modalRef}
        footer={<Button onClick={agregar}>Agregar</Button>}
      >
        <FloatInput text="Anteproyectos disponibles">
          <select
            value={seleccionado}
            onChange={event => setSeleccionado(event.target.value)}
          >
            <option disabled value="">Seleccione un anteproyecto</option>
            {anteproyectos.map((ap, index) => (
              <option key={`anteproyecto-asignable-${index}`} value={ap.id}>
                {ap.estudiante.nombre} - {ap.nombreEmpresa}
              </option>
            ))}
          </select>
        </FloatInput>
      </Modal>
    </>
  );
};

export default EdicionAsignacionProyectos;
