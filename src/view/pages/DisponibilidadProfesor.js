import "../styles/Calendario.css";
import { useState, useEffect } from "react";
import Header from '../components/HeaderProfesor';
import Footer from '../components/Footer';
import supabase from "../../model/supabase";

const DisponibilidadProfesor = () => {
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [disponibilidadProfesor, setDisponibilidadProfesor] = useState({
    dia: '',
    horaInicio: '',
    horaFin: ''
  });
  const usuarioId = sessionStorage.getItem('token');
  const [profesorId, setProfesorId] = useState(0);

  useEffect(() => {
    const fetchDisponibilidad = async () => {
      try {
        const data = await supabase
          .from('Profesor')
          .select('profesor_id')
          .eq('id_usuario', usuarioId);

        const disponibilidad = await supabase
          .from('disponibilidad')
          .select('*')
          .eq('profesor_id', data.data[0].profesor_id);

        setProfesorId(data.data[0].profesor_id);
        setDisponibilidad(disponibilidad.data);

      } catch (error) {
        console.error('Error:', error.message);
      }
    };

    fetchDisponibilidad();
  }, [usuarioId]);

  const handleChange = (field, value) => {
    console.log(field, value);
    setDisponibilidadProfesor(prevEvent => ({
      ...prevEvent,
      [field]: value
    }));
  };

  const handleAgregarDisponibilidad = async () => {
    try {
      console.log(disponibilidadProfesor);
      const { data } = await supabase
        .from('disponibilidad')
        .insert([
            {
                profesor_id: profesorId,
                hora_inicio: disponibilidadProfesor.horaInicio,
                hora_fin: disponibilidadProfesor.horaFin,
                dia: disponibilidadProfesor.dia
            }
        ])
        .select();

      setDisponibilidad((prev) => [...prev, data[0]]);
      
      setDisponibilidadProfesor({
        dia: '',
        horaInicio: '',
        horaFin: ''
      });
    } catch (error) {
      alert(`Error al agregar evento: ${error.message}`);
    }
  };

  const handleEliminarDisponibilidad = async (id) => {
    try {
      await supabase.from('disponibilidad').delete().eq('id', id);
      setDisponibilidad(disponibilidad.filter(event => event.id !== id));
    } catch (error) {
      alert(`Error al eliminar evento: ${error.message}`);
    }
  };

  return (
    <div>
      <Header title="Disponibilidad" />
      <div className="content-container">
        <div className="table-container">
          <table className="calendario-table">
            <thead>
              <tr>
                <th>Día</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th>¿Eliminar?</th>
              </tr>
            </thead>
            <tbody>
              {disponibilidad.map((disp) => (
                <tr key={disp.id}>
                  <td>{disp.dia}</td>
                  <td>{disp.hora_inicio}</td>
                  <td>{disp.hora_fin}</td>
                  <td>
                    <button
                      className="btn-delete-event" 
                      onClick={() => handleEliminarDisponibilidad(disp.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-container">
          <h3>Agregar Nueva Disponibilidad para Defensas</h3>
          <div className="input-row">
            {/* Día con selector de fecha */}
            <div className="input-container-gestion">
              <label htmlFor="dia">Día</label>
              <input
                type="date"
                name="dia"
                className="input-field-gestion"
                value={disponibilidadProfesor.dia}
                onChange={(e) => handleChange('dia', e.target.value)}
              />
            </div>

            {/* Hora Inicio */}
            <div className="input-container-gestion">
              <label htmlFor="horaInicio">Hora Inicio</label>
              <input
                type="time"
                name="horaInicio"
                className="input-field-gestion"
                value={disponibilidadProfesor.horaInicio}
                onChange={(e) => handleChange('horaInicio', e.target.value)}
              />
            </div>

            {/* Hora Fin */}
            <div className="input-container-gestion">
              <label htmlFor="horaFin">Hora Fin</label>
              <input
                type="time"
                name="horaFin"
                className="input-field-gestion"
                value={disponibilidadProfesor.horaFin}
                onChange={(e) => handleChange('horaFin', e.target.value)}
              />
            </div>
          </div>

          {/* Botón para agregar disponibilidad */}
          <button className="btn-add-event" onClick={handleAgregarDisponibilidad}>
            Agregar Disponibilidad
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DisponibilidadProfesor;
