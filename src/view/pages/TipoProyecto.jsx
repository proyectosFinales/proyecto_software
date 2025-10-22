import { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { fetchTiposProyectos, addTipoProyecto, editTipoProyecto, deleteTipoProyecto } from '../../controller/TipoProyecto';

const GestionTiposProyectos = () => {
  const [tiposProyectos, setTiposProyectos] = useState([]);
  const [newTipoProyecto, setNewTipoProyecto] = useState('');
  const [editableTipoProyecto, setEditableTipoProyecto] = useState(null);

  useEffect(() => {
    fetchTiposProyectos().then(data => {
      setTiposProyectos(data);
    }).catch(console.error);
  }, []);

  const handleAddTipoProyecto= async () => {
    addTipoProyecto(newTipoProyecto).then(addedTipoProyecto => {
      setTiposProyectos([...tiposProyectos, addedTipoProyecto]);
      setNewTipoProyecto('');
    }).catch(error => {
      console.error('Error al agregar el tipo de proyecto:', error.message);
      alert('Hubo un error al agregar el tipo de proyecto.');
    });
  };

  const handleEditTipoProyecto = async (tipoProyecto) => {
    editTipoProyecto(tipoProyecto.nombre, tipoProyecto.id).then(() => {
      setTiposProyectos(tiposProyectos.map(cat => cat.id === tipoProyecto.id ? tipoProyecto : cat));
      setEditableTipoProyecto(null);
    }).catch(error => {
      console.error('Error al editar el tipo de proyecto:', error.message);
      alert('Hubo un error al editar el tipo de proyecto.');
    });
  };

  const handleDeleteTipoProyecto = async (tipoProyectoId) => {
    deleteTipoProyecto(tipoProyectoId).then(() => {
      setTiposProyectos(tiposProyectos.filter(cat => cat.id !== tipoProyectoId));
    }).catch(error => {
      console.error('Error al eliminar el tipo de proyecto:', error.message);
      alert('Hubo un error al eliminar el tipo de proyecto.');
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header title="Gestión de Tipos de Proyectos" />
      <div className="flex-grow container mx-auto p-4 flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 p-4">
          <div className="bg-white shadow rounded p-4 h-96 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Tipos de Proyectos</h2>
            <table className="min-w-full bg-white">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tiposProyectos.map((tipoProyecto, index) => (
                  <tr key={tipoProyecto.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                    <td className="p-3 text-sm text-gray-700">
                      {editableTipoProyecto?.id === tipoProyecto.id ? (
                        <input
                          type="text"
                          value={editableTipoProyecto.nombre}
                          onChange={(e) => setEditableTipoProyecto({ ...editableTipoProyecto, nombre: e.target.value })}
                          className="border rounded px-2 py-1 mr-2 w-full"
                        />
                      ) : (
                        <span>{tipoProyecto.nombre}</span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      <div className="flex space-x-2">
                        {editableTipoProyecto?.id === tipoProyecto.id ? (
                          <button
                            onClick={() => handleEditTipoProyecto(editableTipoProyecto)}
                            className="px-2 py-1 bg-green-500 text-white rounded"
                          >
                            <i className="fas fa-save"></i> Guardar
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditableTipoProyecto(tipoProyecto)}
                            className="px-2 py-1 bg-blue-500 text-white rounded"
                          >
                            <i className="fas fa-edit"></i> Editar
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTipoProyecto(tipoProyecto.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded"
                        >
                          <i className="fas fa-trash"></i> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-full lg:w-1/2 p-4">
          <div className="bg-white shadow rounded p-4">
            <h2 className="text-xl font-semibold mb-4">Agregar Tipo de Proyecto</h2>
            <div className="mb-4">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                id="nombre"
                value={newTipoProyecto}
                onChange={(e) => setNewTipoProyecto(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
            </div>
            <button
              onClick={handleAddTipoProyecto}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GestionTiposProyectos;