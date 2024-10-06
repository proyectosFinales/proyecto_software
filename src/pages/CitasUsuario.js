import React, { useState } from 'react';
import '../styles/Citas.css';

const CitasUsuario = () => {
  const [appointments, setAppointments] = useState([
    { date: '2024-09-29', time: '9:00 AM', available: false },
    { date: '2024-09-29', time: '10:00 AM', available: false },
    { date: '2024-09-29', time: '11:00 AM', available: false },
    { date: '2024-09-29', time: '12:00 PM', available: false },
    { date: '2024-09-29', time: '1:00 PM', available: false },
    { date: '2024-09-29', time: '2:00 PM', available: false },
  ]);

  const handleCheckboxChange = (index) => {
    const newAppointments = [...appointments];
    newAppointments[index].available = !newAppointments[index].available;
    setAppointments(newAppointments);
  };

  const selectAll = () => {
    const newAppointments = appointments.map(appointment => ({
      ...appointment,
      available: true,
    }));
    setAppointments(newAppointments);
  };

  const deselectAll = () => {
    const newAppointments = appointments.map(appointment => ({
      ...appointment,
      available: false,
    }));
    setAppointments(newAppointments);
  };

  return (
    <div className="container cita-table">
      {/* Tabla de citas */}
      <div className="row justify-content-center">
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
            {appointments.map((appointment, index) => (
              <tr key={index}>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={appointment.available}
                    onChange={() => handleCheckboxChange(index)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botones para guardar/vovler */}
      <div className="row justify-content-center">
        <div className="col-auto">
          <button className="cita-btn" onClick={selectAll}>Guardar</button>
        </div>
        <div className="col-auto">
          <button className="cita-btn-secondary" onClick={deselectAll}>Vovler</button>
        </div>
      </div>
    </div>
  );
};

export default CitasUsuario;
