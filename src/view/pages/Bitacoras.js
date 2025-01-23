import React, { useState, useEffect } from 'react';
import '../styles/Citas.css';
import Footer from '../components/Footer';
import Header from '../components/HeaderProfesor';
import supabase from '../../model/supabase';
import Modal from 'react-modal';
import '../styles/Bitacoras.css';
import { useNavigate } from 'react-router-dom';

// Configuración de React Modal
Modal.setAppElement('#root');

const Bitacoras = () => {
  const usuarioId = sessionStorage.getItem('token');
  const [bitacoras, setBitacoras] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [entradas, setEntradas] = useState([]);
  const [rol, setRol] = useState(0);
  const [entradaBitacoraId, setEntradaBitacoraId] = useState(0);

  useEffect(() => {
    const fetchBitacoras = async () => {
      try {
        // Obtener el rol del usuario
        const { data: rolUsuario, error: rolError } = await supabase
          .from('Usuario')
          .select('rol')
          .eq('id', usuarioId)
          .single();

        if (rolError || !rolUsuario) {
          throw new Error('Error al obtener el rol del usuario');
        }

        setRol(rolUsuario.rol);

        let bitacorasData = [];

        if (rolUsuario.rol === 2) {
          // Caso de profesor
          const { data: profesorData, error: profesorError } = await supabase
            .from('Profesor')
            .select('profesor_id')
            .eq('id_usuario', usuarioId)
            .single();

          if (profesorError || !profesorData) {
            throw new Error('Error al obtener el ID del profesor');
          }

          const { data, error } = await supabase
            .from('Bitacora')
            .select(`
              id, 
              fecha_creacion, 
              estudiante_id, 
              profesor_id,
              Estudiante:estudiante_id (
                nombre
                Usuario:id_usuario (
                  nombre
                )
              ),
              Profesor:profesor_id (
                nombre
                Usuario:id_usuario (
                  nombre
                )
              )
            `)
            .eq('profesor_id', profesorData.profesor_id);

          if (error) {
            throw new Error('Error al obtener las bitácoras para el profesor');
          }

          bitacorasData = data;
        } else if (rolUsuario.rol === 3) {
          // Caso de estudiante
          const { data: estudianteData, error: estudianteError } = await supabase
            .from('Estudiante')
            .select('estudiante_id')
            .eq('id_usuario', usuarioId)
            .single();

          if (estudianteError || !estudianteData) {
            throw new Error('Error al obtener el ID del estudiante');
          }

          const { data, error } = await supabase
            .from('Bitacora')
            .select(`
              id, 
              fecha_creacion, 
              estudiante_id, 
              profesor_id,
              Estudiante:estudiante_id (
                nombre
                Usuario:id_usuario (
                  nombre
                )
              ),
              Profesor:profesor_id (
                nombre
                Usuario:id_usuario (
                  nombre
                )
              )
            `)
            .eq('estudiante_id', estudianteData.estudiante_id);

          if (error) {
            throw new Error('Error al obtener las bitácoras para el estudiante');
          }

          bitacorasData = data;
        }

        setBitacoras(bitacorasData);
      } catch (error) {
        console.error('Error fetching bitacoras data:', error);
      }
    };

    fetchBitacoras();
  }, [usuarioId]);

  const fetchEntradas = async (idBitacora) => {
    try {
      const { data, error } = await supabase
        .from('Entrada')
        .select(`
          id,
          bitacora_id,
          fecha, 
          contenido, 
          aprobada_prof,
          aprobada_est
        `)
        .eq('bitacora_id', idBitacora);

      if (error) throw error;
      setEntradas(data);
    } catch (error) {
      console.error('Error fetching entradas data:', error);
    }
  };

  const handleVerDetallesBitacora = async (id) => {
    await fetchEntradas(id);
    setEntradaBitacoraId(id);
    setModalIsOpen(true);
  };

  const handleVerDetallesEntrada = (id) => {
    if (rol === 2) {
      window.location.href = `/entrada?id=${id}&esProfesor=true`;
    }else{
      window.location.href = `/entrada?id=${id}&esProfesor=false`;
    }
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setEntradas([]);
  };

  const handleAgregarBitacora = async () => {
    try {
      if (rol === 2) {
        // Caso de profesor
        const { data: profesorData, error: profesorError } = await supabase
          .from('Profesor')
          .select('profesor_id')
          .eq('id_usuario', usuarioId)
          .single();
  
        if (profesorError || !profesorData) {
          throw new Error('Error al obtener el ID del profesor');
        }
  
        // Redireccionar pasando ambos IDs como parámetros
        window.location.href = `/agregarBitacora?profesor_id=${profesorData.profesor_id}&estudiante_id=0`;
      
      } else if (rol === 3) {
        // Caso de estudiante
        const { data: estudianteData, error: estudianteError } = await supabase
          .from('Estudiante')
          .select('estudiante_id')
          .eq('id_usuario', usuarioId)
          .single();
  
        if (estudianteError || !estudianteData) {
          throw new Error('Error al obtener el ID del estudiante');
        }
  
        // Redireccionar pasando ambos IDs como parámetros
        window.location.href = `/agregarBitacora?profesor_id=0&estudiante_id=${estudianteData.estudiante_id}`;
      }
    } catch (error) {
      console.error('Error al agregar la bitácora:', error);
    }
  };

  const handleAgregarEntrada = (id) => {
    window.location.href = `/agregarEntrada?id=${entradaBitacoraId}`;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title="Bitácoras" />
      <div className="flex-grow p-2 sm:p-4 container mx-auto">
        {/* Header con título y botón de agregar */}
        <div className="flex justify-between items-center mb-6 px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Bitácoras del {rol === 2 ? 'Profesor' : 'Estudiante'}
          </h2>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transition-colors duration-200"
            onClick={handleAgregarBitacora}
          >
            +
          </button>
        </div>

        {/* Contenedor con scroll horizontal para tablas responsivas */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Fecha de Creación
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Estudiante
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Profesor
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bitacoras.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                    No se ha encontrado ninguna bitácora relacionada.
                  </td>
                </tr>
              ) : (
                bitacoras.map((bitacora) => (
                  <tr 
                    key={bitacora.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {bitacora.fecha_creacion}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {bitacora.Estudiante.nombreUsuario.nombre}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {bitacora.Profesor.nombreUsuario.nombre}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <button
                        onClick={() => handleVerDetallesBitacora(bitacora.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de detalles */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={handleCloseModal}
          contentLabel="Detalles de la Bitácora"
          className="mx-auto w-11/12 max-w-4xl bg-white rounded-lg shadow-xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        >
          <div className="flex flex-col h-full">
            {/* Encabezado del modal */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Entradas de la Bitácora</h2>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center text-xl shadow transition-colors duration-200"
                onClick={handleAgregarEntrada}
              >
                +
              </button>
            </div>

            {/* Contenido del modal con scroll */}
            <div className="overflow-x-auto">
              {entradas.length > 0 ? (
                <table className="w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contenido
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entradas.map((entrada) => (
                      <tr 
                        key={entrada.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {entrada.fecha}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {entrada.contenido.slice(0, 100)}...
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-medium whitespace-nowrap">
                          <button
                            onClick={() => handleVerDetallesEntrada(entrada.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No hay entradas para mostrar.
                </p>
              )}
            </div>

            {/* Footer del modal */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      </div>
      <Footer />
    </div>
  );
};

export default Bitacoras;
