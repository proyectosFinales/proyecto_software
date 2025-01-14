/**
 * CitasProfesor.jsx
 * Muestra las citas relacionadas con un profesor (sea como asesor o lector).
 */
import React, { useState, useEffect } from 'react';
import '../styles/Citas.css';
import { supabase } from '../../model/Cliente';
import Footer from '../components/Footer';
import Header from '../components/HeaderProfesor';

const CitasProfesor = () => {
  const profesorID = sessionStorage.getItem('token');
  const [citas, setCitas] = useState([]);
  const [lectoresMap, setLectoresMap] = useState({});
  const [estudiantesMap, setEstudiantesMap] = useState({});
  const [profesoresMap, setProfesoresMap] = useState({});

  const formatDateDDMMYYYY = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        let allCitas = [];

        // 1. Buscar anteproyectos donde el profesor es "asesor"
        //    Si en tu BD se llama 'asesor', ajusta:
        const { data: anteData, error: anteError } = await supabase
          .from('Anteproyecto')
          .select('id, asesor, estudiante_id')
          .eq('asesor', profesorID) // antes: 'idEncargado'
          .eq('semestre_id', 1);    // si usas semestres

        if (anteError) throw anteError;

        // 2. Para cada anteproyecto, obtener su(s) cita(s)
        if (anteData?.length) {
          for (let ap of anteData) {
            const anteID = ap.id;
            const { data: citasData, error: citasError } = await supabase
              .from('Cita')
              .select('cita_id, fecha, hora_inicio, hora_fin, lector1, lector2, anteproyecto_id')
              .eq('anteproyecto_id', anteID)
              .eq('semestre_id', 1);  // si usas semestres

            if (citasError) throw citasError;

            allCitas = [...allCitas, ...citasData];

            // 2.1. Llenar info de estudiante y profesor(asesor):
            if (ap.estudiante_id) {
              const { data: estData } = await supabase
                .from('Estudiante')
                .select('estudiante_id, nombre')
                .eq('estudiante_id', ap.estudiante_id)
                .single();
              if (estData) {
                setEstudiantesMap(prev => ({
                  ...prev,
                  [anteID]: estData.nombre
                }));
              }
            }

            const { data: profAsesorData } = await supabase
              .from('Profesor')
              .select('profesor_id, nombre')
              .eq('profesor_id', profesorID)
              .single();

            if (profAsesorData) {
              setProfesoresMap(prev => ({
                ...prev,
                [anteID]: profAsesorData.nombre
              }));
            }
          }
        }

        // 3. Buscar citas donde el profesor sea lector1 o lector2
        const { data: lectorCitasData, error: lectorError } = await supabase
          .from('Cita')
          .select('cita_id, anteproyecto_id, fecha, hora_inicio, hora_fin, lector1, lector2')
          .or(`lector1.eq.${profesorID},lector2.eq.${profesorID}`)
          .eq('semestre_id', 1); // si usas semestres

        if (lectorError) throw lectorError;

        if (lectorCitasData?.length) {
          for (let cita of lectorCitasData) {
            allCitas.push(cita);

            // Llenar info de ese anteproyecto
            const anteID = cita.anteproyecto_id;
            const { data: anteRow } = await supabase
              .from('Anteproyecto')
              .select('estudiante_id, asesor')
              .eq('id', anteID)
              .single();

            if (anteRow) {
              // Estudiante
              if (anteRow.estudiante_id) {
                const { data: est2 } = await supabase
                  .from('Estudiante')
                  .select('nombre')
                  .eq('estudiante_id', anteRow.estudiante_id)
                  .single();
                if (est2) {
                  setEstudiantesMap(prev => ({
                    ...prev,
                    [anteID]: est2.nombre
                  }));
                }
              }
              // Asesor
              if (anteRow.asesor) {
                const { data: prof2 } = await supabase
                  .from('Profesor')
                  .select('nombre')
                  .eq('profesor_id', anteRow.asesor)
                  .single();
                if (prof2) {
                  setProfesoresMap(prev => ({
                    ...prev,
                    [anteID]: prof2.nombre
                  }));
                }
              }
            }
          }
        }

        // 4. Mapa de lectores
        const { data: profesoresData, error: profsError } = await supabase
          .from('Profesor')
          .select('profesor_id, nombre');

        if (profsError) throw profsError;

        const tempLectores = {};
        (profesoresData || []).forEach(prof => {
          tempLectores[prof.profesor_id] = prof.nombre;
        });

        setLectoresMap(tempLectores);
        setCitas(allCitas);
      } catch (error) {
        console.error('Error fetching appointment data:', error);
      }
    };

    fetchCitas();
  }, [profesorID]);

  return (
    <div>
      <Header title="Citas" />
      <div className="citas-div container">
        <div className="row justify-content-center">
          <div className="cita-table col-12">
            <h2 className="w-100 text-center">Citas del profesor</h2>
            <table className="w-100">
              <thead>
                <tr className="cita-row">
                  <th>Estudiante</th>
                  <th>Profesor asesor</th>
                  <th>Día</th>
                  <th>Hora</th>
                  <th>Lector 1</th>
                  <th>Lector 2</th>
                </tr>
              </thead>
              <tbody>
                {citas.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>
                      No se ha encontrado ninguna cita relacionada con este profesor.
                    </td>
                  </tr>
                ) : (
                  citas.map((cita) => (
                    <tr className="cita-row" key={cita.cita_id}>
                      <td>{estudiantesMap[cita.anteproyecto_id] || 'N/A'}</td>
                      <td>{profesoresMap[cita.anteproyecto_id] || 'N/A'}</td>
                      <td>{formatDateDDMMYYYY(cita.fecha)}</td>
                      <td>{`${formatTime(cita.hora_inicio)} - ${formatTime(cita.hora_fin)}`}</td>
                      <td>{lectoresMap[cita.lector1] || 'N/A'}</td>
                      <td>{lectoresMap[cita.lector2] || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CitasProfesor;
