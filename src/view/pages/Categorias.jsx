import { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { fetchCategorias, addCategoria, editCategoria, deleteCategoria } from '../../controller/Categoria';

const GestionCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [newCategoria, setNewCategoria] = useState('');
  const [editableCategoria, setEditableCategoria] = useState(null);

  useEffect(() => {
    fetchCategorias().then(data => {
      console.log(data);
      setCategorias(data);
    }).catch(console.error);
  }, []);

  const handleAddCategoria = async () => {
    addCategoria(newCategoria).then(addedCategoria => {
      setCategorias([...categorias, addedCategoria]);
      setNewCategoria('');
    }).catch(error => {
      console.error('Error al agregar categoría:', error.message);
      alert('Hubo un error al agregar la categoría.');
    });
  };

  const handleEditCategoria = async (categoria) => {
    editCategoria(categoria.nombre, categoria.categoria_id).then(() => {
      setCategorias(categorias.map(cat => cat.categoria_id === categoria.categoria_id ? categoria : cat));
      setEditableCategoria(null);
    }).catch(error => {
      console.error('Error al editar categoría:', error.message);
      alert('Hubo un error al editar la categoría.');
    });
  };

  const handleDeleteCategoria = async (categoriaId) => {
    deleteCategoria(categoriaId).then(() => {
      setCategorias(categorias.filter(cat => cat.categoria_id !== categoriaId));
    }).catch(error => {
      console.error('Error al eliminar categoría:', error.message);
      alert('Hubo un error al eliminar la categoría.');
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header title="Gestión de Categorías" />
      <div className="flex-grow container mx-auto p-4 flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 p-4">
          <div className="bg-white shadow rounded p-4 h-96 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Categorías</h2>
            <table className="min-w-full bg-white">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((categoria, index) => (
                  <tr key={categoria.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                    <td className="p-3 text-sm text-gray-700">
                      {editableCategoria?.categoria_id === categoria.categoria_id ? (
                        <input
                          type="text"
                          value={editableCategoria.nombre}
                          onChange={(e) => setEditableCategoria({ ...editableCategoria, nombre: e.target.value })}
                          className="border rounded px-2 py-1 mr-2 w-full"
                        />
                      ) : (
                        <span>{categoria.nombre}</span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      <div className="flex space-x-2">
                        {editableCategoria?.categoria_id === categoria.categoria_id ? (
                          <button
                            onClick={() => handleEditCategoria(editableCategoria)}
                            className="px-2 py-1 bg-green-500 text-white rounded"
                          >
                            <i className="fas fa-save"></i> Guardar
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditableCategoria(categoria)}
                            className="px-2 py-1 bg-blue-500 text-white rounded"
                          >
                            <i className="fas fa-edit"></i> Editar
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCategoria(categoria.categoria_id)}
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
            <h2 className="text-xl font-semibold mb-4">Agregar Categoría</h2>
            <div className="mb-4">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                id="nombre"
                value={newCategoria}
                onChange={(e) => setNewCategoria(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
            </div>
            <button
              onClick={handleAddCategoria}
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

export default GestionCategorias;