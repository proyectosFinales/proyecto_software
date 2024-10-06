import React, { useState } from 'react';
import '../styles/Citas.css';
import Modal from './components/Modal'; // Import the modal component

const Citas = () => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const lecturers = ['Profesor A', 'Profesor B', 'Profesor C']; // Example lecturers

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

  const handleRowClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const updateAppointment = (modifiedAppointment) => {
    const updatedAppointments = appointments.map((appt) =>
      appt === selectedAppointment ? modifiedAppointment : appt
    );
    
    setAppointments(updatedAppointments); // Update the appointment in the state
    setSelectedAppointment(null); // Clear the selected appointment
    setShowModal(false); // Close the modal
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
              appointments.map((appointment, index) => (
                <tr key={index} onClick={() => handleRowClick(appointment)}>
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

      {/* Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        {selectedAppointment && (
          <>
            <h2>Editar Cita</h2>
            <p><strong>Estudiante:</strong> {selectedAppointment.student}</p>

            <label>
              Profesor lector 1:
              <select
                name="lector1"
                value={selectedAppointment.lector1}
                onChange={(e) => {
                  const updatedAppt = { ...selectedAppointment, lector1: e.target.value };
                  setSelectedAppointment(updatedAppt);
                }}
              >
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
                value={selectedAppointment.lector2}
                onChange={(e) => {
                  const updatedAppt = { ...selectedAppointment, lector2: e.target.value };
                  setSelectedAppointment(updatedAppt);
                }}
              >
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
                value={selectedAppointment.timeRange.split(' - ')[0]} // Start time
                onChange={(e) => {
                  const endTime = selectedAppointment.timeRange.split(' - ')[1];
                  const updatedAppt = {
                    ...selectedAppointment,
                    timeRange: `${e.target.value} - ${endTime}`,
                  };
                  setSelectedAppointment(updatedAppt);
                }}
              />
            </label>

            <div className="modal-actions">
              <button onClick={() => updateAppointment(selectedAppointment)}>Guardar</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Citas;
