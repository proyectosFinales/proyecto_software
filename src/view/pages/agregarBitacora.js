/**
 * AgregarUsuario.jsx
 * Permite agregar estudiantes o profesores manualmente.
 * Llama a signUpNewUser(...) o registroProfesor(...).
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaMapMarked } from 'react-icons/fa';
import HeaderProfesor from '../components/HeaderProfesor';
import HeaderEstudiante from '../components/HeaderEstudiante';
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
    const usuarioId = sessionStorage.getItem('token');
    const [rol, setRol] = useState(0);

    // En caso de profe, ver que estudiantes estan asociados a el
    // En caso de estudiante, ver que profesor esta asociado a el
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
              id,
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
    <div className="flex flex-col min-h-screen bg-gray-100">
      {rol === 2 ? <HeaderProfesor title="Agregar Bitácora" /> :
        <HeaderEstudiante title="Agregar Bitácora" />}
      <div className="flex-grow flex flex-col items-center p-6">
        <form className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold mb-2">Nueva Bitácora</h2>
          <div className="flex flex-col">
            <label className="mb-1">Nombre del estudiante</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2"
              name="estudiante"
              value={bitacora.estudiante}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1">Profesor</label>
            <input
              type="email"
              className="border border-gray-300 rounded px-3 py-2"
              name="correo"
              value={bitacora.profesor}
              readOnly
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1">Proyecto</label>
            <select
              className="border border-gray-300 rounded px-3 py-2"
              name="proyecto"
              value={bitacora.proyecto}
              onChange={handleInputChange}
            >
              <option value="">Proyecto nulo</option>
              {proyectos.map((proyecto, index) => (
                <option key={proyecto.id} value={proyecto}>
                  {proyecto.Anteproyecto.Empresa.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={handleLimpiarEntradas}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleAgregarBitacora}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
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
