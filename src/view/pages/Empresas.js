/**
 * Empresas.jsx
 * Muestra las empresas actualmente registradas en el sistema.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import supabase from '../../model/supabase';

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    consultarEmpresas();
  }, []);

  async function crearEmpresa() {
    navigate('/formularioEmpresa');
  }

  async function consultarEmpresas() {
    try {
      const { data, error } = await supabase
        .from('Empresa')
        .select(`
          id,
          nombre,
          tipo,
          provincia,
          canton,
          distrito,
          actividad,
          ContactoEmpresa:contactoempresa_empresa_id_fkey (
            id         
          )
        `);
      if (error) {
        alert('No se pudieron obtener las empresas. ' + error.message);
        return;
      }
      setEmpresas(data || []);
    } catch (error) {
      alert('Error al consultar empresas: ' + error);
    }
  }

  function editarEmpresa(id) {
    navigate(`/editarEmpresa?id=${id}`);
  }

  function verContactos(id) {
    navigate(`/contactos?id=${id}`);
  }

  async function eliminarEmpresa(id, count) {
    const confirmarEnvio = window.confirm(
      "¿Está seguro que desea eliminar esta empresa?"
    );
    if (!confirmarEnvio) return;

    if (count !== 0) {
      alert("No se puede eliminar una empresa con contactos existentes.");
      return;
    }

    try {
      const { error } = await supabase
        .from('Empresa')
        .delete()
        .eq('id', id);
      if (error) {
        alert('Error al eliminar anteproyecto: ' + error.message);
        return;
      }

      setEmpresas((prev) => prev.filter((ap) => ap.id !== id));
      alert(`La empresa fue borrada exitosamente.`);
      consultarEmpresas();
    } catch (error) {
      alert('Error al eliminar empresa:' + error);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Empresas" />

      <main className="flex-grow p-4 md:p-8">
        <button
          onClick={crearEmpresa}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          Crear Empresa
        </button>

        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full text-left border">
            <thead className="border-b bg-gray-100">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Provincia</th>
                <th className="px-4 py-2 font-medium">Cantón</th>
                <th className="px-4 py-2 font-medium">Distrito</th>
                <th className="px-4 py-2 font-medium">Actividad</th>
                <th className="px-4 py-2 font-medium">Cantidad de contactos</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((empresa) => (
                <tr key={empresa.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{empresa.nombre}</td>
                  <td className="px-4 py-2">{empresa.tipo}</td>
                  <td className="px-4 py-2">{empresa.provincia}</td>
                  <td className="px-4 py-2">{empresa.canton}</td>
                  <td className="px-4 py-2">{empresa.distrito}</td>
                  <td className="px-4 py-2">{empresa.actividad}</td>
                  <td className="px-4 py-2">{empresa.ContactoEmpresa.length}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => verContactos(empresa.id)}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Contactos
                      </button>
                      <button
                        onClick={() => editarEmpresa(empresa.id)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() =>
                          eliminarEmpresa(empresa.id, empresa.ContactoEmpresa.length)
                        }
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Empresas;
