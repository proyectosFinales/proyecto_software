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

        const { data: anteproyectoData, error: anteproyectoError } = await supabase
          .from('anteproyectos')
          .select('id, idEncargado, idEstudiante')
          .eq('idEncargado', profesorID, 'semestreActual', 1);

        if (anteproyectoError) throw anteproyectoError;

        if (anteproyectoData && anteproyectoData.length > 0) {
          for (let anteproyecto of anteproyectoData) {
            const estudianteID = anteproyecto.idEstudiante;
            const anteproyectoID = anteproyecto.id;

            const { data: citasData, error: citasError } = await supabase
              .from('citas')
              .select('id, fecha, horaInicio, horaFin, lector1, lector2, anteproyectoID')
              .eq('anteproyectoID', anteproyectoID, 'semestreActual', 1);

            if (citasError) throw citasError;

            allCitas = [...allCitas, ...citasData];
            const { data: estudianteData } = await supabase
              .from('estudiantes')
              .select('id, nombre')
              .eq('id', estudianteID);

            setEstudiantesMap(prevState => ({
              ...prevState,
              [anteproyectoID]: estudianteData[0].nombre,
            }));

            const { data: profesorData } = await supabase
              .from('profesores')
              .select('id, nombre')
              .eq('id', profesorID);

            setProfesoresMap(prevState => ({
              ...prevState,
              [anteproyectoID]: profesorData[0].nombre,
            }));
          }
        }

        const { data: lectorCitasData, error: lectorError } = await supabase
          .from('citas')
          .select('id, anteproyectoID, fecha, horaInicio, horaFin, lector1, lector2')
          .or(`lector1.eq.${profesorID},lector2.eq.${profesorID}`)
          .eq('semestreActual', 1);

        if (lectorError) throw lectorError;

        if (lectorCitasData && lectorCitasData.length > 0) {
          for (let cita of lectorCitasData) {
            allCitas.push(cita);

            const anteproyectoID = cita.anteproyectoID;

            const { data: anteproyectoData } = await supabase
              .from('anteproyectos')
              .select('idEstudiante, idEncargado')
              .eq('id', anteproyectoID);

            if (anteproyectoData && anteproyectoData.length > 0) {
              const estudianteID = anteproyectoData[0].idEstudiante;
              const idEncargado = anteproyectoData[0].idEncargado;

              const { data: estudianteData } = await supabase
                .from('estudiantes')
                .select('id, nombre')
                .eq('id', estudianteID);

              setEstudiantesMap(prevState => ({
                ...prevState,
                [anteproyectoID]: estudianteData[0].nombre,
              }));

              const { data: profesorData } = await supabase
                .from('profesores')
                .select('id, nombre')
                .eq('id', idEncargado);

              setProfesoresMap(prevState => ({
                ...prevState,
                [anteproyectoID]: profesorData[0].nombre,
              }));
            }
          }
        }

        const { data: profesoresData, error: profesoresError } = await supabase
          .from('profesores')
          .select('id, nombre');

        if (profesoresError) throw profesoresError;

        let lectoresMap = {};
        profesoresData.forEach(profesor => {
          lectoresMap[profesor.id] = profesor.nombre;
        });
        setLectoresMap(lectoresMap);

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
                  <th>Profesor</th>
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
                  citas.map((cita) => {
                    return (
                      <tr className='cita-row' key={cita.id}>
                        <td>{estudiantesMap[cita.anteproyectoID] || 'N/A'}</td>
                        <td>{profesoresMap[cita.anteproyectoID] || 'N/A'}</td>
                        <td>{formatDateDDMMYYYY(cita.fecha)}</td>
                        <td>{`${formatTime(cita.horaInicio)} - ${formatTime(cita.horaFin)}`}</td>
                        <td>{lectoresMap[cita.lector1] || 'N/A'}</td>
                        <td>{lectoresMap[cita.lector2] || 'N/A'}</td>
                      </tr>
                    );
                  })
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
