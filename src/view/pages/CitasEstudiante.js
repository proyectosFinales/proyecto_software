// CitasEstudiante.js
import React, { useState, useEffect } from 'react';
import '../styles/Citas.css';
import { supabase } from '../../model/Cliente';
import Footer from '../components/Footer';
import Header from '../components/HeaderEstudiante';

const CitasEstudiante = () => {
  const estudianteID = '67449fbe-30f6-4e80-a6eb-30ae5f9d43fa'; // Predefined student ID
  const [cita, setCita] = useState(null); // To hold the appointment details
  const [lectores, setLectores] = useState({ lector1: '', lector2: '' }); // To store the names of lecturers
  const [estudiante, setEstudiante] = useState(''); // To store the student name
  const [profesor, setProfesor] = useState(''); // To store the professor's name

  // Fetch appointment data
  useEffect(() => {
    const fetchCita = async () => {
      try {
        // Step 1: Find the anteproyecto by matching idEstudiante
        const { data: anteproyectoData, error: anteproyectoError } = await supabase
          .from('anteproyectos')
          .select('id, idEncargado') // Also select idEncargado
          .eq('idEstudiante', estudianteID); // Filter by student ID

        if (anteproyectoError) throw anteproyectoError;
        if (!anteproyectoData || anteproyectoData.length === 0) {
          throw new Error('No se encontró un anteproyecto para este estudiante.');
        }

        const anteproyectoID = anteproyectoData[0].id; // Get the anteproyecto ID
        const idEncargado = anteproyectoData[0].idEncargado; // Get the idEncargado (professor)

        // Step 2: Find the corresponding cita using anteproyectoID
        const { data: citaData, error: citaError } = await supabase
          .from('citas')
          .select('id, fecha, horaInicio, horaFin, lector1, lector2')
          .eq('anteproyectoID', anteproyectoID); // Filter by anteproyectoID

        if (citaError) throw citaError;
        if (!citaData || citaData.length === 0) {
          throw new Error('No se encontró una cita para este anteproyecto.');
        }

        const cita = citaData[0]; // Assume the student has only one appointment

        // Step 3: Fetch the student's name from the estudiantes table
        const { data: estudianteData, error: estudianteError } = await supabase
          .from('estudiantes')
          .select('nombre')
          .eq('id', estudianteID); // Filter by student ID

        if (estudianteError) throw estudianteError;

        const estudianteInfo = estudianteData.length > 0 ? estudianteData[0].nombre : 'Estudiante no encontrado';
        setEstudiante(estudianteInfo);

        // Step 4: Fetch the professor's name using idEncargado from the profesores table
        const { data: profesorData, error: profesorError } = await supabase
          .from('profesores')
          .select('nombre')
          .eq('id', idEncargado); // Filter by idEncargado

        if (profesorError) throw profesorError;

        const profesorNombre = profesorData.length > 0 ? profesorData[0].nombre : 'Profesor no encontrado';
        setProfesor(profesorNombre);

        // Step 5: Fetch lecturers' names
        const { data: profesoresData, error: profesoresError } = await supabase
          .from('profesores')
          .select('id, nombre');

        if (profesoresError) throw profesoresError;

        const lector1 = profesoresData.find((profesor) => profesor.id === cita.lector1)?.nombre || 'N/A';
        const lector2 = profesoresData.find((profesor) => profesor.id === cita.lector2)?.nombre || 'N/A';

        setLectores({ lector1, lector2 });
        setCita(cita);
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
                <p><strong>Profesor:</strong> {profesor}</p> {/* New field for Profesor */}
                <p><strong>Fecha:</strong> {cita.fecha}</p>
                <p><strong>Hora de inicio:</strong> {cita.horaInicio}</p>
                <p><strong>Hora de fin:</strong> {cita.horaFin}</p>
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
