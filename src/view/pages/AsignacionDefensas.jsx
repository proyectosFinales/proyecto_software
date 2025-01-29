import React, { useEffect, useState } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Your usual layout components (optional)
import Header from "../components/HeaderCoordinador";
import Footer from "../components/Footer";
import { successToast, errorToast } from "../components/toast";
import supabase from "../../model/supabase"; 

// Our advanced controller
import {
  assignAllDefensas,
  listAllCitas,
  updateCita,
} from "../../controller/AsignacionDefensaController";

/**
 * A single page that:
 * 1) Lists "pending" projects needing a defense
 * 2) Lets you "assign all defenses" automatically
 * 3) Displays a "calendar" of existing Citas
 * 4) Allows manual editing of any Cita (change slot, lectores)
 */
const AsignacionDefensas = () => {
  // State for "pending" projects
  const [pendingProjects, setPendingProjects] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [assigningInProgress, setAssigningInProgress] = useState(false);

  // For showing results of assignment
  const [assignedCount, setAssignedCount] = useState(0);
  const [unassignedReasons, setUnassignedReasons] = useState([]);

  // State for all Citas, to show in a "calendar" table
  const [allCitas, setAllCitas] = useState([]);

  // For editing a specific Cita
  const [editCitaId, setEditCitaId] = useState(null); // which cita are we editing?
  const [editDisponibilidadId, setEditDisponibilidadId] = useState("");
  const [editLector1, setEditLector1] = useState("");
  const [editLector2, setEditLector2] = useState("");

  // Some reference data for building the update form:
  const [allDisponibilidades, setAllDisponibilidades] = useState([]);
  const [allProfesores, setAllProfesores] = useState([]);

  // New state for calendar
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [citasByDate, setCitasByDate] = useState({});
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Add this constant for all possible time slots
  const ALL_TIME_SLOTS = [
    { start: "07:30:00", end: "09:30:00" },
    { start: "09:30:00", end: "11:30:00" },
    { start: "11:30:00", end: "13:30:00" },
    { start: "13:30:00", end: "15:30:00" },
    { start: "15:30:00", end: "17:30:00" },
    { start: "17:30:00", end: "19:30:00" }
  ];

  // Add new state for creating a new cita
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");

  /* =========================================
      1) On mount, fetch pending + citas
  ========================================== */
  useEffect(() => {
    fetchPendingDefensas();
    fetchAllCitas();
    fetchRefData(); // fetch all disponibilidades, profesores, etc. for the form
  }, []);

  /**
   * 1.1) Fetch projects that have "Aprobado"+"Defensa" and no existing Cita
   */
  async function fetchPendingDefensas() {
    try {
      setStatusMessage("Buscando proyectos pendientes de defensa...");
      const { data: projects, error } = await supabase
        .from("Proyecto")
        .select(`
          id,
          estado,
          estudiante_id,
          profesor_id,
          Estudiante:estudiante_id (
            estudiante_id,
            estado,
            Usuario:id_usuario (
              nombre
            )
          ),
          Profesor:profesor_id (
            profesor_id,
            Usuario:id_usuario (
              nombre
            )
          )
        `);

      if (error) {
        console.error("Error fetching projects:", error);
        setStatusMessage("Error al buscar proyectos.");
        return;
      }

      // Filter
      const filtered = [];
      for (const p of projects) {
        const projState = p.estado?.toLowerCase();
        const studState = p.Estudiante?.estado?.toLowerCase();

        if (projState === "aprobado" && studState === "defensa") {
          // check no existing Cita
          const { data: existingCita } = await supabase
            .from("Cita")
            .select("cita_id")
            .eq("proyecto_id", p.id)
            .maybeSingle();
          if (!existingCita) {
            filtered.push(p);
          }
        }
      }

      setPendingProjects(filtered);
      if (filtered.length === 0) {
        setStatusMessage("No hay proyectos pendientes de defensa.");
      } else {
        setStatusMessage(`Se encontraron ${filtered.length} proyecto(s) pendiente(s) de defensa.`);
      }
    } catch (err) {
      console.error("Error in fetchPendingDefensas:", err);
      setStatusMessage("Ocurrió un error al buscar proyectos.");
    }
  }

  /**
   * 1.2) Fetch all existing Citas => "calendar"
   */
  async function fetchAllCitas() {
    try {
      const citasData = await listAllCitas();
      setAllCitas(citasData);
    } catch (err) {
      console.error("Error fetching all Citas:", err);
    }
  }

  /**
   * 1.3) Fetch any reference data we might need (e.g. all "disponibilidad", all "profesores")
   * for building dropdowns in the "update cita" form.
   */
  async function fetchRefData() {
    try {
      // All disponibilidades
      const { data: dispData, error: dispErr } = await supabase
        .from("disponibilidad")
        .select("id, profesor_id, dia, hora_inicio, hora_fin");
      if (dispErr) throw dispErr;
      setAllDisponibilidades(dispData || []);

      // All profesores
      const { data: profData, error: profErr } = await supabase
        .from("Profesor")
        .select(`
          profesor_id,
          Usuario:id_usuario (
            nombre
          )
        `);
      if (profErr) throw profErr;
      setAllProfesores(profData || []);
    } catch (err) {
      console.error("Error in fetchRefData:", err);
    }
  }

  /* =========================================
      2) Handle "Assign All Defensas"
  ========================================== */
  async function handleAssignDefensas() {
    try {
      setAssigningInProgress(true);
      setStatusMessage("Asignando defensas, revisa la consola para detalles...");

      const result = await assignAllDefensas(); 
      // => { assigned, unassigned: [] }

      setAssignedCount(result.assigned || 0);
      setUnassignedReasons(result.unassigned || []);

      // Show some toast
      if (result.assigned > 0) {
        successToast(`¡Asignadas ${result.assigned} defensa(s) exitosamente!`);
      } else {
        successToast("No se asignaron defensas nuevas (posiblemente no hubo disponibilidad).");
      }

      // Refresh everything
      await fetchPendingDefensas();
      await fetchAllCitas();
      setStatusMessage("Proceso de asignación finalizado.");
    } catch (err) {
      console.error("Error assigning defensas:", err);
      errorToast("Ocurrió un error asignando las defensas: " + err.message);
    } finally {
      setAssigningInProgress(false);
    }
  }

  /* =========================================
      3) "Calendar" - Show all Citas in a table
      and provide an "Edit" button
  ========================================== */

  function handleEditClick(cita) {
    // populate form with existing values
    setEditCitaId(cita.cita_id || null);
    setEditDisponibilidadId(cita.disponibilidad_id || "");
    setEditLector1(cita.lector1Id || "");
    setEditLector2(cita.lector2Id || "");
  }

  function handleCancelEdit() {
    setEditCitaId(null);
    setEditDisponibilidadId("");
    setEditLector1("");
    setEditLector2("");
  }

  /**
   * 3.1) Submit the updated info to the controller => updateCita()
   */
  async function handleUpdateCita(e) {
    e.preventDefault();
    if (!editCitaId) return;

    try {
      // We'll pass only the fields we want to update
      const patch = {};
      if (editDisponibilidadId) patch.disponibilidad_id = editDisponibilidadId;
      if (editLector1) patch.lector1 = editLector1;
      if (editLector2) patch.lector2 = editLector2;

      const result = await updateCita(editCitaId, patch);
      if (result.success) {
        successToast("Cita actualizada correctamente.");
        // Refresh the table
        await fetchAllCitas();
        // Clear the edit form
        handleCancelEdit();
      } else {
        errorToast("Error al actualizar la Cita: " + result.reason);
      }
    } catch (err) {
      console.error("Error in handleUpdateCita:", err);
      errorToast("Error al actualizar la Cita: " + err.message);
    }
  }

  // Group citas by date when they change
  useEffect(() => {
    const grouped = allCitas.reduce((acc, cita) => {
      const date = cita.day;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(cita);
      return acc;
    }, {});
    setCitasByDate(grouped);
  }, [allCitas]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate && editCitaId) {
      fetchAvailableSlotsForDate(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate, editCitaId]);

  async function fetchAvailableSlotsForDate(date) {
    try {
      const { data: existingSlots } = await supabase
        .from('disponibilidad')
        .select('*')
        .eq('dia', date)
        .order('hora_inicio');

      // Create a map of existing slots for quick lookup
      const existingSlotMap = new Map();
      existingSlots?.forEach(slot => {
        const key = `${slot.hora_inicio}-${slot.hora_fin}`;
        existingSlotMap.set(key, slot);
      });

      // Create the full slots array with availability info
      const fullSlots = ALL_TIME_SLOTS.map(timeSlot => {
        const key = `${timeSlot.start}-${timeSlot.end}`;
        const existingSlot = existingSlotMap.get(key);
        
        return {
          id: existingSlot?.id || `virtual-${key}`,
          hora_inicio: timeSlot.start,
          hora_fin: timeSlot.end,
          isAvailable: !!existingSlot,
          profesor_id: existingSlot?.profesor_id
        };
      });

      setAvailableSlots(fullSlots);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setAvailableSlots([]);
    }
  }

  // Calendar tile content
  function tileContent({ date }) {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const citasForDate = citasByDate[formattedDate] || [];
    
    if (citasForDate.length > 0) {
      return (
        <div className="text-xs mt-1">
          <div className="bg-blue-500 rounded-full w-2 h-2 mx-auto"></div>
          <span className="text-xs">{citasForDate.length}</span>
        </div>
      );
    }
    return null;
  }

  // Add delete function
  async function handleDeleteCita(citaId) {
    if (!citaId || !window.confirm('¿Está seguro que desea eliminar esta defensa?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('Cita')
        .delete()
        .eq('cita_id', citaId);

      if (error) throw error;

      successToast('Defensa eliminada correctamente');
      await fetchAllCitas();
      handleCancelEdit();
    } catch (err) {
      console.error('Error deleting cita:', err);
      errorToast('Error al eliminar la defensa: ' + err.message);
    }
  }

  // Add create new cita function
  async function handleCreateCita(e) {
    e.preventDefault();
    if (!selectedProject || !editDisponibilidadId || !editLector1 || !editLector2) {
      errorToast('Por favor complete todos los campos');
      return;
    }

    try {
      // Get project details
      const { data: project } = await supabase
        .from('Proyecto')
        .select('*')
        .eq('id', selectedProject)
        .single();

      if (!project) throw new Error('Proyecto no encontrado');

      const { error } = await supabase
        .from('Cita')
        .insert({
          proyecto_id: selectedProject,
          disponibilidad_id: editDisponibilidadId,
          estudiante_id: project.estudiante_id,
          semestre_id: project.semestre_id,
          tutor: project.profesor_id,
          lector1: editLector1,
          lector2: editLector2
        });

      if (error) throw error;

      successToast('Nueva defensa creada correctamente');
      await fetchAllCitas();
      setIsCreatingNew(false);
      handleCancelEdit();
    } catch (err) {
      console.error('Error creating cita:', err);
      errorToast('Error al crear la defensa: ' + err.message);
    }
  }

  /* =========================================
      RENDER
  ========================================== */
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Asignación de Defensas" />

      <main className="container mx-auto px-4 py-8">
        {/* Pending Projects Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Proyectos Pendientes de Defensa
          </h2>
          
          <p className="text-gray-600 mb-4">{statusMessage}</p>

          {pendingProjects.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingProjects.map((proj) => (
                  <div key={proj.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-user-graduate text-blue-500"></i>
                      <span className="font-medium">{proj.Estudiante?.Usuario?.nombre}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <i className="fas fa-chalkboard-teacher text-green-500"></i>
                      <span>{proj.Profesor?.Usuario?.nombre}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAssignDefensas}
            disabled={assigningInProgress || pendingProjects.length === 0}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                     transition duration-200 w-full md:w-auto"
          >
            {assigningInProgress ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Asignando...
              </>
            ) : (
              <>
                <i className="fas fa-magic mr-2"></i>
                Asignar Defensas Automáticamente
              </>
            )}
          </button>
        </div>

        {/* Calendar View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Calendario de Defensas
              </h2>
              <button
                onClick={() => {
                  setIsCreatingNew(true);
                  setEditCitaId(null);
                  setEditDisponibilidadId("");
                  setEditLector1("");
                  setEditLector2("");
                  setSelectedProject("");
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600
                         transition duration-200 flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Nueva Defensa
              </button>
            </div>
            <div className="calendar-wrapper">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                locale="es"
                className="rounded-lg border-none shadow-sm"
              />
            </div>
            
            {/* Show citas for selected date */}
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">
                Defensas para {format(selectedDate, 'dd/MM/yyyy', { locale: es })}
              </h3>
              <div className="space-y-3">
                {citasByDate[format(selectedDate, 'yyyy-MM-dd')]?.map(cita => (
                  <div key={cita.cita_id} 
                       className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{cita.estudianteName}</p>
                        <p className="text-sm text-gray-600">
                          {cita.startTime} - {cita.endTime}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(cita)}
                          className="px-3 py-1 bg-indigo-500 text-white rounded-lg
                                   hover:bg-indigo-600 transition duration-200"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCita(cita.cita_id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg
                                   hover:bg-red-600 transition duration-200"
                        >
                          <i className="fas fa-trash-alt mr-1"></i>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Edit/Create Form */}
          {(editCitaId || isCreatingNew) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {isCreatingNew ? 'Nueva Defensa' : 'Editar Defensa'}
              </h2>
              <form onSubmit={isCreatingNew ? handleCreateCita : handleUpdateCita} 
                    className="space-y-6">
                
                {/* Project Selection (only for new citas) */}
                {isCreatingNew && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proyecto
                    </label>
                    <select
                      className="w-full rounded-lg border-gray-200"
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                    >
                      <option value="">Seleccionar Proyecto</option>
                      {pendingProjects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.Estudiante?.Usuario?.nombre} - {proj.Profesor?.Usuario?.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Fecha
                  </label>
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    className="w-full rounded-lg border-gray-200"
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horario Disponible
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map(slot => {
                      const timeRange = `${slot.hora_inicio} - ${slot.hora_fin}`;
                      const isSelected = editDisponibilidadId === slot.id;
                      
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setEditDisponibilidadId(slot.id)}
                          className={`
                            p-2 rounded-lg border transition-colors duration-200
                            ${isSelected 
                              ? 'bg-blue-500 text-white border-blue-600' 
                              : slot.isAvailable
                                ? 'bg-green-50 hover:bg-green-100 border-green-200'
                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                            }
                          `}
                        >
                          <span className="block text-sm">{timeRange}</span>
                          {slot.isAvailable && (
                            <span className="block text-xs mt-1 opacity-75">
                              {slot.profesor_id ? '✓ Disponible' : 'No disponible'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lectores Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lector 1
                    </label>
                    <select
                      className="w-full rounded-lg border-gray-200"
                      value={editLector1}
                      onChange={(e) => setEditLector1(e.target.value)}
                    >
                      <option value="">Seleccionar Lector 1</option>
                      {allProfesores.map((p) => (
                        <option key={p.profesor_id} value={p.profesor_id}>
                          {p.Usuario?.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lector 2
                    </label>
                    <select
                      className="w-full rounded-lg border-gray-200"
                      value={editLector2}
                      onChange={(e) => setEditLector2(e.target.value)}
                    >
                      <option value="">Seleccionar Lector 2</option>
                      {allProfesores.map((p) => (
                        <option key={p.profesor_id} value={p.profesor_id}>
                          {p.Usuario?.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg
                             hover:bg-green-600 transition duration-200"
                  >
                    <i className="fas fa-save mr-2"></i>
                    {isCreatingNew ? 'Crear Defensa' : 'Guardar Cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleCancelEdit();
                      setIsCreatingNew(false);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg
                             hover:bg-gray-400 transition duration-200"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AsignacionDefensas;
