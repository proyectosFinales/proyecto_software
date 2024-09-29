import React, { useState } from 'react';
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import '../styles/Citas.css';  // Ensure this contains the calendar styles mentioned earlier

const Citas = () => {
  const [date, setDate] = useState(new Date());

  return (
    <div className="citas-container">
      <div className="row">

        <div className="col-6">
          {/* Calendar section */}
          <div className="calendar-section">
            <Calendar onChange={setDate} value={date} />
          </div>
        </div>
        <div className="col-6">
          {/* Cita form section */}
          <div className="cita-form">
            <h2>Información de la cita</h2>
            <label>
              Hora de inicio:
              <input type="time" defaultValue="08:00" step="300" /> {/* Step of 300 seconds = 5 minutes */}
            </label>
            <label>
              Hora de cierre:
              <input type="time" defaultValue="11:00" step="300" />
            </label>
            <button>Asignar</button>
          </div>
        </div>



      </div>

      {/* Cita table section */}
      <div>
      <div className="cita-table">
        <h2>Lista de citas</h2>
        <table>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Lector 1</th>
              <th>Lector 2</th>
              <th>Proyecto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Estudiante 1</td>
              <td>Lector 1</td>
              <td>Lector 2</td>
              <td>Proyecto 1</td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default Citas;
