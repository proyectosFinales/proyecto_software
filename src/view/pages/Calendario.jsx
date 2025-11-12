import "../styles/Calendario.css";
import {useState, useEffect} from "react";
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import SettingsCoordinador from '../components/SettingsCoordinador';
import { getEventos, addEvento, deleteEvento, updateEvento, getTipoEventos, addTipoEvento } from '../../controller/Calendario';
import { generarPDFCalendario } from '../../controller/DescargarPDF';

const Calendario = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [editableEvent, setEditableEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ nombre: '', fechaInicio: '', fechaFin: '' });
  const [eventOptions2, setEventOptions2] = useState([]);
  const [createEvent, setCreateEvent] = useState({ nombre: '' });

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

    //Llenamos los tipos de eventos para el combobo
    const pedirEventos = async () => {
      const tipos = await getTipoEventos();
      setEventOptions2(tipos.map(event => ({
        value: event.nombre,
        label: event.nombre
      })));
    }

    fetchEventos();
    pedirEventos();
  }, []);
  
  const handleInputChange = (field, value) => {
    if (field === 'fechaInicio' 
      && editableEvent.fechaFin 
      && new Date(value) > new Date(editableEvent.fechaFin)) {
      setEditableEvent(prevEvent => ({
        ...prevEvent,
        [field]: value,
        fechaFin: value
      }));
    } else { 
      setEditableEvent(prevEvent => ({
        ...prevEvent,
        [field]: value
      }));
    }
  };

  const handleNewEventChange = (field, value) => {
    if (field === 'fechaInicio' 
      && newEvent.fechaFin 
      && new Date(value) > new Date(newEvent.fechaFin)) {
      setNewEvent(prevEvent => ({
        ...prevEvent,
        [field]: value,
        fechaFin: value
      }));
    } else { 
      setNewEvent(prevEvent => ({
        ...prevEvent,
        [field]: value
      }));
    }
  };

  const handleSave = async (id) => {
    try {
      const updatedEvent = {
        nombre: editableEvent.nombre,
        fecha_inicio: editableEvent.fechaInicio,
        fecha_fin: editableEvent.fechaFin
      };
      const data = await updateEvento(id, updatedEvent);
      setEvents(events.map(event => (event.id === id ? editableEvent : event)));
      setEditableEvent(null);
    } catch (error) {
      alert(`Error al actualizar evento: ${error.message}`);
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`¿Está seguro que desea eliminar el evento ${event.nombre}?`)) return;
    try {
      await deleteEvento(event.id);
      setEvents(events.filter(e => event.id !== e.id));
    } catch (error) {
      alert(`Error al eliminar evento: ${error.message}`);
    }
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
      alert(`Error al agregar evento: ${error.message}`);
    }
  };

  const handleCreateEvent = async () => {
    try {
      if(createEvent.nombre === '' || createEvent.nombre === ' ') {
        alert("El nombre no puede estar vacio.");
        return;
      }
      const data = await addTipoEvento({ nombre:createEvent.nombre });
      alert("Evento creado con exito.");
      window.location.reload();
    } catch (error) {
      alert(`Error al crear tipo de evento: ${error.message}`);
    }
  };

  const handleCreateEventChange = (field, value) => {
    if(field === 'nombreNuevoEvento'){
      setCreateEvent({ nombre: value});
      console.log("Cambio el input: ", value);
    }
  };

  const handleReporteCalendario = () => {
    generarPDFCalendario(events);
  }

  return (
    <div>
      <Header title="Calendario" />
      <SettingsCoordinador show={isMenuOpen} />
      <div className="content-container">

        <div className="form-container">
          <h3>Crear Evento</h3>
          <div className="input-row">
            <div>
              <label htmlFor="nombreNuevoEvento">Nombre del evento</label>
              <input
                name="nombreNuevoEvento"
                type="text"
                className="input-field-text"
                placeholder="Digite el nuevo evento"
                onChange={(e) => handleCreateEventChange('nombreNuevoEvento', e.target.value)}
              />
            </div>
            <button className="btn-create-event" onClick={handleCreateEvent}>Crear evento</button>
          </div>
          <h3>Agregar Nuevo Evento</h3>
          <div className="input-container-gestion">
            <select
              name="nombre"
              className="input-field-gestion"
              value={newEvent.nombre}
              onChange={(e) => handleNewEventChange('nombre', e.target.value)}
            >
              <option value="">Seleccione un evento</option>
              {eventOptions2.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="input-row">
            <div>
              <label htmlFor="fechaInicio">Fecha Inicio</label>
              <input
                type="date"
                name="fechaInicio"
                className="input-field-fechas"
                value={newEvent.fechaInicio}
                onChange={(e) => handleNewEventChange('fechaInicio', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="fechaFin">Fecha Fin</label>
              <input
                type="date"
                name="fechaFin"
                className="input-field-fechas"
                value={newEvent.fechaFin}
                min={newEvent.fechaInicio}
                onChange={(e) => handleNewEventChange('fechaFin', e.target.value)}
              />
            </div>
            <button className="btn-add-event" onClick={handleAddEvent}>Agregar Evento</button>
            <button
              className="btn-add-event bg-indigo-600 text-white rounded hover:bg-indigo-700"
              onClick={handleReporteCalendario}
            >
              Generar Reporte
            </button>
          </div>
        </div>


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
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                      >
                        {eventOptions2.map(option => (
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
                        onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
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
                        min={editableEvent.fechaInicio}
                        onChange={(e) => handleInputChange('fechaFin', e.target.value)}
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
                      <button className="btn-edit-event" onClick={() => setEditableEvent(event)}>
                        <i className="fas fa-edit"></i> Editar
                        </button>
                    )}
                    <button className="btn-delete-event" onClick={() => handleDelete(event)}>
                      <i className="fas fa-trash"></i> Borrar
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        

      </div>
      <Footer />
    </div>
  );
};

export default Calendario;