import "../styles/Calendario.css";
import {useState, useEffect} from "react";
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import SettingsCoordinador from '../components/SettingsCoordinador';
import { getEventos, addEvento } from '../../controller/Calendario';

const Calendario = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const eventOptions = [
    { value: '', label: 'Seleccione un evento' },
    { value: 'Entrega Avance 1', label: 'Entrega Avance 1' },
    { value: 'Entrega Avance 2', label: 'Entrega Avance 2' },
    { value: 'Entrega Avance 3', label: 'Entrega Avance 3' },
    { value: 'Plazo para establecer disponibilidad', label: 'Plazo para establecer disponibilidad' },
    { value: 'Defensas', label: 'Defensas' },
    { value: 'Actas', label: 'Actas' }
  ]
  const [events, setEvents] = useState([]);
  const [editableEvent, setEditableEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ nombre: '', fechaInicio: '', fechaFin: '' });

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const data = await getEventos();
        setEvents(data.map(event => ({
          id: event.calendario_id,
          nombre: event.nombre,
          fechaInicio: event.fecha_inicio,
          fechaFin: event.fecha_fin
        })));
      } catch (error) {
        console.error('Error fetching events:', error.message);
      }
    };

    fetchEventos();
  }, []);
  
  const handleInputChange = (id, field, value) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, [field]: value } : event
    ));
  };

  const handleNewEventChange = (field, value) => {
    setNewEvent(prevEvent => ({
      ...prevEvent,
      [field]: value
    }));
  };

  const handleEdit = (event) => {
    setEditableEvent(event);
  };

  const handleSave = (id) => {
    setEditableEvent(null);
  };

  const handleDelete = (id) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const handleAddEvent = async () => {
    try {
      const data = await addEvento({
        nombre: newEvent.nombre,
        fecha_inicio: newEvent.fechaInicio,
        fecha_fin: newEvent.fechaFin
      });
      setEvents([...events, {
        id: data.calendario_id, 
        nombre: data.nombre, 
        fechaInicio: data.fecha_inicio, 
        fechaFin: data.fecha_fin
      }]);
      setNewEvent({ nombre: '', fechaInicio: '', fechaFin: '' });
    } catch (error) {
      alert('Error adding event:', error.message);
    }
  };

  return (
    <div>
      <Header title="Calendario" />
      <SettingsCoordinador show={isMenuOpen} />
      <div className="content-container">
        <div className="table-container">
          <table className="calendario-table">
            <thead>
              <tr>
                <th>Nombre del evento</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td>
                    {editableEvent?.id === event.id ? (
                      <select
                        value={editableEvent.nombre}
                        onChange={(e) => handleInputChange(editableEvent.id, 'nombre', e.target.value)}
                      >
                        {eventOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    ) : (
                      event.nombre
                    )}
                  </td>
                  <td>
                    {editableEvent?.id === event.id ? (
                      <input
                        type="date"
                        value={editableEvent.fechaInicio}
                        onChange={(e) => handleInputChange(editableEvent.id, 'fechaInicio', e.target.value)}
                      />
                    ) : (
                      event.fechaInicio
                    )}
                  </td>
                  <td>
                    {editableEvent?.id === event.id ? (
                      <input
                        type="date"
                        value={editableEvent.fechaFin}
                        onChange={(e) => handleInputChange(editableEvent.id, 'fechaFin', e.target.value)}
                      />
                    ) : (
                      event.fechaFin
                    )}
                  </td>
                  <td>
                    {editableEvent?.id === event.id ? (
                      <button className="btn-save-event" onClick={() => handleSave(event.id)}>
                        <i className="fas fa-save"></i> Guardar
                        </button>
                    ) : (
                      <button className="btn-edit-event" onClick={() => handleEdit(event)}>
                        <i className="fas fa-edit"></i> Editar
                        </button>
                    )}
                    <button className="btn-delete-event" onClick={() => handleDelete(event.id)}>
                      <i className="fas fa-trash"></i> Borrar
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="form-container">
          <h3>Agregar Nuevo Evento</h3>
          <div className="input-container-gestion">
            <select
              name="nombre"
              className="input-field-gestion"
              value={newEvent.nombre}
              onChange={(e) => handleNewEventChange('nombre', e.target.value)}
            >
              <option value="">Seleccione un evento</option>
              {eventOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="input-container-gestion">
            <input
              type="date"
              name="fechaInicio"
              className="input-field-gestion"
              value={newEvent.fechaInicio}
              onChange={(e) => handleNewEventChange('fechaInicio', e.target.value)}
            />
          </div>
          <div className="input-container-gestion">
            <input
              type="date"
              name="fechaFin"
              className="input-field-gestion"
              value={newEvent.fechaFin}
              onChange={(e) => handleNewEventChange('fechaFin', e.target.value)}
            />
          </div>
          <button className="btn-add-event" onClick={handleAddEvent}>Agregar Evento</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Calendario;