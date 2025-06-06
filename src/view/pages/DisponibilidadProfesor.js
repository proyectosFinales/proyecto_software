import React, { useState, useEffect } from 'react';
import '../styles/Citas.css';
import { supabase } from '../../model/Cliente';
import Footer from '../components/Footer';
import Header from '../components/HeaderProfesor';
import { useNavigate } from 'react-router-dom';

const DisponibilidadProfesor = () => {
  const [citas, setCitas] = useState([]);
  const [citasOriginales, setCitasOriginales] = useState([]);
  const [error, setError] = useState('');
  const profesorID = sessionStorage.getItem('token');
  const navigate = useNavigate();

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const { data: citasData, error: citasError } = await supabase
          .from('citas')
          .select('id, fecha, horaInicio, horaFin')
          .eq('semestreActual', 1);

        if (citasError) throw citasError;

        const { data: disponibilidadData, error: disponibilidadError } = await supabase
          .from('disponibilidadCitas')
          .select('*')
          .eq('profesorID', profesorID);

        if (disponibilidadError) throw disponibilidadError;

        const formattedAppointments = citasData.map((cita) => {
          const matchedDisponibilidad = disponibilidadData.find(
            (d) => d.citaID === cita.id
          );

          return {
            id: cita.id,
            fecha: cita.fecha,
            horaInicio: cita.horaInicio,
            horaFin: cita.horaFin,
            disponible: matchedDisponibilidad ? matchedDisponibilidad.disponible : false,
            disponibilidadID: matchedDisponibilidad ? matchedDisponibilidad.id : null,
          };
        });

        formattedAppointments.sort((a, b) => {
          if (a.fecha === b.fecha) {
            return a.horaInicio.localeCompare(b.horaInicio);
          }
          return a.fecha.localeCompare(b.fecha);
        });

        for (let cita of formattedAppointments) {
          if (cita.disponibilidadID === null) {
            const { data, error } = await supabase
              .from('disponibilidadCitas')
              .insert([
                { citaID: cita.id, profesorID, disponible: cita.disponible },
              ])
              .select('id');
            if (error) throw error;
            cita.disponibilidadID = data[0].id;
          }
        }

        setCitas(formattedAppointments);
        setCitasOriginales(JSON.parse(JSON.stringify(formattedAppointments)));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar las citas.');
      }
    };

    fetchCitas();
  }, [profesorID]);

  const handleCheckboxChange = (index) => {
    const nuevasCitas = [...citas];
    nuevasCitas[index].disponible = !nuevasCitas[index].disponible;
    setCitas(nuevasCitas);
  };

  const selectAll = () => {
    const nuevasCitas = citas.map((cita) => ({
      ...cita,
      disponible: true,
    }));
    setCitas(nuevasCitas);
  };

  const deselectAll = () => {
    const nuevasCitas = citas.map((cita) => ({
      ...cita,
      disponible: false,
    }));
    setCitas(nuevasCitas);
  };

  const hasChanges = () => {
    return JSON.stringify(citas) !== JSON.stringify(citasOriginales);
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      alert('No hay cambios para guardar.');
      return;
    }

    if (window.confirm('¿Está seguro de que desea guardar los cambios?')) {
      try {
        for (let cita of citas) {
          const { error } = await supabase
            .from('disponibilidadCitas')
            .update({ disponible: cita.disponible })
            .eq('id', cita.disponibilidadID);

          if (error) throw error;
        }
        alert('Cambios guardados correctamente.');
        setCitasOriginales(JSON.parse(JSON.stringify(citas)));
      } catch (error) {
        console.error('Error saving data:', error);
        alert('Error al guardar los cambios.');
      }
    }
  };

  const handleGoBack = () => {
    if (!hasChanges()) {
      navigate('/MenuProfesor');
    } else {
      if (window.confirm('¿Está seguro de que desea descartar los cambios?')) {
        setCitas(JSON.parse(JSON.stringify(citasOriginales)));
        navigate('/MenuProfesor');
      }
    }
  };

  return (
    <div>
      <Header title="Citas" />
      <div className="container citas-div">
        {/* Tabla de citas */}
        <div className="row justify-content-center cita-table">
          <h2 className="mb-5 w-auto">Lista de citas</h2>

          {/* Botones para seleccionar/deseleccionar */}
          <div className="row justify-content-center mb-4">
            <div className="col-auto">
              <button className="cita-btn" onClick={selectAll}>Seleccionar todos</button>
            </div>
            <div className="col-auto">
              <button className="cita-btn-secondary" onClick={deselectAll}>Deseleccionar todos</button>
            </div>
          </div>

          <table className="mb-4">
            <thead>
              <tr>
                <th>Día</th>
                <th>Hora</th>
                <th>Disponible</th>
              </tr>
            </thead>

            <tbody>
              {citas.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>
                    No hay citas disponibles.
                  </td>
                </tr>
              ) : (
                citas.map((cita, index) => (
                  <tr key={cita.id}>
                    <td>{cita.fecha}</td>
                    <td>{`${formatTime(cita.horaInicio)} - ${formatTime(cita.horaFin)}`}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={cita.disponible}
                        onChange={() => handleCheckboxChange(index)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Botones para guardar/volver */}
        <div className="row justify-content-center">
          <div className="col-auto">
            <button className="cita-btn" onClick={handleSave}>Guardar</button>
          </div>
          <div className="col-auto">
            <button className="cita-btn-secondary" onClick={handleGoBack}>Volver</button>
          </div>
        </div>

        {/* Error message display */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      <Footer />
    </div>
  );
};

export default DisponibilidadProfesor;
