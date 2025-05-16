import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import Header from "../components/HeaderCoordinador";
import Footer from "../components/Footer";
import { successToast, errorToast } from "../components/toast";
import supabase from "../../model/supabase"; 

// Our advanced/auto assignment controller
import {
  assignAllDefensas,
  listAllCitas,
  updateCita,
  generateReports,
  generateAvailability,
  availabilityReports
} from "../../controller/AsignacionDefensaController";

/**
 * A single page that:
 * 1) Lists "pending" projects needing a defense
 * 2) Lets you auto-assign defenses (strict constraints)
 * 3) Shows a calendar of existing Citas
 * 4) Allows manual creation, 
 *    Only preventing slot selection if the tutor or chosen lectores 
 *    is already booked at that day/time.
 * 5) Displays a user-friendly reason for unavailability.
 */
const AsignacionDefensas = () => {
  // ----- Pending Projects & Status -----
  const [pendingProjects, setPendingProjects] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [assigningInProgress, setAssigningInProgress] = useState(false);

  // ----- Assignment results -----
  const [assignedCount, setAssignedCount] = useState(0);
  const [unassignedReasons, setUnassignedReasons] = useState([]);

  // ----- Citas / Calendar -----
  const [allCitas, setAllCitas] = useState([]);
  const [citasByDate, setCitasByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ----- Manual Edit/Create -----
  const [editCitaId, setEditCitaId] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // For the chosen slot & lector IDs
  const [selectedSlot, setSelectedSlot] = useState(null); // e.g. { start, end, conflictMsg, conflictProf }
  const [editLector1, setEditLector1] = useState("");
  const [editLector2, setEditLector2] = useState("");

  // For new Cita -> which project
  const [selectedProject, setSelectedProject] = useState("");

  // Reference data
  const [allProfesores, setAllProfesores] = useState([]);

  const [allAvailabilities, setAllAvailabilities] = useState([]);
  

  // We define 6 daily time slots
  const TIME_SLOTS = [
    { start: "07:30:00", end: "09:30:00" },
    { start: "09:30:00", end: "11:30:00" },
    { start: "11:30:00", end: "13:30:00" },
    { start: "13:30:00", end: "15:30:00" },
    { start: "15:30:00", end: "17:30:00" },
    { start: "17:30:00", end: "19:30:00" },
  ];

  // We'll store an array of "slot info" for the day
  const [dailySlots, setDailySlots] = useState([]); 

  /* =============================
     1) On mount, fetch data
  ============================== */
  useEffect(() => {
    fetchPendingDefensas();
    fetchAllCitas();
    fetchProfesores();
    fetchAllAvailabilites();
  }, []);

  // 1.1) Pending
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

  // 1.2) All Citas => for the "calendar"
  async function fetchAllCitas() {
    try {
      const citasData = await listAllCitas();
      setAllCitas(citasData);
    } catch (err) {
      console.error("Error fetching all Citas:", err);
    }
  }

  async function fetchAllAvailabilites() {
    try {
      const availabilityData = await availabilityReports();
      setAllAvailabilities(availabilityData);
    } catch (err) {
      console.error("Error fetching all availabilites:", err);
    }
  }

  // 1.3) All profesores
  async function fetchProfesores() {
    try {
      const { data: profs, error } = await supabase
        .from("Profesor")
        .select(`
          profesor_id,
          Usuario:id_usuario (
            nombre
          )
        `);
      if (error) throw error;
      setAllProfesores(profs || []);
    } catch (err) {
      console.error("Error fetching profesores:", err);
    }
  }

  /* =============================
     2) Assign All Defensas
  ============================== */
  async function handleAssignDefensas() {
    try {
      setAssigningInProgress(true);
      setStatusMessage("Asignando defensas...");

      const result = await assignAllDefensas(); // => { assigned, unassigned }
      setAssignedCount(result.assigned || 0);
      setUnassignedReasons(result.unassigned || []);

      if (result.assigned > 0) {
        successToast(`¡Asignadas ${result.assigned} defensa(s) exitosamente!`);
      } else {
        successToast("No se asignaron defensas (sin disponibilidad).");
      }

      // Refresh
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

  /* ===========================
     3) Group Citas by date
  =========================== */
  useEffect(() => {
    const grouped = allCitas.reduce((acc, c) => {
      const d = c.day; // e.g. "2025-01-30"
      if (!acc[d]) {
        acc[d] = [];
      }
      acc[d].push(c);
      return acc;
    }, {});
    setCitasByDate(grouped);
  }, [allCitas]);

  // React-Calendar tile content: show a small dot & number if there's citas
  function tileContent({ date }) {
    const dayStr = format(date, "yyyy-MM-dd");
    const arr = citasByDate[dayStr] || [];
    if (arr.length > 0) {
      return (
        <div className="text-xs mt-1 flex flex-col items-center">
          <div className="bg-blue-500 rounded-full w-2 h-2 mb-1"></div>
          <span>{arr.length}</span>
        </div>
      );
    }
    return null;
  }

  /* ===========================
     4) Manual Creation / Edit
  =========================== */

  // Whenever selectedDate or the "edit" state changes, recalc the "dailySlots"
  // so the user sees which are available vs. conflicting.
  useEffect(() => {
    if (!isCreatingNew && !editCitaId) {
      setDailySlots([]);
      return;
    }
    computeDailySlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isCreatingNew, editCitaId, selectedProject, editLector1, editLector2]);

  // Build dailySlots => for each of the 6 time ranges, figure out if there's a conflict
  async function computeDailySlots() {
    const dayStr = format(selectedDate, "yyyy-MM-dd");
    
    // 1) fetch the chosen project => to get TUTOR
    let tutorId = null;
    if (selectedProject) {
      const { data: proj } = await supabase
        .from("Proyecto")
        .select("profesor_id")
        .eq("id", selectedProject)
        .single();
      tutorId = proj?.profesor_id || null;
    }

    // 2) find all Citas that day
    //    We'll see which tutor/lector is in each
    //    Then mark a conflict if it has the same slot 
    const { data: dayCitas } = await supabase
      .from("Cita")
      .select(`
        tutor,
        lector1,
        lector2,
        disponibilidad:disponibilidad_id (
          dia,
          hora_inicio,
          hora_fin
        )
      `);

    // Filter to the same day
    const sameDay = (dayCitas || []).filter((c) => c.disponibilidad?.dia === dayStr);

    // 3) For each of the 6 time slots,
    //    see if the "tutor" or either lector is in "sameDay" 
    //    at that slot => conflict
    const newSlots = TIME_SLOTS.map((ts) => {
      const slotObj = {
        start: ts.start,
        end: ts.end,
        conflict: false,
        conflictMsg: "",
      };

      // If we haven't chosen a project or lector1 or lector2 yet, we can't do a conflict check
      // => allow them to select anything
      if (!tutorId || !editLector1 || !editLector2) {
        return slotObj;
      }

      // find any cita that has the same [start, end], with day=dayStr
      // and if its tutor or lector is TUTORID or LECTOR1 or LECTOR2
      const conflictCita = sameDay.find((cita) => {
        return (
          cita.disponibilidad?.hora_inicio === ts.start &&
          cita.disponibilidad?.hora_fin === ts.end &&
          (
            cita.tutor === tutorId ||
            cita.lector1 === tutorId ||
            cita.lector2 === tutorId ||
            cita.tutor === editLector1 ||
            cita.lector1 === editLector1 ||
            cita.lector2 === editLector1 ||
            cita.tutor === editLector2 ||
            cita.lector1 === editLector2 ||
            cita.lector2 === editLector2
          )
        );
      });

      if (conflictCita) {
        slotObj.conflict = true;
        slotObj.conflictMsg = "Conflicto con alguno de los profesores.";
      }
      return slotObj;
    });

    setDailySlots(newSlots);
  }

  // Opening the new Cita form
  function openNewCitaForm() {
    setIsCreatingNew(true);
    setEditCitaId(null);
    setSelectedProject("");
    setEditLector1("");
    setEditLector2("");
    setSelectedSlot(null);
  }

  // If we click "Edit"
  function handleEditClick(cita) {
    setIsCreatingNew(false);
    setEditCitaId(cita.cita_id);
    
    // Set the initial values
    setSelectedDate(new Date(cita.day));
    setSelectedSlot({
      start: cita.startTime,
      end: cita.endTime
    });
    setEditLector1(cita.lector1Id || '');
    setEditLector2(cita.lector2Id || '');
  }

  // Cancel editing/creating
  function handleCancel() {
    setIsCreatingNew(false);
    setEditCitaId(null);
    setSelectedProject("");
    setEditLector1("");
    setEditLector2("");
    setSelectedSlot(null);
    setDailySlots([]);
  }

  // Deleting
  async function handleDeleteCita(citaId) {
    if (!window.confirm("¿Seguro que desea eliminar esta defensa?")) return;
    try {
      const { error } = await supabase
        .from("Cita")
        .delete()
        .eq("cita_id", citaId);
      if (error) throw error;
      successToast("Defensa eliminada.");
      await fetchAllCitas();
    } catch (err) {
      console.error("Error deleting cita:", err);
      errorToast("Error al eliminar la defensa: " + err.message);
    }
  }

  // Create new Cita manually
  async function handleCreateCita(e) {
    e.preventDefault();
    if (!selectedProject) {
      errorToast("Seleccione un proyecto");
      return;
    }
    if (!selectedSlot) {
      errorToast("Seleccione un horario");
      return;
    }
    if (!editLector1 || !editLector2) {
      errorToast("Seleccione ambos lectores");
      return;
    }
    if (editLector1 === editLector2) {
      errorToast("lector1 y lector2 no pueden ser el mismo.");
      return;
    }

    // final check if slot is conflict
    const conflictSlot = dailySlots.find(
      (s) => s.start === selectedSlot.start && s.end === selectedSlot.end
    );
    if (conflictSlot?.conflict) {
      errorToast("Este horario está en conflicto con otro profesor. No puede asignar.");
      return;
    }

    try {
      // Get project details
      const { data: proj, error: projErr } = await supabase
        .from("Proyecto")
        .select("id, estudiante_id, profesor_id, semestre_id")
        .eq("id", selectedProject)
        .single();
      
      if (projErr) throw projErr;
      if (!proj) {
        errorToast("Proyecto no encontrado.");
        return;
      }

      // Create or find disponibilidad - FIXED VERSION
      const dayStr = format(selectedDate, "yyyy-MM-dd");
      
      // First try to find existing disponibilidad
      const { data: existingSlot } = await supabase
        .from("disponibilidad")
        .select("id")
        .eq("dia", dayStr)
        .eq("hora_inicio", selectedSlot.start)
        .eq("hora_fin", selectedSlot.end)
        .maybeSingle();

      let disponibilidadId;
      
      if (existingSlot) {
        disponibilidadId = existingSlot.id;
      } else {
        // Create new disponibilidad
        const { data: newSlot, error: createErr } = await supabase
          .from("disponibilidad")
          .insert({
            dia: dayStr,
            hora_inicio: selectedSlot.start,
            hora_fin: selectedSlot.end,
            profesor_id: proj.profesor_id
          })
          .select('id')  // Important: Request the id back
          .single();

        if (createErr) throw createErr;
        if (!newSlot) throw new Error("No se pudo crear la disponibilidad");
        
        disponibilidadId = newSlot.id;
      }

      // Now create the cita with the disponibilidad_id
      const { error: citaErr } = await supabase
        .from("Cita")
        .insert({
          proyecto_id: proj.id,
          estudiante_id: proj.estudiante_id,
          semestre_id: proj.semestre_id,
          tutor: proj.profesor_id,
          lector1: editLector1,
          lector2: editLector2,
          disponibilidad_id: disponibilidadId
        });

      if (citaErr) throw citaErr;

      successToast("Defensa creada exitosamente");
        await fetchAllCitas();
      await fetchPendingDefensas();
      handleCancel();

    } catch (err) {
      console.error("Error creating cita manually:", err);
      errorToast("Error al crear la defensa: " + err.message);
    }
  }

  function handleGeneration(){
    generateReports(allCitas);
  }

  function handleAvailability(){
    generateAvailability(allAvailabilities);
  }

  // Modify handleEditCita to bypass lector availability checks
  async function handleEditCita(e) {
    e.preventDefault();
    
    if (!editCitaId) {
      errorToast('No hay cita seleccionada para editar');
      return;
    }

    if (!selectedSlot) {
      errorToast('Por favor seleccione un horario');
      return;
    }

    if (!editLector1 || !editLector2) {
      errorToast('Por favor seleccione ambos lectores');
      return;
    }

    try {
      // First get the existing cita details to get the tutor
      const { data: existingCita, error: citaErr } = await supabase
        .from("Cita")
        .select(`
          cita_id,
          tutor,
          proyecto_id,
          Proyecto:proyecto_id (
            profesor_id
          )
        `)
        .eq("cita_id", editCitaId)
        .single();

      if (citaErr) throw citaErr;
      if (!existingCita) {
        throw new Error('No se encontró la cita a editar');
      }

      const tutorId = existingCita.Proyecto.profesor_id;
      const dayStr = format(selectedDate, "yyyy-MM-dd");

      // Only handle disponibilidad for the tutor
      let disponibilidadId;

      // First check if tutor already has disponibilidad for this slot
      const { data: existingSlot } = await supabase
        .from("disponibilidad")
        .select("id")
        .eq("dia", dayStr)
        .eq("hora_inicio", selectedSlot.start)
        .eq("hora_fin", selectedSlot.end)
        .eq("profesor_id", tutorId)
        .maybeSingle();

      if (existingSlot) {
        disponibilidadId = existingSlot.id;
      } else {
        // Create new disponibilidad for tutor if none exists
        const { data: newSlot, error: createErr } = await supabase
          .from("disponibilidad")
          .insert({
            dia: dayStr,
            hora_inicio: selectedSlot.start,
            hora_fin: selectedSlot.end,
            profesor_id: tutorId
          })
          .select('id')
          .single();

        if (createErr) throw createErr;
        if (!newSlot) throw new Error("No se pudo crear la disponibilidad para el tutor");
        
        disponibilidadId = newSlot.id;
      }

      // Update the cita directly without checking lector availability
      const { error: updateErr } = await supabase
        .from("Cita")
        .update({
          disponibilidad_id: disponibilidadId,
          lector1: editLector1,
          lector2: editLector2
        })
        .eq("cita_id", editCitaId);

      if (updateErr) throw updateErr;

      successToast('Defensa actualizada exitosamente');
      await fetchAllCitas();
      handleCancel();

    } catch (err) {
      console.error("Error updating cita:", err);
      errorToast(err.message || 'Error al actualizar la defensa');
    }
  }

  /* =======================
      RENDER
  ======================== */
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Asignación de Defensas" />
      <main className="container mx-auto px-4 py-8">
        {/* Pending projects */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Proyectos Pendientes de Defensa</h2>
          <p className="text-gray-600 mb-4">{statusMessage}</p>

        {pendingProjects.length > 0 && (
          <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-user-graduate text-blue-500"></i>
                      <span className="font-medium">
                        {proj.Estudiante?.Usuario?.nombre}
                      </span>
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

        {/* Calendar & Manual Creation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Calendar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Calendario de Defensas
              </h2>
              <button
                onClick={openNewCitaForm}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600
                         transition duration-200 flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Nueva Defensa
              </button>
            </div>
            

            {/* The Calendar */}
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              locale="es"
              className="rounded-lg border-none shadow-sm"
            />

            {/* Show the defenses for that day */}
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">
                Defensas para {format(selectedDate, "dd/MM/yyyy", { locale: es })}
              </h3>
              <div className="space-y-3">
                {citasByDate[format(selectedDate, "yyyy-MM-dd")]?.map((cita) => (
                  <div
                    key={cita.cita_id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
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
          <div className="flex items-start justify-center text-white">
            <button onClick={() => handleGeneration()}
              class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 m-4">
              Descargar Asignaciones
            </button>
            <button onClick={() => handleAvailability()}
              class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 m-4">
              Descargar Disponibilidades
            </button>
          </div>


          {/* RIGHT: Create / Edit form */}
          {(isCreatingNew || editCitaId) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {isCreatingNew ? "Nueva Defensa" : "Editar Defensa"}
              </h2>

              {isCreatingNew && (
                <form onSubmit={handleCreateCita} className="space-y-6">
                  {/* Project */}
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
                          {proj.Estudiante?.Usuario?.nombre} -{" "}
                          {proj.Profesor?.Usuario?.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fecha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Seleccionada
                    </label>
                    <p className="text-gray-800">
                      {format(selectedDate, "dd/MM/yyyy", { locale: es })}
                    </p>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horario Disponible
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {dailySlots.map((slot) => {
                        const key = `${slot.start}-${slot.end}`;
                        const isSelected =
                          selectedSlot &&
                          selectedSlot.start === slot.start &&
                          selectedSlot.end === slot.end;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              if (slot.conflict) {
                                errorToast("Este horario está en conflicto: " + slot.conflictMsg);
                                return;
                              }
                              setSelectedSlot({
                                start: slot.start,
                                end: slot.end,
                              });
                            }}
                            className={`
                              p-2 rounded-lg border transition-colors duration-200
                              ${
                                isSelected
                                  ? "bg-blue-500 text-white border-blue-600"
                                  : slot.conflict
                                  ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                                  : "bg-green-50 hover:bg-green-100 border-green-200"
                              }
                            `}
                          >
                            <span className="block text-sm">{slot.start} - {slot.end}</span>
                            {slot.conflict && (
                              <span className="block text-xs text-red-600 mt-1">
                                {slot.conflictMsg}
                              </span>
                            )}
                            {!slot.conflict && (
                              <span className="text-xs mt-1 block text-gray-500">Disponible</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lectores */}
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

                  {/* Buttons */}
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg
                               hover:bg-green-600 transition duration-200"
                    >
                      <i className="fas fa-save mr-2"></i>
                      Crear Defensa
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg
                               hover:bg-gray-400 transition duration-200"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* If editing an existing cita, you can replicate a similar form or skip for brevity */}
              {editCitaId && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Editar Defensa
                  </h2>
                  <form onSubmit={handleEditCita} className="space-y-6">
                    {/* Date display */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Seleccionada
                      </label>
                      <p className="text-gray-800">
                        {format(selectedDate, "dd/MM/yyyy", { locale: es })}
                      </p>
                    </div>

                    {/* Time Slots */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horario
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {dailySlots.map((slot) => {
                          const key = `${slot.start}-${slot.end}`;
                          const isSelected = selectedSlot &&
                                           selectedSlot.start === slot.start &&
                                           selectedSlot.end === slot.end;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSelectedSlot({
                                start: slot.start,
                                end: slot.end,
                              })}
                              className={`
                                p-2 rounded-lg border transition-colors duration-200
                                ${isSelected
                                  ? 'bg-blue-500 text-white border-blue-600'
                                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                                }
                              `}
                            >
                              <span className="block text-sm">{slot.start} - {slot.end}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Lectores */}
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
                        Guardar Cambios
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
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
          )}
        </div>

        {/* Show assignment results if any */}
        {(assignedCount > 0 || unassignedReasons.length > 0) && (
          <div className="mt-8 p-4 bg-white rounded-md shadow-md">
            <h4 className="font-semibold mb-2">Resultados de Asignación Automática:</h4>
            <p>Defensas asignadas: {assignedCount}</p>
            {unassignedReasons.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">
                  No se pudo asignar cita a los siguientes casos:
                </p>
                <ul className="list-disc pl-5">
                  {unassignedReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AsignacionDefensas;
