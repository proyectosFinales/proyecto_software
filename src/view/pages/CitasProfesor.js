import React, { useState, useEffect } from 'react';
import '../styles/Citas.css';
import { supabase } from '../../model/Cliente';
import Footer from '../components/Footer';
import Header from '../components/HeaderProfesor';

const CitasProfesor = () => {
  const profesorID = localStorage.getItem('token'); // Assume professor token is stored here
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
        // Search for appointments where profesorID matches idEncargado
        const { data: anteproyectoData, error: anteproyectoError } = await supabase
          .from('anteproyectos')
          .select('id, idEncargado, idEstudiante')
          .eq('idEncargado', profesorID);
  
        if (anteproyectoError) throw anteproyectoError;
  
        if (anteproyectoData && anteproyectoData.length > 0) {
          const anteproyectoID = anteproyectoData[0].id;
          const estudianteID = anteproyectoData[0].idEstudiante;
  
          // Find the appointment based on the anteproyectoID
          const { data: citaData, error: citaError } = await supabase
            .from('citas')
            .select('id, fecha, horaInicio, horaFin, lector1, lector2')
            .eq('anteproyectoID', anteproyectoID);
  
          if (citaError) throw citaError;
  
          if (!citaData || citaData.length === 0) {
            throw new Error('No se encontró una cita para este anteproyecto.');
          }
  
          const cita = citaData[0];
  
          // Fetch student and professor data
          const { data: estudianteData, error: estudianteError } = await supabase
            .from('estudiantes')
            .select('nombre')
            .eq('id', estudianteID);
  
          if (estudianteError) throw estudianteError;
  
          const estudianteNombre = estudianteData.length > 0 ? estudianteData[0].nombre : 'Estudiante no encontrado';
          setEstudiante(estudianteNombre);
  
          const { data: profesorData, error: profesorError } = await supabase
            .from('profesores')
            .select('nombre')
            .eq('id', profesorID);
  
          if (profesorError) throw profesorError;
  
          const profesorNombre = profesorData.length > 0 ? profesorData[0].nombre : 'Profesor no encontrado';
          setProfesor(profesorNombre);
  
          const { data: profesoresData, error: profesoresError } = await supabase
            .from('profesores')
            .select('id, nombre');
  
          if (profesoresError) throw profesoresError;
  
          const lector1 = profesoresData.find((profesor) => profesor.id === cita.lector1)?.nombre || 'N/A';
          const lector2 = profesoresData.find((profesor) => profesor.id === cita.lector2)?.nombre || 'N/A';
  
          setLectores({ lector1, lector2 });
          setCita(cita);
  
          return; // End here if the professor is in charge
        }
  
        // Search for appointments where profesorID matches lector1 or lector2
        const { data: citaData, error: lectorError } = await supabase
          .from('citas')
          .select('id, anteproyectoID, fecha, horaInicio, horaFin, lector1, lector2')
          .or(`lector1.eq.${profesorID},lector2.eq.${profesorID}`);
  
        if (lectorError) throw lectorError;
  
        if (citaData && citaData.length > 0) {
          const cita = citaData[0];
          const anteproyectoID = cita.anteproyectoID;
  
          // Fetch the student and professor based on anteproyectoID
          const { data: anteproyectoData, error: anteproyectoError } = await supabase
            .from('anteproyectos')
            .select('idEstudiante, idEncargado')
            .eq('id', anteproyectoID);
  
          if (anteproyectoError) throw anteproyectoError;
  
          if (!anteproyectoData || anteproyectoData.length === 0) {
            throw new Error('No se encontró un anteproyecto para esta cita.');
          }
  
          const estudianteID = anteproyectoData[0].idEstudiante;
          const idEncargado = anteproyectoData[0].idEncargado;
  
          // Fetch student, professor in charge, and lector names
          const { data: estudianteData, error: estudianteError } = await supabase
            .from('estudiantes')
            .select('nombre')
            .eq('id', estudianteID);
  
          if (estudianteError) throw estudianteError;
  
          const estudianteNombre = estudianteData.length > 0 ? estudianteData[0].nombre : 'Estudiante no encontrado';
          setEstudiante(estudianteNombre);
  
          const { data: profesorData, error: profesorError } = await supabase
            .from('profesores')
            .select('nombre')
            .eq('id', idEncargado);
  
          if (profesorError) throw profesorError;
  
          const profesorNombre = profesorData.length > 0 ? profesorData[0].nombre : 'Profesor no encontrado';
          setProfesor(profesorNombre);
  
          const { data: profesoresData, error: profesoresError } = await supabase
            .from('profesores')
            .select('id, nombre');
  
          if (profesoresError) throw profesoresError;
  
          const lector1 = profesoresData.find((profesor) => profesor.id === cita.lector1)?.nombre || 'N/A';
          const lector2 = profesoresData.find((profesor) => profesor.id === cita.lector2)?.nombre || 'N/A';
  
          setLectores({ lector1, lector2 });
          setCita(cita);
        } else {
          throw new Error('No se encontraron citas para este profesor.');
        }
      } catch (error) {
        console.error('Error fetching appointment data:', error);
      }
    };
  
    fetchCita();
  }, [profesorID]);
  

  return (
    <div>
      <Header title="Citas" />
      <div className="citas-div container">
        <div className="row justify-content-center">
          <div className="col-8">
            <h2 className="w-100 text-center">Información de la cita del profesor</h2>
            {cita ? (
              <div className="cita-info">
                <p><strong>Estudiante:</strong> {estudiante}</p>
                <p><strong>Profesor:</strong> {profesor}</p>
                <p><strong>Fecha:</strong> {cita.fecha}</p>
                <p><strong>Hora de inicio:</strong> {formatTime(cita.horaInicio)}</p>
                <p><strong>Hora de fin:</strong> {formatTime(cita.horaFin)}</p>
                <p><strong>Lector 1:</strong> {lectores.lector1}</p>
                <p><strong>Lector 2:</strong> {lectores.lector2}</p>
              </div>
            ) : (
              <p>No se ha encontrado ninguna cita relacionada con este profesor.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CitasProfesor;
