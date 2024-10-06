import React, { useState } from 'react';
import '../styles/Citas.css';

const Citas = () => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  const handleAsignar = () => {
    if (!date || !startTime) {
      setError('Por favor complete todos los campos antes de asignar la cita.');
      return;
    }
    setError('');

    const addOneHour = (time) => {
      const [hours, minutes] = time.split(':');
      let endHour = parseInt(hours, 10) + 1;
      if (endHour === 24) endHour = 0;
      return `${endHour.toString().padStart(2, '0')}:${minutes}`;
    };

    const newAppointment = {
      date,
      timeRange: `${startTime} - ${addOneHour(startTime)}`,
      student: 'N/A',
      lector1: 'N/A',
      lector2: 'N/A',
      project: 'N/A',
    };

    setAppointments([...appointments, newAppointment]);
    setDate('');
    setStartTime('');
  };

  const createReport = () => {
    //descargar pdf
  };

  return (
    <div className="citas-form container">
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
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
            </div>

            <div className="col-12">
              <label>
                Hora:
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  step="300" // 300 seconds = 5 minutes
                />
              </label>
            </div>

            <div className="col-12 d-flex justify-content-center">
              <button className="cita-btn w-50" onClick={handleAsignar}>Guardar cita</button>
            </div>

            <div className="col-12">
              {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
            </div>

          </div>
        </div>
      </div>

      {/* Table */}
      <div className="cita-table row justify-content-center">
        <div className="row justify-content-center mb-3">
          <h2 className="col-5 w-auto m-0">Lista de citas</h2>
        </div>

        <div className="row d-flex justify-content-center mb-3">
          <button className="cita-btn col-2" onClick={createReport}>Generar reporte</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Día</th>
              <th>Hora</th> {/* Single column for time range */}
              <th>Estudiante</th>
              <th>Lector 1</th>
              <th>Lector 2</th>
              <th>Proyecto</th>
            </tr>
          </thead>

          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  No hay citas asignadas.
                </td>
              </tr>
            ) : (
              appointments.map((appointment, index) => (
                <tr key={index}>
                  <td>{appointment.date}</td>
                  <td>{appointment.timeRange}</td>
                  <td>{appointment.student}</td>
                  <td>{appointment.lector1}</td>
                  <td>{appointment.lector2}</td>
                  <td>{appointment.project}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Citas;
