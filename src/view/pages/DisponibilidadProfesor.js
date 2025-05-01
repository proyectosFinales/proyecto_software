import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Header from '../components/HeaderProfesor';
import Footer from '../components/Footer';
import supabase from '../../model/supabase';
import { format, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { errorToast, successToast } from '../components/toast';
import './DisponibilidadProfesor.css';

// Horarios predefinidos comunes para defensas
const HORARIOS_PREDEFINIDOS = [
  { inicio: '07:30', fin: '09:30' },
  { inicio: '09:30', fin: '11:30' },
  { inicio: '11:30', fin: '13:30' },
  { inicio: '13:30', fin: '15:30' },
  { inicio: '15:30', fin: '17:30' },
  { inicio: '17:30', fin: '19:30' }
];

const DisponibilidadProfesor = () => {
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [profesorId, setProfesorId] = useState(null);
  const [periodoDefensas, setPeriodoDefensas] = useState({ inicio: null, fin: null });
  const [isLoading, setIsLoading] = useState(true);
  const [showTimeSelector, setShowTimeSelector] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const userToken = sessionStorage.getItem('token');
        
        const { data: profData } = await supabase
          .from('Profesor')
          .select('profesor_id')
          .eq('id_usuario', userToken)
          .single();
        
        if (profData) {
          setProfesorId(profData.profesor_id);

          const toLocalDate = (dateString) => {
            const [year, month, day] = dateString.split('-').map(Number);
            return new Date(year, month - 1, day);
          };

          const { data: calData } = await supabase
            .from('Calendario')
            .select('fecha_inicio, fecha_fin')
            .eq('nombre', 'Defensas')
            .single();
           
          if (calData) {
            setPeriodoDefensas({
              inicio: toLocalDate(calData.fecha_inicio),
              fin: toLocalDate(calData.fecha_fin)
            });
          }

          const { data: dispData } = await supabase
            .from('disponibilidad')
            .select('*')
            .eq('profesor_id', profData.profesor_id);

          if (dispData) {
            setDisponibilidad(dispData);
          }
        }
      } catch (error) {
        errorToast('Error al cargar los datos: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const isWeekend = (date) => {
    const day = getDay(date);
    return day === 6 || day === 0; // 6 es sábado, 0 es domingo
  };

  const isSunday = (date) => {
    const day = getDay(date);
    return day === 0; // 6 es sábado, 0 es domingo
  };

  // --- Helper to parse "dia" safely as local day ---
  const parseLocalDate = (dbDateString) => {
    // Force noon to avoid any timezone shift off-by-one:
    return new Date(`${dbDateString}T12:00:00`);
  };

  const tileClassName = ({ date }) => {
    // Compare using yyyy-MM-dd from both the calendar date and the db date
    const formattedDate = format(date, 'yyyy-MM-dd');
    const hasDisponibilidad = disponibilidad.some(d => {
      const dbDate = parseLocalDate(d.dia);
      return format(dbDate, 'yyyy-MM-dd') === formattedDate;
    });
    
    let classes = [];
    
    if (hasDisponibilidad) {
      classes.push('has-disponibilidad');
    }
    
    if ((isWeekend(date) && (date < periodoDefensas.inicio || date > periodoDefensas.fin)) || isSunday(date)) {
      classes.push('weekend');
    }
    
    if (
      selectedDate &&
      format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    ) {
      classes.push('selected-date');
    }
    
    return classes.join(' ');
  };

  const tileDisabled = ({ date }) => {
    if (!periodoDefensas.inicio || !periodoDefensas.fin) return true;
    return date < periodoDefensas.inicio || date > periodoDefensas.fin || isSunday(date);
  };

  const handleDateClick = (date) => {
    if (isSunday(date)) return;
    setSelectedDate(date);
    setSelectedTimeSlots([]);
    setShowTimeSelector(true);
  };

  const handleSelectTimeSlot = (inicio, fin) => {
    setSelectedTimeSlots(prev => {
      const isAlreadySelected = prev.some(slot => slot.inicio === inicio && slot.fin === fin);
      if (isAlreadySelected) {
        return prev.filter(slot => !(slot.inicio === inicio && slot.fin === fin));
      } else {
        return [...prev, { inicio, fin }];
      }
    });
  };

  const isTimeSlotOverlapping = (newSlot, existingSlots) => {
    return existingSlots.some(slot => {
      return (
        newSlot.inicio >= slot.hora_inicio && newSlot.inicio < slot.hora_fin
      ) || (
        newSlot.fin > slot.hora_inicio && newSlot.fin <= slot.hora_fin
      );
    });
  };

  const handleAgregarDisponibilidad = async () => {
    if (!selectedDate || selectedTimeSlots.length === 0) {
      errorToast('Por favor seleccione al menos un horario');
      return;
    }

    try {
      // Safeguard: set the selected date to noon local so we never slip to a previous day
      const localDateCopy = new Date(selectedDate.getTime());
      localDateCopy.setHours(12, 0, 0, 0);

      // Build YYYY-MM-DD manually
      const year = localDateCopy.getFullYear();
      const month = String(localDateCopy.getMonth() + 1).padStart(2, '0');
      const day = String(localDateCopy.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      // Verificar traslapes con disponibilidades existentes
      const { data: existing } = await supabase
        .from('disponibilidad')
        .select('*')
        .eq('profesor_id', profesorId)
        .eq('dia', formattedDate);

      // Filtrar slots que no se traslapan
      const validTimeSlots = selectedTimeSlots.filter(slot => 
        !isTimeSlotOverlapping(slot, existing || [])
      );

      if (validTimeSlots.length === 0) {
        errorToast('Los horarios seleccionados se traslapan con disponibilidades existentes');
        return;
      }

      // Insertar múltiples disponibilidades
      const { error } = await supabase
        .from('disponibilidad')
        .insert(
          validTimeSlots.map(slot => ({
            profesor_id: profesorId,
            dia: formattedDate,
            hora_inicio: slot.inicio,
            hora_fin: slot.fin,
          }))
        );

      if (error) throw error;

      // Actualizar estado
      const { data: newDisp } = await supabase
        .from('disponibilidad')
        .select('*')
        .eq('profesor_id', profesorId);

      setDisponibilidad(newDisp || []);
      successToast('Disponibilidades agregadas correctamente');
      
      // Resetear selección
      setSelectedTimeSlots([]);
      setShowTimeSelector(false);
    } catch (error) {
      errorToast('Error al agregar disponibilidad: ' + error.message);
    }
  };

  const handleEliminarDisponibilidad = async (id) => {
    try {
      const { error } = await supabase
        .from('disponibilidad')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDisponibilidad(disponibilidad.filter(d => d.id !== id));
      successToast('Disponibilidad eliminada correctamente');
    } catch (error) {
      errorToast('Error al eliminar disponibilidad: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="Disponibilidad para defensas" />
        <div className="flex-grow flex justify-center items-center">
          <div className="loading-spinner"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header title="Disponibilidad para defensas" />
      
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="info-banner mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <i className="fas fa-info-circle text-blue-500 mr-2"></i>
            <p className="text-blue-700 text-sm md:text-base">
              Seleccione las fechas y horarios en los que está disponible para asistir a defensas.
              Puede seleccionar múltiples horarios para un mismo día.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg order-1 xl:order-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
              <h2 className="text-xl md:text-2xl font-semibold">Seleccionar fecha</h2>
              <div className="calendar-legend flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-200 rounded mr-2"></div>
                  <span className="text-sm">Con disponibilidad</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-200 rounded mr-2"></div>
                  <span className="text-sm">Fin de semana</span>
                </div>
              </div>
            </div>

            <div className="calendar-wrapper max-w-3xl mx-auto">
              <div className="calendar-container p-2 md:p-4 bg-gray-50 rounded-lg">
                <Calendar
                  onChange={handleDateClick}
                  value={selectedDate}
                  tileClassName={tileClassName}
                  tileDisabled={tileDisabled}
                  locale="es"
                  className="custom-calendar w-full"
                  minDate={periodoDefensas.inicio}
                  maxDate={periodoDefensas.fin}
                />
              </div>
            </div>
            
            {selectedDate && showTimeSelector && (
              <div className="mt-6 space-y-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg md:text-xl text-center">
                  {format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                </h3>
                <div className="time-slots-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {HORARIOS_PREDEFINIDOS.map((horario, index) => (
                    <button
                      key={index}
                      className={`time-slot-btn p-3 md:p-4 text-sm md:text-base ${
                        selectedTimeSlots.some(
                          slot => slot.inicio === horario.inicio && slot.fin === horario.fin
                        )
                          ? 'selected bg-blue-100 border-blue-500'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectTimeSlot(horario.inicio, horario.fin)}
                    >
                      <i className="far fa-clock mr-2"></i>
                      {horario.inicio} - {horario.fin}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={handleAgregarDisponibilidad}
                    className="add-availability-btn flex-1 py-3"
                    disabled={selectedTimeSlots.length === 0}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Agregar {selectedTimeSlots.length} horario
                    {selectedTimeSlots.length !== 1 ? 's' : ''}
                  </button>
                  <button
                    onClick={() => setShowTimeSelector(false)}
                    className="cancel-btn flex-1 py-3"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg order-2 xl:order-2">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">Disponibilidad actual</h2>
            <div className="availability-list">
              {disponibilidad.length === 0 ? (
                <div className="empty-state p-8">
                  <i className="fas fa-calendar-times text-4xl md:text-5xl text-gray-400 mb-3"></i>
                  <p className="text-gray-500 text-base md:text-lg">
                    No hay disponibilidad registrada
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {disponibilidad
                    .sort((a, b) => {
                      // Primero ordenar por fecha
                      const dateCompare = new Date(a.dia) - new Date(b.dia);
                      if (dateCompare !== 0) return dateCompare;
                      // Si es la misma fecha, ordenar por hora
                      return a.hora_inicio.localeCompare(b.hora_inicio);
                    })
                    .map((disp) => {
                      const dispDate = parseLocalDate(disp.dia);
                      return (
                        <div
                          key={disp.id}
                          className="availability-item hover:shadow-md"
                        >
                          <div>
                            <p className="text-base md:text-lg font-medium">
                              {format(dispDate, "EEEE d 'de' MMMM", { locale: es })}
                            </p>
                            <div className="flex items-center text-gray-600">
                              <i className="far fa-clock mr-2"></i>
                              <p className="text-sm md:text-base">
                                {disp.hora_inicio.slice(0, 5)} - {disp.hora_fin.slice(0, 5)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEliminarDisponibilidad(disp.id)}
                            className="delete-btn hover:bg-red-100"
                            title="Eliminar disponibilidad"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DisponibilidadProfesor;
