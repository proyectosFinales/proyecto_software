/**
 * AprobarProyectos.jsx
 * Pantalla para que el coordinador cambie proyectos a "Finalizado" (aprobado) o "Perdido" (reprobado).
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../model/Cliente';
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
    const { data, error } = await supabase
      .from('Anteproyecto')  // Cambia 'anteproyectos'
      .select(`
        id,
        sede,
        tipoEmpresa,
        nombreEmpresa,
        actividadEmpresa,
        distritoEmpresa,
        cantonEmpresa,
        provinciaEmpresa,
        nombreAsesor,
        puestoAsesor,
        telefonoContacto,
        correoContacto,
        nombreHR,
        telefonoHR,
        correoHR,
        contexto,
        justificacion,
        sintomas,
        impacto,
        nombreDepartamento,
        tipoProyecto,
        observaciones,
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
      .eq('semestre_id', 1) // ajusta si usas semestres
      .or('estado.eq.Aprobado,estado.eq.Perdido,estado.eq.Finalizado'); // ajusta a tu enum
    if (error) {
      errorToast('No se pudieron obtener los anteproyectos: ' + error.message);
    } else {
      setAnteproyectos(data || []);
    }
  };

  async function aprobar(id) {
    const confirmAprobar = window.confirm("¿Está seguro de APROBAR el proyecto?");
    if(!confirmAprobar) return;

    try {
      const { error } = await supabase
        .from('Anteproyecto')
        .update({ estado: "Finalizado" }) // Ajusta si tu enum final es "Finalizado"
        .eq('id', id);
      if (error) {
        console.error('Error al actualizar proyecto:', error);
        errorToast(error.message);
        return;
      }

      successToast('Proyecto actualizado exitosamente');
      fetchAnteproyectos();
    } catch (error) {
      errorToast('Error al actualizar proyecto: ' + error);
    }
  }

  async function reprobar(id) {
    const confirmReprobar = window.confirm("¿Está seguro de REPROBAR el proyecto?");
    if(!confirmReprobar) return;

    try {
      const { error } = await supabase
        .from('Anteproyecto')
        .update({ estado: "Perdido" })
        .eq('id', id);
      if (error) {
        console.error('Error al actualizar proyecto:', error);
        errorToast(error.message);
        return;
      }

      successToast('Proyecto actualizado exitosamente');
      fetchAnteproyectos();
    } catch (error) {
      errorToast('Error al actualizar proyecto: ' + error);
    }
  }

  const toggleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
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
                <React.Fragment key={index}>
                  <tr className="border-b">
                    <td className="px-4 py-2">{anteproyecto.nombre}</td>
                    <td className="px-4 py-2">{anteproyecto.estado}</td>
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
                          onClick={() => toggleExpandRow(anteproyecto.id)}
                        >
                          {expandedRow === index ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Extra row details if expanded */}
                  {expandedRow === index && (
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-4 py-2">
                        <div className="flex flex-col space-y-2 text-sm">
                          <p><strong>Contexto:</strong> {anteproyecto.contexto}</p>
                          <p><strong>Justificación:</strong> {anteproyecto.justificacion}</p>
                          {/* etc. ... */}
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
