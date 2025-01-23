/**
 * AsignacionAutomatica.jsx
 * Ventana para realizar asignación automática de Anteproyectos a Profesores.
 */
import { useEffect, useRef, useState } from "react";
import Button from "../../components/button";
import Layout from "../../components/layout";
import listStyles from "../../styles/list.module.css";
import Anteproyecto from "../../../controller/anteproyecto";
import Profesor from "../../../controller/profesor";
import { asignarAnteproyectosAProfesores } from "../../../controller/asignacion";
import { errorToast, loadToast, successToast } from "../../components/toast";
import Modal from "../../components/modal.jsx";

/**
 * Componente principal de asignación automática.
 */
const AsignacionAutomatica = () => {
  const [anteproyectos, setAnteproyectos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [calculando, setCalculando] = useState(false);
  const [asignaciones, setAsignaciones] = useState({asignados: [], noasignados: []});
  const modalRef = useRef({});

  useEffect(() => {
    Anteproyecto.obtenerAsignables().then(setAnteproyectos);
    Profesor.obtenerTodos().then(setProfesores);
  }, []);

  const calcularAsignacion = () => {
    setCalculando(true);
    // asignarAnteproyectosAProfesores() -> Llama a tu lógica de asignación
    const asignacion = asignarAnteproyectosAProfesores(anteproyectos, profesores);
    asignacion.then(resultado => {
      modalRef.current.open();
      setAsignaciones(resultado);
    });
    asignacion.finally(() => setCalculando(false));
  };

  const guardarAsignacion = () => {
    // Guardar las asignaciones en BD -> anteproyecto.guardarAsignacion()
    const guardado = Promise.all(asignaciones.asignados.map(ap => ap.guardarAsignacion()));
    guardado.then(() => {
      modalRef.current.close();
      successToast("Asignaciones de anteproyectos guardadas.");
    });
    guardado.catch(() => errorToast("Error en guardado de asignaciones de anteproyectos."));
  };

  return (
    <Layout title="Asignación Automática de profesores a proyectos">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Asignación Automática</h1>
        <Button onClick={calcularAsignacion} disabled={calculando}>Inicializar asignación</Button>
        <TablaAnteproyectos title="Anteproyectos asignables" anteproyectos={anteproyectos}/>
        <TablaProfesores profesores={profesores}/>
      </div>
      <Modal
        title="Asignación Calculada"
        modalRef={modalRef}
        footer={<Button onClick={guardarAsignacion}>Guardar asignaciones</Button>}
      >
        <Button onClick={guardarAsignacion}>Guardar asignaciones</Button>
        <DetalleAsignaciones asignaciones={asignaciones}/>
      </Modal>
    </Layout>
  );
};

/**
 * Muestra el detalle de qué anteproyectos se asignaron
 * y cuáles quedaron sin asignar.
 */
const DetalleAsignaciones = ({ asignaciones }) => (
  <>
    {asignaciones.noasignados.length ? (
      <p className="precaucion">
        Quedaron anteproyectos sin asignar debido a incompatibilidades 
        como Sede, No disponibilidad de profesores o Repetición con encargados anteriores!!! 
        (Estos anteproyectos pueden ser asignados de manera manual en la edición de asignaciones).
      </p>
    ) : null}
    <ul className={listStyles.list}>
      <li className={listStyles.title}>Anteproyectos asignados</li>
      {asignaciones.asignados.map((anteproyecto, index) => (
        <li key={`asignado-${index}`}>
          <ElementoDatosAnteproyecto anteproyecto={anteproyecto}/>
          <hr/>
          <p>
            <label>Profesor asignado:</label> {anteproyecto.encargado.nombre}
          </p>
          <p>
            <label>Sede:</label> {anteproyecto.encargado.sede}
          </p>
        </li>
      ))}
    </ul>
    <TablaAnteproyectos
      title="Anteproyectos no asignados"
      anteproyectos={asignaciones.noasignados}
    />
  </>
);

/**
 * Lista simple de Anteproyectos, reutilizable.
 */
const TablaAnteproyectos = ({ title, anteproyectos }) => (
  <ul className={listStyles.list}>
    <li className={listStyles.title}>{title}</li>
    {anteproyectos.map((ap, index) => (
      <li key={`ap-${index}`}>
        <ElementoDatosAnteproyecto anteproyecto={ap}/>
      </li>
    ))}
  </ul>
);

/**
 * Componente para mostrar datos de un anteproyecto:
 * estudiante, sede, empresa, estado, encargados anteriores, etc.
 */
const ElementoDatosAnteproyecto = ({ anteproyecto }) => (
  <>
    <p><label>Estudiante:</label> {anteproyecto.estudiante.nombre}</p>
    <p><label>Sede:</label> {anteproyecto.estudiante.sede}</p>
    <p><label>Empresa:</label> {anteproyecto.nombreEmpresa}</p>
    <p><label>Estado:</label> {anteproyecto.estado}</p>
    <p>
      <label>Encargados anteriores:</label>{" "}
      {anteproyecto.anteproyectosPerdidos.map(ap => ap.encargado?.nombre).join(", ") || "-"}
    </p>
  </>
);

/**
 * Tabla para mostrar profesores y su cantidadEstudiantes.
 */
const TablaProfesores = ({ profesores }) => (
  <table className="min-w-full border-collapse">
    <thead className="bg-gray-100 border-b">
      <tr>
        <th className="p-2 text-left font-semibold">Nombre</th>
        <th className="p-2 text-left font-semibold">Sede</th>
        <th className="p-2 text-left font-semibold">Cantidad de Estudiantes</th>
      </tr>
    </thead>
    <tbody>
      {profesores.map((p, idx) => (
        <tr key={idx} className="border-b">
          <td className="p-2">{p.nombre}</td>
          <td className="p-2">{p.sede}</td>
          <td className="p-2">{p.cantidadEstudiantes}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default AsignacionAutomatica;
