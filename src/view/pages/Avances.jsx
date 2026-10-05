import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/HeaderProfesor';
import Footer from '../components/Footer';
import '../styles/Calendario.css';
import { fetchAvances, updateAvance, addAvance, deleteAvance } from '../../controller/Avances';
import { descargarReporteAvances } from '../../controller/DescargarPDF';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Avances = () => { 
  const { proyectoId } = useParams();
  const [avances, setAvances] = useState([]);
  const [selectedEstado, setSelectedEstado] = useState('Pasa');

  useEffect(() => {
    fetchAvances(proyectoId)
      .then(avances => setAvances(avances))
      .catch(console.error);
  }, [proyectoId]);

  const handleEstadoChange = async (avanceId, nuevoEstado) => {
    updateAvance(avanceId, nuevoEstado, proyectoId).then(() => {
      setAvances(avances.map(avance => avance.id === avanceId ? { ...avance, estado: nuevoEstado } : avance));
      toast.success('Avance actualizado correctamente');
    }).catch(err => {
      toast.error(`Ocurrió un error al actualizar el avance: ${err.message}`);
    });
  };

  const handleAgregarAvance = async () => {
    addAvance(selectedEstado, proyectoId).then(nuevoAvance => {
      setAvances([...avances, nuevoAvance]);
      toast.success('Avance agregado correctamente');
    }).catch(err => {
      toast.error(`Ocurrió un error al agregar el avance: ${err.message}`);
    });
  };

  const handleEliminarUltimoAvance = async () => {
    const ultimoAvance = avances[avances.length - 1];
    deleteAvance(ultimoAvance.id, proyectoId).then(() => {
      setAvances(avances.slice(0, -1));
      toast.success('Avance eliminado correctamente');
    }).catch(err => {
      toast.error(`Ocurrió un error al eliminar el avance: ${err.message}`);
    });
  };

  return (
    <div className='flex flex-col min-h-screen'>
      <Header title="Avances de Estudiantes" />
      <div className="flex-grow container mx-auto p-4">
        <div className="overflow-x-auto">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => descargarReporteAvances(avances)}
              style={{ backgroundColor: '#4F46E5' }}
              className="px-4 py-2 text-white rounded hover:opacity-90"
            >
              Reporte
            </button>
          </div>
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Número</th>
                <th className="px-4 py-2 border-b">Estado</th>
                <th className="px-4 py-2 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {avances.map((avance, index) => (
                <tr key={avance.id} className="odd:bg-gray-100 even:bg-white">
                  <td className="px-4 py-2 border-b">{index + 1}</td>
                  <td className="px-4 py-2 border-b">{avance.estado}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      disabled={avance.estado === 'Pasa'}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-500"
                      onClick={() => handleEstadoChange(avance.id, 'Pasa')}
                    >
                      Pasa
                    </button>
                    <button
                      disabled={avance.estado === 'A Mejorar'}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-500"
                      onClick={() => handleEstadoChange(avance.id, 'A Mejorar')}
                    >
                      A Mejorar
                    </button>
                    <button
                      disabled={avance.estado === 'No Pasa'}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500"
                      onClick={() => handleEstadoChange(avance.id, 'No Pasa')}
                    >
                      No Pasa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Agregar Nuevo Avance</h3>
          <div className="mb-4">
            <select
              name="estado"
              className="w-full p-2 border border-gray-300 rounded"
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
            >
              <option value="Pasa">Pasa</option>
              <option value="A Mejorar">A Mejorar</option>
              <option value="No Pasa">No Pasa</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleAgregarAvance}
            >
              Agregar Avance
            </button>
            {avances.length > 3 && (
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleEliminarUltimoAvance}
              >
                Eliminar Último Avance
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Avances;