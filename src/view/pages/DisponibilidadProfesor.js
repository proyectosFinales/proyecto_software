/**
 * DisponibilidadProfesor.jsx
 * Permite a un profesor indicar su disponibilidad para cada cita en el semestre.
 */
import React, { useState, useEffect } from 'react';
import '../styles/Citas.css';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderProfesor';
import { useNavigate } from 'react-router-dom';

const DisponibilidadProfesor = () => {
  const [citas, setCitas] = useState([]);
  const [citasOriginales, setCitasOriginales] = useState([]);
  const [error, setError] = useState('');
  const profesorID = sessionStorage.getItem('token');
  const navigate = useNavigate();

  // Formatea la hora "HH:mm:ss" a "HH:mm"
  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(''); // Limpiamos errores previos

        if (!profesorID) {
          throw new Error('Token de profesor no encontrado en la sesión.');
        }

        console.log(`[fetchData] Profesor ID: ${profesorID}`);

        // 1. Traer todas las citas de la tabla "cita"
        const { data: citasData, error: citasError } = await supabase
          .from('cita') // Usar 'cita' en minúsculas
          .select(`
            cita_id,
            fecha,
            hora_inicio,
            hora_fin
          `)
          .eq('semestre_id', 1); // Ajusta según tu lógica de semestres

        if (citasError) {
          throw new Error(`Error al cargar citas: ${citasError.message}`);
        }

        console.log(`[fetchData] Citas obtenidas:`, citasData);

        // Si no hay citas, simplemente mostramos array vacío
        if (!citasData || citasData.length === 0) {
          setCitas([]);
          setCitasOriginales([]);
          console.log('[fetchData] No hay citas disponibles.');
          return;
        }

        // 2. Traer la disponibilidad actual del profesor
        const { data: dispData, error: dispError } = await supabase
          .from('disponibilidad') // Usar 'disponibilidad' en minúsculas
          .select('*')
          .eq('profesor_id', profesorID);

        if (dispError) {
          throw new Error(`Error al cargar la disponibilidad: ${dispError.message}`);
        }

        console.log(`[fetchData] Disponibilidad obtenida:`, dispData);

        // 3. Combinar citas con disponibilidad
        const formattedAppointments = citasData.map((cita) => {
          // Buscar en la disponibilidad si hay registro para esta cita
          const match = dispData.find(d => d.cita_id === cita.cita_id);

          return {
            cita_id: cita.cita_id,
            fecha: cita.fecha,
            hora_inicio: cita.hora_inicio,
            hora_fin: cita.hora_fin,
            disponible: match ? match.disponible : false,
            disponibilidad_id: match ? match.id : null
          };
        });

        // Ordenar por fecha + hora
        formattedAppointments.sort((a, b) => {
          if (a.fecha === b.fecha) {
            return a.hora_inicio.localeCompare(b.hora_inicio);
          }
          return a.fecha.localeCompare(b.fecha);
        });

        console.log('[fetchData] Citas formateadas y ordenadas:', formattedAppointments);

        // 4. Si no existe registro de disponibilidad para alguna cita, crearlo
        for (let item of formattedAppointments) {
          if (!item.disponibilidad_id) {
            const { data: inserted, error } = await supabase
              .from('disponibilidad') // Usar 'disponibilidad' en minúsculas
              .insert([
                {
                  profesor_id: profesorID,
                  cita_id: item.cita_id,
                  disponible: item.disponible
                }
              ])
              .select('id')
              .single();

            if (error) {
              throw new Error(`Error al crear registro de disponibilidad para cita_id ${item.cita_id}: ${error.message}`);
            }

            console.log(`[fetchData] Registro de disponibilidad creado:`, inserted);
            item.disponibilidad_id = inserted.id;
          }
        }

        setCitas(formattedAppointments);
        // Hacemos una copia profunda para comparar cambios luego
        setCitasOriginales(JSON.parse(JSON.stringify(formattedAppointments)));

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Error al cargar las citas.');
      }
    };

    fetchData();
  }, [profesorID]);

  // Manejador del checkbox "disponible"
  const handleCheckboxChange = (index) => {
    const updated = [...citas];
    updated[index].disponible = !updated[index].disponible;
    setCitas(updated);
  };

  // Seleccionar todos
  const selectAll = () => {
    setCitas((prev) => prev.map(item => ({ ...item, disponible: true })));
  };

  // Deseleccionar todos
  const deselectAll = () => {
    setCitas((prev) => prev.map(item => ({ ...item, disponible: false })));
  };

  // Determinar si hay cambios
  const hasChanges = () => {
    return JSON.stringify(citas) !== JSON.stringify(citasOriginales);
  };

  // Guardar cambios en "Disponibilidad"
  const handleSave = async () => {
    if (!hasChanges()) {
      alert('No hay cambios para guardar.');
      return;
    }

    if (!window.confirm('¿Está seguro de que desea guardar los cambios?')) {
      return;
    }

    try {
      for (let c of citas) {
        if (c.disponibilidad_id) { // Asegurarse de que existe el ID
          const { error } = await supabase
            .from('disponibilidad') // Usar 'disponibilidad' en minúsculas
            .update({ disponible: c.disponible })
            .eq('id', c.disponibilidad_id);

          if (error) {
            throw new Error(`Error al actualizar la disponibilidad para cita_id ${c.cita_id}: ${error.message}`);
          }
        } else {
          throw new Error(`Registro de disponibilidad inexistente para cita_id ${c.cita_id}.`);
        }
      }
      alert('Cambios guardados correctamente.');
      setCitasOriginales(JSON.parse(JSON.stringify(citas)));
    } catch (error) {
      console.error('Error saving data:', error);
      alert(error.message || 'Error al guardar los cambios.');
    }
  };

  // Volver al menú profesor (preguntando si hay cambios sin guardar)
  const handleGoBack = () => {
    if (!hasChanges()) {
      navigate('/menuProfesor');
    } else {
      if (window.confirm('¿Está seguro de que desea descartar los cambios?')) {
        setCitas(JSON.parse(JSON.stringify(citasOriginales)));
        navigate('/menuProfesor');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Disponibilidad Profesor" />
      <div className="flex-grow p-4">
        <h2 className="text-xl font-bold mb-4">Indique su disponibilidad</h2>
        <div className="flex flex-wrap gap-4">
          {citas.map((cita, index) => (
            <div key={index} className="border border-gray-300 rounded p-4 flex flex-col w-full sm:w-1/2 lg:w-1/3">
              <p className="font-semibold">Fecha: {cita.fecha}</p>
              <p>Hora inicio: {cita.hora_inicio}</p>
              <div className="mt-2">
                <input
                  type="checkbox"
                  checked={cita.disponible}
                  onChange={() => handleCheckboxChange(index)}
                  className="mr-2"
                />
                <label>Disponible</label>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-6 flex space-x-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleSave}>
            Guardar
          </button>
          <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400" onClick={handleGoBack}>
            Volver
          </button>
        </div>
        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
      <Footer />
    </div>
  );
};

export default DisponibilidadProfesor;
