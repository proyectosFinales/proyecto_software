import "../styles/Calendario.css";
import {useState, useEffect, useRef } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import SettingsCoordinador from '../components/SettingsCoordinador';
import { getEventos, addEvento, deleteEvento, updateEvento, getTipoEventos, addTipoEvento, deleteTipoEvento } from '../../controller/Calendario';
import { generarExcelCalendario } from '../../controller/DescargarPDF';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../components/modal.jsx";
{/* Modal para usarlo como confirmacion, y no usar el window.confirm que se ve feo */}

const Calendario = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [editableEvent, setEditableEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ nombre: '', fechaInicio: '', fechaFin: '' });
  const [eventOptions2, setEventOptions2] = useState([]);
  const [createEvent, setCreateEvent] = useState({ nombre: '' });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  // Constantes para trabajar con los modales
  const [selectedTypeEvent, setSelectedTypeEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const modalTipoEvento = useRef({});
  const modalEvento = useRef({});

  useEffect(() => {
    // Para mostrar los toast guardados, cuando se hace a la par de un window.reload
    if (localStorage.getItem("showToast")) {
      toast.success("Evento creado con exito.");
      localStorage.removeItem("showToast");
    }

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
        toast.error(`Error al obtener los eventos del calendario: ${error.message}`);
      }
    };

    //Llenamos los tipos de eventos para el combobox
    const pedirTiposEventos = async () => {
      try {
        const tipos = await getTipoEventos();
        setEventOptions2(tipos.map(event => ({
          id: event.id,
          value: event.nombre,
          label: event.nombre
        })));
      } catch (error) {
        toast.error(`Error al obtener los tipos de eventos: ${error.message}`);
      }
    }

    fetchEventos();
    pedirTiposEventos();
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
      toast.error(`Error al actualizar evento: ${error.message}`);
    }
  };

  const handleDelete = async (event) => {
    try {
      await deleteEvento(event.id);
      setEvents(events.filter(e => event.id !== e.id));
      toast.success(`Evento "${event.nombre}" eliminado con éxito.`);
      modalEvento.close();
    } catch (error) {
      toast.error(`Error al eliminar evento: ${error.message}`);
    }
  };

  const handleDeleteTipoEvento = async (event) => {
    try {
      await deleteTipoEvento(event.id);
      setEventOptions2(eventOptions2.filter(e => event.id !== e.id));
      toast.success(`Tipo de evento "${event.value}" eliminado con éxito.`);
      modalTipoEvento.close();
    } catch (error) {
      toast.error(`Error al eliminar tipo de evento: ${error.message}`);
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
      toast.error(`Error al agregar evento: ${error.message}`);
    }
  };

  const handleCreateEvent = async () => {
    try {
      if(createEvent.nombre === '' || createEvent.nombre === ' ') {
        toast.error("El nombre no puede estar vacio.");
        return;
      }
      if(eventOptions2.map(event => (event.value.toLowerCase() === createEvent.nombre.toLowerCase())).includes(true)){
        toast.error("El evento que está tratando de ingresar ya existe.");
        return;
      }
      const data = await addTipoEvento({ nombre:createEvent.nombre });
      localStorage.setItem("showToast", "true");
      window.location.reload();
    } catch (error) {
      toast.error(`Error al crear tipo de evento: ${error.message}`);
    }
  };

  const handleCreateEventChange = (field, value) => {
    if(field === 'nombreNuevoEvento'){
      setCreateEvent({ nombre: value});
    }
  };

  const handleReporteCalendario = () => {
    generarExcelCalendario(events);
  }

  return (
    <div>
      <Header title="Calendario" />
      <SettingsCoordinador show={isMenuOpen} />
      <div className="content-container">

        <div className="form-container">
          {/* Un unico modal, especifico para los tipos de elementos */}
          <Modal modalRef={modalTipoEvento} title={<h5>Eliminar un Tipo de Evento</h5>} onAccept={() => handleDeleteTipoEvento(selectedTypeEvent)}>
            <p>¿Está seguro que desea eliminar el tipo de evento "{selectedTypeEvent?.value}"?</p>
          </Modal>
          {/* ------------------------------------------------
          Modal para agregar los tipos de eventos a la BD
          ------------------------------------------------ */}
          {modalIsOpen && (
            <div className="modal-overlay" onClick={() => setModalIsOpen(false)} >
              <div className="event-modal" onClick={(e) => e.stopPropagation()}>

                {/* Contenedor que contiene el titulo y boton de salida */}
                <div className="event-modal-header" >
                  <h2>Gestionar Tipos de Eventos</h2>
                  <button className="btn-close-modal" onClick={() => setModalIsOpen(false)}>
                    <FaTimes/>
                  </button>
                </div>
                
                {/* Contenedor que contiene la tabla con los tipos de eventos. */}
                <div className="event-modal-content">
                  <div className="input-row">
                    <div>
                      <label htmlFor="nombreNuevoEvento">Nombre del evento</label>
                      <input name="nombreNuevoEvento" type="text" className="input-field-text"
                        placeholder="Digite el nuevo evento"
                        onChange={(e) => handleCreateEventChange('nombreNuevoEvento', e.target.value)}
                      />
                    </div>
                    <button className="btn-create-event" onClick={handleCreateEvent}>Crear evento</button>
                  </div>

                  <div className="event-modal-content-table">
                    <table className="calendario-table-modal">
                      <thead>
                        <tr>
                          <th>Tipo de evento</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventOptions2.map(event => (
                          <tr key={event.id}>
                            <td>
                                {event.value}
                            </td>
                            <td>
                              <button className="btn-delete-event" onClick={() => {setSelectedTypeEvent(event); modalTipoEvento.open();}}>
                                <i className="fas fa-trash"></i> Borrar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>            
            </div>
          )}

          {/* --------------------------------------------------------------
          Seccion donde agrega los eventos al calendario, usando las fechas.
          ------------------------------------------------------------------ */}
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
                <option key={option.id} value={option.value}>{option.label}</option>
              ))}
            </select>
            {/* Para gestionar los tipos de eventos, click aqui */}
            <button onClick={() => setModalIsOpen(true)}>
              <FaPlus style={{ marginLeft: "8px", marginRight: "8px" }} />
            </button>
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
          {/* Modal especifico para eventos del calendario */}
          <Modal modalRef={modalEvento} title={<h5>Eliminar Eventos</h5>} onAccept={() => handleDelete(selectedEvent)}>
            <p>¿Está seguro que desea eliminar el evento "{selectedEvent?.nombre}"?</p>
          </Modal>
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
                    <button className="btn-delete-event" onClick={() => {setSelectedEvent(event); modalEvento.open();}}>
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