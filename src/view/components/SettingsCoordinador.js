/**SettingsCoordinador.js */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SettingsCoordinador = ({ show }) => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [modalDuracion, setModalDuracion] = useState(false);
  const [duracion, setDuracion] = useState("");

  const consultarAsesor = () => {
    alert("Función para consultar asesor.");
    setModal(true);
  };

  const cambiarDuracion = (e) => {
    e.preventDefault();
    alert(`Duración actualizada a ${duracion || 1} hora(s).`);
    setModalDuracion(false);
  };

  const delSessionToken = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <>
      <nav
        className={`fixed top-0 right-0 h-full bg-gris_oscuro text-blanco p-6 transition-transform transform ${
          show ? "translate-x-0" : "translate-x-full"
        } w-64 shadow-lg z-50`}
      >
        <ul className="space-y-4">
          <li>
            <button
              onClick={consultarAsesor}
              className="block w-full text-left p-2 hover:bg-gris_claro rounded"
            >
              Consultar asesor
            </button>
          </li>
          <li>
            <button
              onClick={() => setModalDuracion(true)}
              className="block w-full text-left p-2 hover:bg-gris_claro rounded"
            >
              Establecer duración de las defensas
            </button>
          </li>
          <li>
            <button
              onClick={delSessionToken}
              className="block w-full text-left p-2 hover:bg-gris_claro rounded"
            >
              Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>

      {/* Modal para consultar asesor */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Información del Asesor</h2>
            <p className="mb-4">Aquí irá la información del asesor.</p>
            <button
              onClick={() => setModal(false)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal para cambiar duración */}
      {modalDuracion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">
              Establecer Duración de las Defensas
            </h2>
            <p className="mb-4">
              La duración predeterminada es 1 hora. Si no ingresa un valor, se
              usará el predeterminado.
            </p>
            <input
              type="number"
              className="border p-2 w-full mb-4"
              placeholder="Duración en horas"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
            />
            <div className="flex justify-between">
              <button
                onClick={() => setModalDuracion(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={cambiarDuracion}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsCoordinador;
