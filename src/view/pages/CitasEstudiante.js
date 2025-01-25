/**
 * CitasEstudiante.jsx
 * Vista para que un Estudiante vea la cita asignada a su anteproyecto/proyecto.
 */
import React, { useState, useEffect } from 'react';
import '../styles/Citas.css';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderEstudiante';

const CitasEstudiante = () => {
  const estudianteID = sessionStorage.getItem('token');
  const [cita, setCita] = useState(null);
  const [lectores, setLectores] = useState({ lector1: '', lector2: '' });
  const [estudiante, setEstudiante] = useState('');
  const [profesor, setProfesor] = useState('');

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchCita = async () => {
      try {
        // 1. Buscar anteproyecto de este estudiante
        const { data: anteData, error: anteError } = await supabase
          .from('Anteproyecto')
          .select('id, estudiante_id, estado, /* si usas... */')
          .eq('estudiante_id', estudianteID)
          .eq('semestre_id', 1); // Ajusta si usas semestres

        if (anteError) throw anteError;
        if (!anteData || anteData.length === 0) {
          throw new Error('No se encontró un anteproyecto para este estudiante.');
        }

        const anteproyectoID = anteData[0].id;
        // 2. Buscar la cita con anteproyecto_id
        const { data: citaData, error: citaError } = await supabase
          .from('Cita')
          .select('cita_id, fecha, hora_inicio, hora_fin, lector1, lector2')
          .eq('anteproyecto_id', anteproyectoID)
          .eq('semestre_id', 1);

        if (citaError) throw citaError;
        if (!citaData || citaData.length === 0) {
          throw new Error('No se encontró una cita para este anteproyecto.');
        }

        const citaFound = citaData[0];

        // 3. Info del Estudiante
        const { data: estData, error: estError } = await supabase
          .from('Estudiante')
          .select('estudiante_id, nombre')
          .eq('estudiante_id', estudianteID)
          .single();
        if (estError) throw estError;
        setEstudiante(estData?.nombre || 'Estudiante no encontrado');

        // 4. Info del "profesor asesor" si deseas, 
        //    o si tienes un Proyecto con p.profesor_id, etc.
        //    Ejemplo: Revisar si usas "Estudiante.asesor" o "Proyecto.profesor_id".
        //    Aquí se deja un placeholder:
        setProfesor('Profesor no consultado');

        // 5. Buscar todos los profesores, para poder extraer lector1/lector2
        const { data: profData, error: profError } = await supabase
          .from('Profesor')
          .select('profesor_id, nombre');
        if (profError) throw profError;

        const lector1 = profData.find((p) => p.profesor_id === citaFound.lector1)?.nombre || 'N/A';
        const lector2 = profData.find((p) => p.profesor_id === citaFound.lector2)?.nombre || 'N/A';

        setLectores({ lector1, lector2 });
        setCita(citaFound);

      } catch (error) {
        console.error('Error fetching student appointment data:', error);
      }
    };

    fetchCita();
  }, [estudianteID]);

  return (
    <div>
      <Header title="Citas" />
      <div className="citas-div container">
        <div className="row justify-content-center">
          <div className="col-8">
            <h2 className="w-100 text-center">Información de la cita del estudiante</h2>
            {cita ? (
              <div className="cita-info">
                <p><strong>Estudiante:</strong> {estudiante}</p>
                <p><strong>Profesor:</strong> {profesor}</p>
                <p><strong>Fecha:</strong> {cita.fecha}</p>
                <p><strong>Hora de inicio:</strong> {formatTime(cita.hora_inicio)}</p>
                <p><strong>Hora de fin:</strong> {formatTime(cita.hora_fin)}</p>
                <p><strong>Lector 1:</strong> {lectores.lector1}</p>
                <p><strong>Lector 2:</strong> {lectores.lector2}</p>
              </div>
            ) : (
              <p>No se ha encontrado ninguna cita para este estudiante.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CitasEstudiante;
