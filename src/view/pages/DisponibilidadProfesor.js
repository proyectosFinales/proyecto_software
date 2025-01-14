/**
 * DisponibilidadProfesor.jsx
 * Permite a un profesor indicar su disponibilidad para cada cita en el semestre.
 */
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
    const fetchData = async () => {
      try {
        // 1. Traer todas las citas de la tabla "Cita"
        const { data: citasData, error: citasError } = await supabase
          .from('Cita')
          .select('cita_id, fecha, hora_inicio, hora_fin')
          .eq('semestre_id', 1); // si usas semestres

        if (citasError) throw citasError;

        // 2. Traer la disponibilidad actual del profesor en la tabla "Disponibilidad"
        const { data: dispData, error: dispError } = await supabase
          .from('Disponibilidad')
          .select('*')
          .eq('profesor_id', profesorID);
        if (dispError) throw dispError;

        // 3. Combinar
        const formattedAppointments = (citasData || []).map(cita => {
          const match = dispData.find(d => d.cita_id === cita.cita_id);
          return {
            cita_id: cita.cita_id,
            fecha: cita.fecha,
            hora_inicio: cita.hora_inicio,
            hora_fin: cita.hora_fin,
            disponible: match ? match.disponible : false,
            disponibilidad_id: match ? match.id : null,
          };
        });

        // Ordenar por fecha + hora
        formattedAppointments.sort((a, b) => {
          if (a.fecha === b.fecha) {
            return a.hora_inicio.localeCompare(b.hora_inicio);
          }
          return a.fecha.localeCompare(b.fecha);
        });

        // 4. Si no existe registro de disponibilidad para alguna cita, crearlo
        for (let item of formattedAppointments) {
          if (!item.disponibilidad_id) {
            const { data: inserted, error } = await supabase
              .from('Disponibilidad')
              .insert([{ profesor_id: profesorID, cita_id: item.cita_id, disponible: item.disponible }])
              .select('id')
              .single();
            if (error) throw error;
            item.disponibilidad_id = inserted.id;
          }
        }

        setCitas(formattedAppointments);
        setCitasOriginales(JSON.parse(JSON.stringify(formattedAppointments)));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar las citas.');
      }
    };

    fetchData();
  }, [profesorID]);

  const handleCheckboxChange = (index) => {
    const updated = [...citas];
    updated[index].disponible = !updated[index].disponible;
    setCitas(updated);
  };

  const selectAll = () => {
    setCitas(c => c.map(item => ({ ...item, disponible: true })));
  };

  const deselectAll = () => {
    setCitas(c => c.map(item => ({ ...item, disponible: false })));
  };

  const hasChanges = () => {
    return JSON.stringify(citas) !== JSON.stringify(citasOriginales);
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      alert('No hay cambios para guardar.');
      return;
    }
    if (!window.confirm('¿Está seguro de que desea guardar los cambios?')) {
      return;
    }

    try {
      for (let c of citas) {
        const { error } = await supabase
          .from('Disponibilidad')
          .update({ disponible: c.disponible })
          .eq('id', c.disponibilidad_id);

        if (error) throw error;
      }
      alert('Cambios guardados correctamente.');
      setCitasOriginales(JSON.parse(JSON.stringify(citas)));
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error al guardar los cambios.');
    }
  };

  const handleGoBack = () => {
    if (!hasChanges()) {
      navigate('/menuProfesor');
    } else {
      if (window.confirm('¿Está seguro de que desea descartar los cambios?')) {
        setCitas(JSON.parse(JSON.stringify(citasOriginales)));
        navigate('/menuProfesor');
      }
    }
  };

  return (
    <div>
      <Header title="Citas" />
      <div className="container citas-div">
        <div className="row justify-content-center cita-table">
          <h2 className="mb-5 w-auto">Lista de citas</h2>
          <div className="row justify-content-center mb-4">
            <div className="col-auto">
              <button className="cita-btn" onClick={selectAll}>
                Seleccionar todos
              </button>
            </div>
            <div className="col-auto">
              <button className="cita-btn-secondary" onClick={deselectAll}>
                Deseleccionar todos
              </button>
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
                  <tr key={cita.cita_id}>
                    <td>{cita.fecha}</td>
                    <td>{`${formatTime(cita.hora_inicio)} - ${formatTime(cita.hora_fin)}`}</td>
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

        <div className="row justify-content-center">
          <div className="col-auto">
            <button className="cita-btn" onClick={handleSave}>Guardar</button>
          </div>
          <div className="col-auto">
            <button className="cita-btn-secondary" onClick={handleGoBack}>Volver</button>
          </div>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      <Footer />
    </div>
  );
};

export default DisponibilidadProfesor;
