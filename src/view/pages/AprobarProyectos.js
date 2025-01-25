/**
 * AprobarProyectos.jsx
 * Pantalla para que el coordinador cambie proyectos a "Finalizado" (aprobado) o "Perdido" (reprobado).
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { AiOutlineArrowDown, AiOutlineArrowUp, AiOutlineInfoCircle } from 'react-icons/ai';
import { errorToast, successToast } from '../components/toast';

const AprobarProyectos = () => {
  const [anteproyectos, setAnteproyectos] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [infoVisible, setInfoVisible] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnteproyectos();
  }, []);

  const toggleInfo = (field) => {
    setInfoVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const fetchAnteproyectos = async () => {
    try {
      const { data, error } = await supabase
        .from('Anteproyecto')
        .select(`
          id,
          nombreEmpresa,
          contexto,
          justificacion,
          estado,
          estudiante_id,
          Estudiante:estudiante_id (
            estudiante_id,
            nombre,
            carnet,
            telefono,
            correo
          )
        `)
        .in('estado', ['Aprobado', 'Reprobado']);

      if (error) {
        errorToast('No se pudieron obtener los anteproyectos: ' + error.message);
        return;
      }
      
      setAnteproyectos(data || []);
    } catch (err) {
      errorToast('Error al cargar anteproyectos: ' + err.message);
    }
  };

  const createOrUpdateProyecto = async (anteproyectoID, estudianteId, newState) => {
    try {
      const { data: existing, error: existError } = await supabase
        .from('Proyecto')
        .select('id, estado')
        .eq('anteproyecto_id', anteproyectoID)
        .single();

      if (existError && existError.code !== 'PGRST116') {
        console.error('Error revisando proyecto existente:', existError);
      }

      if (!existing) {
        const { error: insertError } = await supabase
          .from('Proyecto')
          .insert([{
            anteproyecto_id: anteproyectoID,
            estudiante_id: estudianteId,
            estado: newState,
            fecha_inicio: new Date().toISOString().slice(0, 10),
          }]);
        if (insertError) {
          console.error('Error insertando en Proyecto:', insertError);
        }
      } else {
        const { error: updateError } = await supabase
          .from('Proyecto')
          .update({ estado: newState })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Error actualizando Proyecto:', updateError);
        }
      }
    } catch (err) {
      console.error('Excepción en createOrUpdateProyecto:', err);
    }
  };

  async function aprobar(anteproyectoId) {
    const confirmAprobar = window.confirm("¿Está seguro de APROBAR este proyecto?");
    if (!confirmAprobar) return;

    try {
      const { error } = await supabase
        .from('Anteproyecto')
        .update({ estado: "Aprobado" })  
        .eq('id', anteproyectoId);

      if (error) {
        console.error('Error al actualizar proyecto:', error);
        errorToast(error.message);
        return;
      }

      await createOrUpdateProyecto(anteproyectoId, anteproyectoId, "Aprobado");

      successToast('Proyecto actualizado exitosamente');
      fetchAnteproyectos();
    } catch (err) {
      errorToast('Error al actualizar proyecto: ' + err);
    }
  }

  async function reprobar(anteproyectoId) {
    const confirmReprobar = window.confirm("¿Está seguro de REPROBAR este proyecto?");
    if (!confirmReprobar) return;

    try {
      const { error } = await supabase
        .from('Anteproyecto')
        .update({ estado: "Reprobado" })
        .eq('id', anteproyectoId);

      if (error) {
        console.error('Error al actualizar proyecto:', error);
        errorToast(error.message);
        return;
      }

      await createOrUpdateProyecto(anteproyectoId, anteproyectoId, "Reprobado");

      successToast('Proyecto actualizado exitosamente');
      fetchAnteproyectos();
    } catch (err) {
      errorToast('Error al actualizar proyecto: ' + err);
    }
  }

  const toggleExpandRow = (idx) => {
    setExpandedRow(expandedRow === idx ? null : idx);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title="Aprobar Proyectos" />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-6">
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-300 text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b border-gray-300">Proyecto</th>
                <th className="px-4 py-2 border-b border-gray-300">Estado</th>
                <th className="px-4 py-2 border-b border-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {anteproyectos.map((anteproyecto, index) => (
                <React.Fragment key={anteproyecto.id}>
                  <tr className="border-b">
                    <td className="px-4 py-2">
                      {anteproyecto.nombreEmpresa || 'Sin Nombre'}
                    </td>
                    <td className="px-4 py-2">
                      {anteproyecto.estado}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={() => aprobar(anteproyecto.id)}
                        >
                          Aprobar
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          onClick={() => reprobar(anteproyecto.id)}
                        >
                          Reprobar
                        </button>
                        <button
                          className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400"
                          onClick={() => toggleExpandRow(index)}
                        >
                          {expandedRow === index ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === index && (
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-4 py-2">
                        <div className="flex flex-col space-y-2 text-sm">
                          <p>
                            <strong>Contexto:</strong> {anteproyecto.contexto}
                          </p>
                          <p>
                            <strong>Justificación:</strong> {anteproyecto.justificacion}
                          </p>
                          {/* Agrega más campos si deseas verlos en detalle */}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AprobarProyectos;
