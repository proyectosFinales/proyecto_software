/**
 * Citas.jsx
 * Vista para que el coordinador gestione (cree, edite, elimine) citas de defensas.
 */
import React, { useState, useEffect } from 'react';
import '../styles/Citas.css';
import Modal from '../components/Modal';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';

const Citas = () => {
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [duracion, setDuracion] = useState(1);
  const [citas, setCitas] = useState([]);
  const [lectores, setLectores] = useState([]);
  const [citaActual, setCitaActual] = useState(null);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState('');
  const [estudiantes, setEstudiantes] = useState({});
  const [profesores, setProfesores] = useState({});

  const getEndDate = (time) => {
    const [hours, minutes] = time.split(':');
    const endHour = (parseInt(hours, 10) + duracion) % 24;
    return `${endHour.toString().padStart(2, '0')}:${minutes}`;
  };

  const formatDateDDMMYYYY = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchAll = async () => {
      // 1. Citas
      const { data: citasData, error: citasError } = await supabase
        .from('Cita') // Cambia 'citas' => 'Cita'
        .select(`
          cita_id,
          fecha,
          hora_inicio,
          hora_fin,
          lector1,
          lector2,
          anteproyecto_id
        `)
        .eq('semestre_id', 1); // Ajusta si manejas 'semestre_id'
      if (!citasError && citasData) {
        // Ordenar las citas por fecha y hora
        citasData.sort((a, b) => {
          if (a.fecha < b.fecha) return -1;
          if (a.fecha > b.fecha) return 1;
          return a.hora_inicio.localeCompare(b.hora_inicio);
        });
        setCitas(citasData);
      }

      // 2. Lectores (profesores)
      const { data: profData, error: profError } = await supabase
        .from('Profesor')
        .select('profesor_id, nombre');
      if (!profError && profData) {
        setLectores(profData);
      }

      // 3. Anteproyectos + Estudiantes
      const { data: antData, error: antError } = await supabase
        .from('Anteproyecto')
        .select(`
          id,
          estudiante_id,
          Estudiante:estudiante_id (
            nombre
          ),
          empresa_id
        `)
        .eq('semestre_id', 1);
      // ^ Ajusta si deseas filtrar
      if (!antError && antData) {
        // Mapa de {anteproyecto_id -> nombre estudiante}
        const estMap = {};
        for (const ap of antData) {
          estMap[ap.id] = ap.Estudiante?.nombre || 'N/A';
        }
        setEstudiantes(estMap);
      }

      // 4. Duración
      const { data: durData, error: durError } = await supabase
        .from('duraciones') // si tu tabla se llama así
        .select('horas')
        .eq('id', 1)
        .single();

      if (!durError && durData) {
        setDuracion(durData.horas);
      }
    };

    fetchAll();
  }, []);

  const handleAsignarCita = async () => {
    if (!fecha || !horaInicio) {
      setError('Por favor complete todos los campos antes de asignar la cita.');
      return;
    }
    setError('');

    const nuevaCita = {
      fecha: fecha,
      hora_inicio: horaInicio,    // col en la nueva BD
      hora_fin: getEndDate(horaInicio),
      lector1: null,
      lector2: null,
      anteproyecto_id: null,
      semestre_id: 1              // Ajusta si usas semestres
    };

    try {
      const { data, error: insertError } = await supabase
        .from('Cita')
        .insert([nuevaCita])
        .select();

      if (insertError) {
        console.error('Error al agregar cita:', insertError);
        setError('Ocurrió un error al guardar la cita.');
        return;
      }

      setCitas([...citas, data[0]]);
      setFecha('');
      setHoraInicio('');
    } catch (error) {
      console.error('Error al guardar la cita:', error);
      setError('Ocurrió un error inesperado.');
    }
  };

  const handleCitaClick = (cita) => {
    // Almacena la cita seleccionada en estado
    setCitaActual({
      ...cita,
      hora_inicio: cita.hora_inicio,
      hora_fin: cita.hora_fin
    });
    setModal(true);
  };

  const updateCita = async (citaMod) => {
    try {
      const { error } = await supabase
        .from('Cita')
        .update({
          lector1: citaMod.lector1,
          lector2: citaMod.lector2,
          hora_inicio: citaMod.hora_inicio,
          hora_fin: citaMod.hora_fin
        })
        .eq('cita_id', citaMod.cita_id);

      if (error) {
        console.error('Error al actualizar la cita en la base de datos:', error);
        return;
      }

      // Actualiza en el estado local
      const citasModificadas = citas.map((c) => (c.cita_id === citaMod.cita_id ? citaMod : c));
      setCitas(citasModificadas);
      setCitaActual(null);
      setModal(false);
    } catch (error) {
      console.error('Error al actualizar la cita:', error);
    }
  };

  const deleteCita = async (citaDel) => {
    const confirmDelete = window.confirm("¿Está seguro de que desea eliminar esta cita?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('Cita')
        .delete()
        .eq('cita_id', citaDel.cita_id);

      if (error) {
        console.error('Error al eliminar la cita:', error);
        return;
      }

      setCitas(citas.filter((c) => c.cita_id !== citaDel.cita_id));
      setModal(false);
      alert('Cita eliminada correctamente.');
    } catch (error) {
      console.error('Error al eliminar la cita:', error);
    }
  };

  return (
    <div>
      <Header title="Citas" />
      <div className="citas-div container">
        {/* Form */}
        <div className="row justify-content-center">
          <div className="col-8">
            <div className="cita-form row justify-content-center">
              <div className="col-12">
                <h2 className="w-100 text-center">Información de la cita</h2>
              </div>

              <div className="col-12">
                <label>
                  Fecha:
                  <input
                    type="date"
                    className="styled-input"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </label>
              </div>

              <div className="col-12">
                <label>
                  Hora de inicio:
                  <input
                    type="time"
                    className="styled-input"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    step="300"
                  />
                </label>
              </div>

              <div className="col-12 d-flex justify-content-center">
                <button className="cita-btn w-50" onClick={handleAsignarCita}>
                  Guardar cita
                </button>
              </div>

              <div className="col-12">
                {error && <p style={{ color: 'red' }}>{error}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="cita-table row justify-content-center">
          <div className="row justify-content-center mb-3">
            <h2 className="col-5 w-auto m-0">Lista de citas</h2>
          </div>

          <table className="w-100">
            <thead>
              <tr>
                <th>Día</th>
                <th>Hora</th>
                <th>Estudiante</th>
                <th>Lector 1</th>
                <th>Lector 2</th>
              </tr>
            </thead>
            <tbody>
              {citas.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No hay citas asignadas.
                  </td>
                </tr>
              ) : (
                citas.map((cita) => {
                  const lector1 = lectores.find((l) => l.profesor_id === cita.lector1);
                  const lector2 = lectores.find((l) => l.profesor_id === cita.lector2);
                  const estName = estudiantes[cita.anteproyecto_id]; // Mapa con la info del estudiante

                  return (
                    <tr
                      className="cita-row"
                      key={cita.cita_id}
                      onClick={() => handleCitaClick(cita)}
                    >
                      <td>{formatDateDDMMYYYY(cita.fecha)}</td>
                      <td>
                        {`${formatTime(cita.hora_inicio)} - ${formatTime(cita.hora_fin)}`}
                      </td>
                      <td>{estName || 'N/A'}</td>
                      <td>{lector1 ? lector1.nombre : 'N/A'}</td>
                      <td>{lector2 ? lector2.nombre : 'N/A'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal para editar la cita */}
        <Modal show={modal} onClose={() => setModal(false)}>
          {citaActual && (
            <>
              <h2>Editar Cita</h2>
              <label className="label-modal">
                Estudiante: {estudiantes[citaActual.anteproyecto_id] || 'N/A'}
              </label>
              <label className="label-modal">
                {/* Suponiendo que no guardas info del profesor orientador en la cita */}
                Profesor: N/A
              </label>
              <label className="label-modal">
                Lector 1:
                <select
                  className="styled-input"
                  value={citaActual.lector1 || ''}
                  onChange={(e) => {
                    const updated = { ...citaActual, lector1: e.target.value || null };
                    setCitaActual(updated);
                  }}
                >
                  <option value="">Seleccione un lector</option>
                  {lectores.map((lector) => (
                    <option key={lector.profesor_id} value={lector.profesor_id}>
                      {lector.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="label-modal">
                Lector 2:
                <select
                  className="styled-input"
                  value={citaActual.lector2 || ''}
                  onChange={(e) => {
                    const updated = { ...citaActual, lector2: e.target.value || null };
                    setCitaActual(updated);
                  }}
                >
                  <option value="">Seleccione un lector</option>
                  {lectores.map((lector) => (
                    <option key={lector.profesor_id} value={lector.profesor_id}>
                      {lector.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="label-modal">
                Hora de inicio:
                <input
                  type="time"
                  className="styled-input"
                  value={citaActual.hora_inicio}
                  onChange={(e) => {
                    const updatedTime = e.target.value;
                    const updatedCita = {
                      ...citaActual,
                      hora_inicio: updatedTime,
                      hora_fin: getEndDate(updatedTime)
                    };
                    setCitaActual(updatedCita);
                  }}
                  step="300"
                />
              </label>
              <div className="modal-actions">
                <button
                  className="cita-btn cita-btn-error w-50"
                  onClick={() => deleteCita(citaActual)}
                >
                  Eliminar
                </button>
                <button
                  className="cita-btn w-50"
                  onClick={() => updateCita(citaActual)}
                >
                  Guardar
                </button>
                <button className="cita-btn w-50" onClick={() => setModal(false)}>
                  Cancelar
                </button>
              </div>
            </>
          )}
        </Modal>
      </div>
      <Footer />
    </div>
  );
};

export default Citas;
