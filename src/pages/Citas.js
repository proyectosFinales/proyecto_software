import React, { useState } from 'react';
import '../styles/Citas.css';
import Modal from './components/Modal';

const Citas = () => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const lecturers = [null, 'Profesor A', 'Profesor B', 'Profesor C'];

  const addOneHour = (time) => {
    const [hours, minutes] = time.split(':');
    let endHour = parseInt(hours, 10) + 1;
    if (endHour === 24) endHour = 0;
    return `${endHour.toString().padStart(2, '0')}:${minutes}`;
  };

  const formatTimeAMPM = (time) => {
    let [hour, minute] = time.split(':');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const formatDateDDMMYYYY = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleAsignar = () => {
    if (!date || !startTime) {
      setError('Por favor complete todos los campos antes de asignar la cita.');
      return;
    }
    setError('');

    const newAppointment = {
      id: appointments.length + 1,
      date: formatDateDDMMYYYY(date),
      timeRange: `${formatTimeAMPM(startTime)} - ${formatTimeAMPM(addOneHour(startTime))}`,
      student: null,
      lector1: null,
      lector2: null,
      projectName: null,
      projectDescription: 'Lorem ipsum dolor sit amet...',
    };

    setAppointments([...appointments, newAppointment]);
    setDate('');
    setStartTime('');
  };

  const handleRowClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const updateAppointment = (modifiedAppointment) => {
    const updatedAppointments = appointments.map((appt) =>
      appt.id === modifiedAppointment.id ? modifiedAppointment : appt
    );

    setAppointments(updatedAppointments);
    setSelectedAppointment(null);
    setShowModal(false);
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
                  className="styled-input"
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
                  className="styled-input"
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

        <table>
          <thead>
            <tr>
              <th>Día</th>
              <th>Hora</th>
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
              appointments.map((appointment) => (
                <tr key={appointment.id} onClick={() => handleRowClick(appointment)}>
                  <td>{appointment.date}</td>
                  <td>{appointment.timeRange}</td>
                  <td>{appointment.student ? appointment.student : 'N/A'}</td>
                  <td>{appointment.lector1 ? appointment.lector1 : 'N/A'}</td>
                  <td>{appointment.lector2 ? appointment.lector2 : 'N/A'}</td>
                  <td>{appointment.projectName ? appointment.projectName : 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        {selectedAppointment && (
          <>
            <h2>Editar Cita</h2>
            <p><strong>Estudiante:</strong> {selectedAppointment.student ? selectedAppointment.student : 'N/A'}</p>

            <p><strong>Descripción del proyecto:</strong> {selectedAppointment.projectDescription}</p>

            <label>
              Profesor lector 1:
              <select
                name="lector1"
                className="styled-input"
                value={selectedAppointment.lector1 || ''}
                onChange={(e) => {
                  const updatedAppt = { ...selectedAppointment, lector1: e.target.value || null };
                  setSelectedAppointment(updatedAppt);
                }}
              >
                <option value="">N/A</option>
                {lecturers.map((lecturer, index) => (
                  <option key={index} value={lecturer}>
                    {lecturer}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Profesor lector 2:
              <select
                name="lector2"
                className="styled-input"
                value={selectedAppointment.lector2 || ''}
                onChange={(e) => {
                  const updatedAppt = { ...selectedAppointment, lector2: e.target.value || null };
                  setSelectedAppointment(updatedAppt);
                }}
              >
                <option value="">N/A</option>
                {lecturers.map((lecturer, index) => (
                  <option key={index} value={lecturer}>
                    {lecturer}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Hora de la cita:
              <input
                type="time"
                name="timeRange"
                className="styled-input"
                value={selectedAppointment.timeRange.split(' - ')[0]}
                onChange={(e) => {
                  const newStartTime = e.target.value;
                  const newEndTime = addOneHour(newStartTime);
                  const updatedAppt = {
                    ...selectedAppointment,
                    timeRange: `${formatTimeAMPM(newStartTime)} - ${formatTimeAMPM(newEndTime)}`,
                  };
                  setSelectedAppointment(updatedAppt);
                }}
              />
            </label>

            <div className="modal-actions">
              <button className="cita-btn w-25" onClick={() => updateAppointment(selectedAppointment)}>Guardar</button>
              <button className="cita-btn-secondary w-25" onClick={() => setShowModal(false)}>Cerrar</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Citas;
