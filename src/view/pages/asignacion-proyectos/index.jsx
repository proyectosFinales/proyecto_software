/**
 * InicioAsignaciones.jsx
 * Menú simple con enlaces a la asignación automática y manual.
 */
import { Link } from "react-router-dom";
import Header from "../../components/HeaderCoordinador";
import Footer from "../../components/Footer";

const InicioAsignaciones = () => (
  <>
    <Header title="Menú de asignaciones"/>
    <div className="grid grid-cols-1 gap-6 p-4 text-center sm:grid-cols-2 lg:grid-cols-2">
      <Link
        className="border border-gray-300 p-6 rounded shadow hover:shadow-md transition-transform transform hover:scale-105"
        to="/asignaciones/automatica"
      >
        <i className="fa-solid fa-laptop-code text-4xl mb-2 text-azul"></i>
        <p className="text-azul font-semibold">Asignación automática</p>
      </Link>
      <Link
        className="border border-gray-300 p-6 rounded shadow hover:shadow-md transition-transform transform hover:scale-105"
        to="/asignaciones/manual"
      >
        <i className="fa-solid fa-laptop-file text-4xl mb-2 text-azul"></i>
        <p className="text-azul font-semibold">Asignación manual y Reporte</p>
      </Link>
    </div>
    <Footer />
  </>
);

export default InicioAsignaciones;
