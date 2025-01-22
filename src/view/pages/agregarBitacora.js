/**
 * AgregarUsuario.jsx
 * Permite agregar estudiantes o profesores manualmente.
 * Llama a signUpNewUser(...) o registroProfesor(...).
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaMapMarked } from 'react-icons/fa';
import '../styles/AgregarUsuario.css';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import supabase from '../../model/supabase';

const AgregarBitacora = () => {
    const [bitacora, setBitacora] = useState({
        estudiante: '',
        profesor: '',
        proyecto: null,
    });

    const navigate = useNavigate();

    const location = useLocation();

    const getQueryParams = (query) => {
    return Object.fromEntries(new URLSearchParams(query));
    };

    const queryParams = getQueryParams(location.search);
    let profesorId = queryParams.profesor_id;
    let estudianteId = queryParams.estudiante_id;

    const [proyectos, setProyectos] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [profesor, setProfesor] = useState('');
    const [estudiante, setEstudiante] = useState('');

    // En caso de profe, ver que estudiantes estan asociados a el
    // En caso de estudiante, ver que profesor esta asociado a el
  useEffect(() => {
    const fetchBitacoras = async () => {
      try {

        if (profesorId !== "0") {
            const { data: estudiantes, error } = await supabase
            .from('Estudiante')
            .select(`
              id_usuario,
              estudiante_id,
              Usuario:id_usuario (
                nombre
              )
            `)
            .eq('asesor', profesorId);

            if (error) {
                throw new Error('Error al obtener los estudiantes');
            }

            setEstudiantes(estudiantes);

            const { data: profesor, error: profesorError } = await supabase
            .from('Profesor')
            .select(`
              id_usuario,
              Usuario:id_usuario (
                nombre
              )
            `)
            .eq('profesor_id', profesorId);

            if (profesorError) {
                throw new Error('Error al obtener el profesor');
            }

            setBitacora((prev) => ({
                ...prev,
                profesor: profesor[0].Usuario.nombre,
            }));

            setProfesor(profesorId);
        }

        if (estudianteId !== "0") {
            const { data: estudiante, error } = await supabase
            .from('Estudiante')
            .select(`
                id_usuario,
                asesor,
                Usuario:id_usuario (
                    nombre
                ),
                Profesor:Profesor!estudiante_asesor_fkey (
                    id_usuario,
                    Usuario:id_usuario (
                        nombre
                    )
                )
            `)
            .eq('estudiante_id', estudianteId);

            setProfesor(estudiante[0].asesor);

            if (error) {
                throw new Error('Error al obtener el profesor');
            }

            setBitacora((prev) => ({
                ...prev,
                profesor: estudiante[0].Profesor.Usuario.nombre,
                estudiante: estudiante[0].Usuario.nombre,
            }));

            setEstudiante(estudianteId);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchBitacoras();
  }, []);

  useEffect(() => {
    const fetchProyectos = async () => {
      try {

          const { data: proyectos, error } = await supabase
            .from('Proyecto')
            .select(`
              estado,
              anteproyecto_id,
              Anteproyecto:anteproyecto_id (
                empresa_id,
                Empresa:empresa_id (
                  nombre
                )
              )
            `)
            .eq('estudiante_id', estudiante)
            .eq('profesor_id', profesor);

          if (error) {
            throw new Error('Error al obtener los proyectos');
          }

          setProyectos(proyectos);

      } catch (error) {
        console.error('Error fetching proyectos data:', error);
      }
    };

    fetchProyectos();
  }, [estudiante, profesor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBitacora((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'estudiante') {
        setEstudiante(e.target.selectedOptions[0].getAttribute('data-id'));
    }
  };

  const handleAgregarBitacora = async () => {
      try{
        const { data, error } = await supabase
        .from('Bitacora')
        .insert([
            {
                estudiante_id: estudiante,
                profesor_id: profesor,
                proyecto_id: bitacora.proyecto === '' ? null : bitacora.proyecto,
                fecha_creacion: new Date(),
            }
        ])
        .select();

      if (error) {
        throw new Error('Error al agregar la bitacora');
      }

        navigate('/bitacoras');


      }catch(error){
          console.log(error);
      }

  }

  const handleLimpiarEntradas = () => {
    setBitacora((prev) => ({
      proyecto: '',
    }));
  };

  return (
    <div className="agregar-usuario-container">
      <Header />
      <div className="form-container">
        <button
          className="btn-back-addUser"
          onClick={() => navigate("/bitacoras")}
        >
          Volver
        </button>
        <h2>Agregar Bitacora</h2>

        <form className="form-addUser">
          <label>Estudiante:</label>
          <div className="input-container-add">
            <FaUser className="icon-add" />
            {profesorId !== "0" ? (
                // Mostrar el select si profesorId es diferente de "0"
                <select
                name="estudiante"
                className="input-field"
                value={bitacora.estudiante || ''}
                onChange={handleInputChange}
                required
                >
                <option value="">Seleccione un estudiante</option>
                {estudiantes.map((estudiante) => (
                    <option key={estudiante.estudiante_id} value={estudiante.Usuario.nombre} data-id={estudiante.estudiante_id}>
                    {estudiante.Usuario.nombre}
                    </option>
                ))}
                </select>
            ) : (
                // Mostrar solo el nombre del estudiante si profesorId es "0"
                <input
                type="text"
                name="estudiante"
                className="input-field"
                value={bitacora.estudiante}
                readOnly
                />
            )}
        </div>


          <label>Profesor:</label>
          <div className="input-container-add">
            <FaEnvelope className="icon-add" />
            <input
              type="email"
              name="correo"
              className="input-field"
              value={bitacora.profesor}
              readOnly
            />
          </div>

          <label>Proyecto:</label>
          <div className="input-container-add">
            <FaMapMarked className="icon-sede" />
            <select
                name="proyecto"
                className="sede-dropdown"
                value={bitacora.proyecto}
                onChange={handleInputChange}
                required
            >
            <option value=''>Proyecto nulo</option>
            {proyectos.map((proyecto, index) => (
            <option key={index} value={proyecto}>
                {proyecto.Anteproyecto.Empresa.nombre}
            </option>
            ))}
            </select>
        </div>


          <div className="buttons">
            <button type="button" onClick={handleLimpiarEntradas}>
              Limpiar
            </button>
            <button type="button" onClick={handleAgregarBitacora}>
              Agregar Bitacora
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AgregarBitacora;
