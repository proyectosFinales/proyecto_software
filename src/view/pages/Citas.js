import React, { useState, useEffect } from 'react';
import '../styles/Citas.css';
import Modal from '../components/Modal';
import { supabase } from '../../model/Cliente';
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
    const fetchCitas = async () => {
      const { data, error } = await supabase
        .from('citas')
        .select(`
          id,
          fecha,
          horaInicio,
          horaFin,
          lector1,
          lector2,
          anteproyectoID
        `)
        .eq('semestreActual', 1);
      if (error) {
        console.error('Error al obtener citas:', error);
      } else {
        data.sort((a, b) => {
          if (a.fecha < b.fecha) return -1;
          if (a.fecha > b.fecha) return 1;
          return a.horaInicio.localeCompare(b.horaInicio);
        });
        setCitas(data);
      }
    };

    const fetchProfesores = async () => {
      const { data, error } = await supabase
        .from('profesores')
        .select(`id, nombre`);
      if (error) {
        console.error('Error al obtener profesores:', error);
      } else {
        setLectores(data);
      }
    };

    const fetchEstudiantes = async () => {
      const { data, error } = await supabase
        .from('anteproyectos')
        .select(`
          id,
          idEstudiante,
          estudiantes (nombre),
          idEncargado,
          profesores (nombre)
        `)
        .eq('semestreActual', 1);
      if (error) {
        console.error('Error al obtener estudiantes:', error);
      } else {
        const estudiantesMap = data.reduce((acc, anteproyecto) => {
          acc[anteproyecto.id] = anteproyecto.estudiantes.nombre;
          return acc;
        }, {});
        setEstudiantes(estudiantesMap);

        const profesoresMap = data.reduce((acc, anteproyecto) => {
          acc[anteproyecto.id] = anteproyecto.profesores?.nombre || "N/A";
          return acc;
        }, {});
        setProfesores(profesoresMap);
      }
    };

    const fetchDuracion = async () => {
      const { data, error } = await supabase
        .from('duraciones')
        .select('horas')
        .eq('id', 1);

      if (error) {
        console.error("Error obteniendo duration:", error);
      } else {
        setDuracion(data[0].horas);
      }
    }

    fetchCitas();
    fetchProfesores();
    fetchEstudiantes();
    fetchDuracion();
  }, []);

  const handleAsignarCita = async () => {
    if (!fecha || !horaInicio) {
      setError('Por favor complete todos los campos antes de asignar la cita.');
      return;
    }
    setError('');

    const nuevaCita = {
      fecha: fecha,
      horaInicio: horaInicio,
      horaFin: getEndDate(horaInicio),
      lector1: null,
      lector2: null,
      anteproyectoID: null,
    };

    try {
      const { data, error } = await supabase
        .from('citas')
        .insert([nuevaCita])
        .select();

      if (error) {
        console.error('Error al agregar cita:', error, data);
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
    setCitaActual({
      ...cita,
      horaInicio: cita.horaInicio,
      horaFin: cita.horaFin,
    });
    setModal(true);
  };

  const updateCita = async (citaModificada) => {
    try {
      const { error } = await supabase
        .from('citas')
        .update({
          lector1: citaModificada.lector1,
          lector2: citaModificada.lector2,
          horaInicio: citaModificada.horaInicio,
          horaFin: citaModificada.horaFin,
        })
        .eq('id', citaModificada.id);

      if (error) {
        console.error('Error al actualizar la cita en la base de datos:', error);
        return;
      }

      const citasModificadas = citas.map((cita) =>
        cita.id === citaModificada.id ? citaModificada : cita
      );

      setCitas(citasModificadas);
      setCitaActual(null);
      setModal(false);
    } catch (error) {
      console.error('Error al actualizar la cita:', error);
    }
  };

  const deleteCita = async (cita) => {
    const confirmDelete = window.confirm("¿Está seguro de que desea eliminar esta cita?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('citas')
        .delete()
        .eq('id', cita.id);

      if (error) {
        console.error('Error al eliminar la cita:', error);
        return;
      }

      setCitas(citas.filter((c) => c.id !== cita.id));
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
                    step="300" // 300 seconds = 5 minutes
                  />
                </label>
              </div>

              <div className="col-12 d-flex justify-content-center">
                <button className="cita-btn w-50" onClick={handleAsignarCita}>Guardar cita</button>
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
                  const lector1 = lectores.find((lect) => lect.id === cita.lector1);
                  const lector2 = lectores.find((lect) => lect.id === cita.lector2);
                  const estudianteNombre = estudiantes[cita.anteproyectoID]

                  return (
                    <tr className='cita-row' key={cita.id} onClick={() => handleCitaClick(cita)}>
                      <td>{formatDateDDMMYYYY(cita.fecha)}</td>
                      <td>{`${formatTime(cita.horaInicio)} - ${formatTime(cita.horaFin)}`}</td>
                      <td>{estudianteNombre ? estudianteNombre : 'N/A'}</td>
                      <td>{lector1 ? lector1.nombre : 'N/A'}</td>
                      <td>{lector2 ? lector2.nombre : 'N/A'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        <Modal show={modal} onClose={() => setModal(false)}>
          {citaActual && (
            <>
              <h2>Editar Cita</h2>

              <label className="label-modal">
                Estudiante: {estudiantes[citaActual.anteproyectoID] || 'N/A'}
              </label>

              <label className="label-modal">
                Profesor: {profesores[citaActual.anteproyectoID] || 'N/A'}
              </label>

              <label className="label-modal">
                Lector 1:
                <select
                  name="lector1"
                  className="styled-input"
                  value={citaActual.lector1 || ''}
                  onChange={(e) => {
                    const updatedAppt = { ...citaActual, lector1: e.target.value || null };
                    setCitaActual(updatedAppt);
                  }}
                >
                  <option value="">Seleccione un lector</option>
                  {lectores.map((lector) => (
                    <option key={lector.id} value={lector.id}>
                      {lector.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label className="label-modal">
                Lector 2:
                <select
                  name="lector2"
                  className="styled-input"
                  value={citaActual.lector2 || ''}
                  onChange={(e) => {
                    const updatedAppt = { ...citaActual, lector2: e.target.value || null };
                    setCitaActual(updatedAppt);
                  }}
                >
                  <option value="">Seleccione un lector</option>
                  {lectores.map((lector) => (
                    <option key={lector.id} value={lector.id}>
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
                  value={citaActual.horaInicio}
                  onChange={(e) => {
                    const updatedTime = e.target.value;
                    const updatedCita = {
                      ...citaActual,
                      horaInicio: updatedTime,
                      horaFin: getEndDate(updatedTime),
                    };
                    setCitaActual(updatedCita);
                  }}
                  step="300" // 300 seconds = 5 minutes
                />
              </label>

              <div className="modal-actions">
                <button className="cita-btn cita-btn-error w-50" onClick={() => deleteCita(citaActual)}>Eliminiar</button>
                <button className="cita-btn w-50" onClick={() => updateCita(citaActual)}>Guardar</button>
                <button className="cita-btn w-50" onClick={() => setModal(false)}>Cancelar</button>
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
