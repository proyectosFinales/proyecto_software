/**
 * Empresas.jsx
 * Muestra las empresas actualmente registradas en el sistema.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/AnteproyectosCoordinador.module.css';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import styles2 from '../styles/table.module.css';

const Empresas = () => {
  const [contactos, setContactos] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const getQueryParam = (param) => {
    const params = new URLSearchParams(location.search);
    return params.get(param);
  };

  useEffect(() => {
    const id = getQueryParam('id');
    if (id) {
      consultarContactos(id);
    }
  }, [location]);

  async function crearContacto() {
    const id = getQueryParam('id')
    navigate(`/crearContacto?id=${id}`);
  }

  async function consultarContactos(id) {
    try {
      const { data, error } = await supabase
        .from('ContactoEmpresa')
        .select(`
          id,
          nombre,
          empresa_id,
          departamento,
          correo,
          telefono,
          AnteproyectoContacto:anteproyectocontacto_contacto_id_fkey (
            id
          ),
          RecursosHumanos:AnteproyectoContacto_rrhh_id_fkey (
            id
          )
        `)
        .eq("empresa_id",id);
      if (error) {
        alert('No se pudieron obtener los contactos. ' + error.message);
        return;
      }
      setContactos(data || []);
    } catch (error) {
      alert('Error al consultar contactos: ' + error);
    }
  }

  function editarContacto(id) {
    navigate(`/editarContacto?id=${id}`);
  }

  function handleGoBack(){
    navigate(-1);
  }

  async function eliminarContacto(id,count) {
      const confirmarEnvio = window.confirm(
        "¿Está seguro que desea eliminar este contacto?"
      );
      if (!confirmarEnvio) return;
  
      if (count !== 0) {
        alert("No se puede eliminar un contacto afiliado a algún anteproyecto.");
        return;
      }
      try {
        const { error } = await supabase
          .from('ContactoEmpresa')
          .delete()
          .eq('id', id);
        if (error) {
          alert('Error al eliminar contacto: ' + error.message);
          return;
        }
  
        setContactos((prev) => prev.filter((ap) => ap.id !== id));
        alert(`El contacto fue borrado exitosamente.`);
      } catch (error) {
        alert('Error al eliminar contacto:' + error);
      }
    }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Contactos" />
      <div>
        <main className="flex-grow p-4 md:p-8">
          <button
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
            onClick={() => crearContacto()}
          >
            Crear Contacto
          </button>
          <button
          onClick={handleGoBack}
          className="mb-4 px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
        >
          Volver
        </button>
          <div className="overflow-x-auto bg-white shadow rounded">
            <table className="min-w-full text-left border">
              <thead className="border-b bg-gray-100">
                <tr>
                  <th className="px-4 py-2 font-medium">Nombre</th>
                  <th className="px-4 py-2 font-medium">Puesto</th>
                  <th className="px-4 py-2 font-medium">Correo</th>
                  <th className="px-4 py-2 font-medium">Teléfono</th>
                  <th className="px-4 py-2 font-medium">Proyectos asesorados</th>
                  <th className="px-4 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {contactos.map((contacto) => (
                  <tr key={contacto.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{contacto.nombre}</td>
                    <td className="px-4 py-2">{contacto.departamento}</td>
                    <td className="px-4 py-2">{contacto.correo}</td>
                    <td className="px-4 py-2">{contacto.telefono}</td>
                    <td className="px-4 py-2">{(contacto.AnteproyectoContacto.length)+(contacto.RecursosHumanos.length)}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editarContacto(contacto.id,contacto.empresa_id)}
                          className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Editar
                        </button>
                        
                        <button
                          onClick={() =>
                            eliminarContacto(contacto.id,((contacto.AnteproyectoContacto.length)+(contacto.RecursosHumanos.length)))
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
      </div>
      <Footer />
    </div>
  );
};

export default Empresas;
