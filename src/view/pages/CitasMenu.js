import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/MenuPrincipal.module.css';
import Header from '../components/HeaderCoordinador'
import Footer from '../components/Footer'
import SettingsCoordinador from '../components/SettingsCoordinador';
import { supabase } from '../../model/Cliente';

const CitasMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const assignLecturersToAppointments = async () => {
    try {
      // 1. Fetch all appointments (`citas`) where `semestreActual = 1`
      const { data: appointments, error: appointmentError } = await supabase
        .from('citas')
        .select('id, anteproyectoID, lector1, lector2')
        .eq('semestreActual', 1);
      if (appointmentError) throw appointmentError;

      // 2. Fetch all students with an `anteproyecto` in the current semester that don’t have an appointment
      const { data: allAnteproyectos, error: anteproyectosError } = await supabase
        .from('anteproyectos')
        .select('id, idEstudiante')
        .eq('semestreActual', 1);
      if (anteproyectosError) throw anteproyectosError;

      const assignedAnteproyectoIds = new Set(appointments.map(app => app.anteproyectoID));
      const unassignedAnteproyectos = allAnteproyectos.filter(anteproyecto => !assignedAnteproyectoIds.has(anteproyecto.id));

      // 3. Loop through each appointment and attempt to assign two lecturers
      for (const appointment of appointments) {
        // 4. Fetch available professors for this appointment
        const { data: availableProfessors, error: professorsError } = await supabase
          .from('disponibilidadCitas')
          .select('profesorID')
          .eq('citaID', appointment.id)
          .eq('disponible', 1);
        if (professorsError) throw professorsError;

        const availableProfessorIds = availableProfessors.map(prof => prof.profesorID);

        // 5. Loop through unassigned students to find one with two eligible lecturers
        let selectedStudent = null;
        let selectedLecturers = [];

        for (const studentAnteproyecto of unassignedAnteproyectos) {
          // Query to check professors who have been `idEncargado` for this student in any `anteproyecto`
          const { data: previousEncargados, error: encargadosError } = await supabase
            .from('anteproyectos')
            .select('idEncargado')
            .eq('idEstudiante', studentAnteproyecto.idEstudiante);
          if (encargadosError) throw encargadosError;

          const previousEncargadoIds = new Set(previousEncargados.map(enc => enc.idEncargado));

          // Fetch all anteproyecto IDs for this student to check for previous lecturer assignments
          const { data: studentAnteproyectoIds, error: anteproyectoIdsError } = await supabase
            .from('anteproyectos')
            .select('id')
            .eq('idEstudiante', studentAnteproyecto.idEstudiante);
          if (anteproyectoIdsError) throw anteproyectoIdsError;

          const anteproyectoIds = studentAnteproyectoIds.map(anteproyecto => anteproyecto.id);

          // Query to check professors who have previously been lecturers for any of the student’s anteproyectos
          const { data: previousLectures, error: lectureError } = await supabase
            .from('citas')
            .select('lector1, lector2')
            .in('anteproyectoID', anteproyectoIds);
          if (lectureError) throw lectureError;

          const previousLecturerIds = new Set(
            previousLectures.flatMap(lecture => [lecture.lector1, lecture.lector2])
          );

          // Filter eligible professors who have not been the student's `idEncargado` and not previously lecturers
          const eligibleProfessors = availableProfessorIds.filter(professorId =>
            !previousEncargadoIds.has(professorId) &&
            !previousLecturerIds.has(professorId)
          );

          if (eligibleProfessors.length >= 2) {
            selectedStudent = studentAnteproyecto;
            // Randomly select two from eligible professors
            selectedLecturers = eligibleProfessors.sort(() => Math.random() - 0.5).slice(0, 2);
            break;
          }
        }

        // 6. If a student with two eligible lecturers is found, assign them to the appointment
        if (selectedStudent && selectedLecturers.length === 2) {
          const { error: updateError } = await supabase
            .from('citas')
            .update({
              anteproyectoID: selectedStudent.id,
              lector1: selectedLecturers[0],
              lector2: selectedLecturers[1],
            })
            .eq('id', appointment.id);
          if (updateError) throw updateError;

          // Remove the student from unassigned list to avoid reassignment
          const index = unassignedAnteproyectos.findIndex(anteproyecto => anteproyecto.id === selectedStudent.id);
          if (index > -1) unassignedAnteproyectos.splice(index, 1);
        }
      }

      console.log('Lecturer assignments completed successfully.');
    } catch (error) {
      console.error('Error assigning lecturers:', error.message);
    }
  };



  return (
    <div>
      <Header title="Citas" />
      <SettingsCoordinador show={isMenuOpen} />
      <div className={styles.menuGrid}>
        <Link to="/citas" className={styles.menuItem}>
          <i className="fas fa-folder"></i>
          <p>Administrar Citas</p>
        </Link>
        <div className={styles.menuItem} onClick={assignLecturersToAppointments}>
          <i className="fas fa-users"></i>
          <p>Asignación Automática</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CitasMenu;
