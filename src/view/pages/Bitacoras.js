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
  
  return (
    <div>
      <Header title="Bitácoras" />
      <div className="citas-div container">
        <div className="row justify-content-center">
          <div className="cita-table col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="w-100 text-center">Bitácoras del {rol === 2 ? 'Profesor' : 'Estudiante'}</h2>
              <button
                className="btn btn-primary"
                style={{ position: 'relative', right: '20px'}}
                onClick={handleAgregarBitacora}
              >
                +
              </button>
            </div>
            <table className="w-100">
              <thead>
                <tr className="cita-row">
                  <th>Fecha de Creación</th>
                  <th>Estudiante</th>
                  <th>Profesor</th>
                  <th> </th>
                </tr>
              </thead>
              <tbody>
                {bitacoras.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>
                      No se ha encontrado ninguna bitácora relacionada.
                    </td>
                  </tr>
                ) : (
                  bitacoras.map((bitacora) => (
                    <tr className="cita-row" key={bitacora.id}>
                      <td>{bitacora.fecha_creacion}</td>
                      <td>{bitacora.Estudiante.nombreUsuario.nombre}</td>
                      <td>{bitacora.Profesor.nombreUsuario.nombre}</td>
                      <td>
                        <button
                          className="cita-btn w-50 mx-auto"
                          onClick={() => handleVerDetallesBitacora(bitacora.id)}
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
        </div>
      </div>
      <Footer />

      {/* Modal para ver los detalles de la bitácora */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Detalles de la Bitácora"
        className="modal-content-small"
        overlayClassName="modal-overlay"
      >
        <h2>Entradas de la Bitácora</h2>
        {entradas.length > 0 ? (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="w-100">
              <thead>
                <tr className="cita-row">
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th> </th>
                </tr>
              </thead>
              <tbody>
                {entradas.map((entrada) => (
                  <tr key={entrada.id}>
                    <td>{entrada.fecha}</td>
                    <td>
                      {(entrada.aprobada_prof===true) && (entrada.aprobada_est === true)
                        ? 'Aprobada'
                        : 'Pendiente'}
                    </td>
                    <td>
                      <button
                        className="cita-btn w-50 mx-auto"
                        onClick={() => handleVerDetallesEntrada(entrada.id)}
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center' }}>No hay entradas para mostrar.</p>
        )}
        <button onClick={handleCloseModal} className="btn btn-secondary mt-3">
          Cerrar
        </button>
      </Modal>
    </div>
  );
};

export default Bitacoras;
