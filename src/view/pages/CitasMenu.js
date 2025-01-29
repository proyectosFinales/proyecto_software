/**
 * CitasMenu.jsx
 *
 * Menú para el coordinador, con opción de administrar citas y
 * realizar la asignación automática de lectores.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SettingsCoordinador from '../components/SettingsCoordinador';
import supabase from '../../model/supabase';

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
      console.log("[DEBUG] Appointments found:", appointments); // DEBUG

      // 2. Fetch all anteproyectos con estado 'Aprobado' en este semestre
      const { data: allAnteproyectos, error: anteproyectosError } = await supabase
        .from('Anteproyecto')
        .select('id, estudiante_id')
        .eq('estado', 'Aprobado')
        .eq('semestre_id', 1);
      if (anteproyectosError) throw anteproyectosError;

      // CHANGED: Also fetch full list of Profesor to map IDs to names
      const { data: allProfesores, error: professorError } = await supabase
        .from('Profesor')
        .select('profesor_id, nombre');
      if (professorError) throw professorError;
      console.log("[DEBUG] All professors found:", allProfesores); // DEBUG

      // Asignar IDs de anteproyecto que ya tienen cita
      const assignedAnteproyectoIds = new Set(appointments.map(app => app.anteproyecto_id));
      // Filtrar anteproyectos sin cita
      const unassignedAnteproyectos = allAnteproyectos.filter(
        ap => !assignedAnteproyectoIds.has(ap.id)
      );
      console.log("[DEBUG] unassignedAnteproyectos:", unassignedAnteproyectos); // DEBUG

      // 3. Loop through each appointment and attempt to assign two lecturers
      for (const appointment of appointments) {
        // 4. Fetch available professors for this appointment
        // Suponiendo que tu tabla "Disponibilidad" o "DisponibilidadCitas" se llame "Disponibilidad"
        const { data: availableProfessors, error: professorsError } = await supabase
          .from('disponibilidad')
          .select('profesor_id')
          .eq('cita_id', appointment.cita_id)
          .eq('disponible', true); // Ajusta si tu campo es boolean
        if (professorsError) throw professorsError;

        console.log(`[DEBUG] For Cita ${appointment.cita_id}, availableProfessors:`, availableProfessors); // DEBUG

        const availableProfessorIds = availableProfessors.map(prof => prof.profesor_id);

        // Suppose you have a situation you previously logged:
        // "No hay disponibilidad para prof. b04472..."
        // We'll do something like:
        if (availableProfessorIds.length < 2) {
          // CHANGED: We find the professor's name from "allProfesores"
          const profNames = availableProfessorIds.map(pid => {
            const found = allProfesores.find(p => p.profesor_id === pid);
            return found ? found.nombre : `Desconocido (ID: ${pid})`;
          });
          // Then log the name(s) instead of the ID:
          console.warn("[DEBUG] No hay suficiente disponibilidad para:", profNames.join(", ")); 
        }

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

      // CHANGED: If we detect an unassigned project, we can show professor name
      if (unassignedAnteproyectos.length > 0) {
        unassignedAnteproyectos.forEach(ap => {
          // Example message:
          console.warn(`[DEBUG] El anteproyecto ${ap.id} no fue asignado: no hay disponibilidad de profesores.`);
        });
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-black py-4 px-6 text-xl font-bold">
        Citas y Calendario
      </header>
      <SettingsCoordinador show={isMenuOpen} setShow={setIsMenuOpen} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 flex-1">
        <Link
          to="/citas"
          className="flex flex-col items-center justify-center p-4 bg-white rounded shadow hover:shadow-lg hover:scale-105 transition-transform"
        >
          <i className="fas fa-folder text-5xl mb-2 text-azul"></i>
          <p className="font-semibold text-gray-700">Administrar Citas</p>
        </Link>

        <div
          className="flex flex-col items-center justify-center p-4 bg-white rounded shadow hover:shadow-lg hover:scale-105 transition-transform cursor-pointer"
          onClick={assignLecturersToAppointments}
        >
          <i className="fas fa-users text-5xl mb-2 text-azul"></i>
          <p className="font-semibold text-gray-700">Asignación Automática</p>
        </div>

        <Link
          to="/calendario"
          className="flex flex-col items-center justify-center p-4 bg-white rounded shadow hover:shadow-lg hover:scale-105 transition-transform"
        >
          <i className="fas fa-calendar-alt text-5xl mb-2 text-azul"></i>
          <p className="font-semibold text-gray-700">Calendario</p>
        </Link>
      </div>
    </div>
  );
};

export default CitasMenu;
