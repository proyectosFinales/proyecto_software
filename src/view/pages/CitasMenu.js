/**
 * CitasMenu.jsx
 *
 * Menú para el coordinador, con opción de administrar citas y
 * realizar la asignación automática de lectores.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/MenuPrincipal.module.css';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import SettingsCoordinador from '../components/SettingsCoordinador';
import { supabase } from '../../model/Cliente';

const CitasMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const assignLecturersToAppointments = async () => {
    try {
      // 1. Fetch all appointments (Cita) where semestre_id = 1
      const { data: appointments, error: appointmentError } = await supabase
        .from('Cita')  // Antes 'citas'
        .select('cita_id, anteproyecto_id, lector1, lector2')
        .eq('semestre_id', 1);
      if (appointmentError) throw appointmentError;

      // 2. Fetch all anteproyectos con estado 'Aprobado' en este semestre
      const { data: allAnteproyectos, error: anteproyectosError } = await supabase
        .from('Anteproyecto')
        .select('id, estudiante_id')
        .eq('estado', 'Aprobado')
        .eq('semestre_id', 1);
      if (anteproyectosError) throw anteproyectosError;

      // Asignar IDs de anteproyecto que ya tienen cita
      const assignedAnteproyectoIds = new Set(appointments.map(app => app.anteproyecto_id));
      // Filtrar anteproyectos sin cita
      const unassignedAnteproyectos = allAnteproyectos.filter(
        ap => !assignedAnteproyectoIds.has(ap.id)
      );

      // 3. Loop through each appointment and attempt to assign two lecturers
      for (const appointment of appointments) {
        // 4. Fetch available professors for this appointment
        // Suponiendo que tu tabla "Disponibilidad" o "DisponibilidadCitas" se llame "Disponibilidad"
        const { data: availableProfessors, error: professorsError } = await supabase
          .from('Disponibilidad')
          .select('profesor_id')
          .eq('cita_id', appointment.cita_id)
          .eq('disponible', true); // Ajusta si tu campo es boolean
        if (professorsError) throw professorsError;

        const availableProfessorIds = availableProfessors.map(prof => prof.profesor_id);

        // 5. Buscar un anteproyecto sin asignar que tenga al menos 2 profesores elegibles
        let selectedStudentAnteproyecto = null;
        let selectedLecturers = [];

        for (const studentAnteproyecto of unassignedAnteproyectos) {
          // 5.1. Revisar profesores que hayan sido "encargados" (asesor/profesor_id)
          //      en algún anteproyecto anterior de este estudiante
          //      (o que hayan sido lector1/lector2).
          // Ejemplo:
          const { data: previousAnte, error: pAnteError } = await supabase
            .from('Anteproyecto')
            .select('asesor')
            .eq('estudiante_id', studentAnteproyecto.estudiante_id);
          if (pAnteError) throw pAnteError;

          const previousEncargadoIds = new Set(previousAnte.map(a => a.asesor));

          // 5.2. Revisar citas anteriores donde lector1/lector2 = ...
          // Si quieres, harías un join. Ejemplo sencillo:
          const { data: previousLectures, error: lecturesError } = await supabase
            .from('Cita')
            .select('lector1, lector2')
            .in('anteproyecto_id',
              (await supabase
                .from('Anteproyecto')
                .select('id')
                .eq('estudiante_id', studentAnteproyecto.estudiante_id)
              ).data?.map(a => a.id) || []
            );
          if (lecturesError) throw lecturesError;

          const previousLecturerIds = new Set(
            previousLectures.flatMap(lec => [lec.lector1, lec.lector2])
          );

          // 5.3. Filtrar los profesores elegibles
          const eligibleProfessors = availableProfessorIds.filter(pid => {
            return pid && !previousEncargadoIds.has(pid) && !previousLecturerIds.has(pid);
          });

          // Si hay >= 2 elegibles, se elige 2 (random)
          if (eligibleProfessors.length >= 2) {
            selectedStudentAnteproyecto = studentAnteproyecto;
            selectedLecturers = eligibleProfessors
              .sort(() => Math.random() - 0.5)
              .slice(0, 2);
            break;
          }
        }

        // 6. Si se encontró un anteproyecto con 2 profesores elegibles => Asignar
        if (selectedStudentAnteproyecto && selectedLecturers.length === 2) {
          const { error: updateError } = await supabase
            .from('Cita')
            .update({
              anteproyecto_id: selectedStudentAnteproyecto.id,
              lector1: selectedLecturers[0],
              lector2: selectedLecturers[1]
            })
            .eq('cita_id', appointment.cita_id);

          if (updateError) throw updateError;

          // Quitar el anteproyecto de la lista "unassigned"
          const index = unassignedAnteproyectos.findIndex(
            ap => ap.id === selectedStudentAnteproyecto.id
          );
          if (index > -1) {
            unassignedAnteproyectos.splice(index, 1);
          }
        }
      }

      console.log('Lecturer assignments completed successfully.');
      alert('Se asignaron correctamente los lectores');
    } catch (error) {
      console.error('Error assigning lecturers:', error.message);
      alert('Hubo un error al realizar la asignación de los lectores');
    }
    navigate('/citas');
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
