import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { descargarAnteproyecto } from '../../controller/DescargarPDF';
import { errorToast } from '../components/toast';
import * as XLSX from 'xlsx';

const AnteproyectosCoordinador = () => {
  const [anteproyectos, setAnteproyectos] = useState([]);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const handleRevisar = (id) => {
    navigate('/formulario-coordinador?id=' + id);
  };

  const handleGenerateReport = () => {
    if (anteproyectos.length === 0) {
      alert('No hay anteproyectos para generar el reporte');
      return;
    }

    const dataToExport = anteproyectos.map((p) => ({
      ID: p.id,
      'Nombre del Estudiante': p.Estudiante?.Usuario?.nombre || 'N/A',
      'Estado del proyecto': p.estado,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Anteproyectos');
    XLSX.writeFile(workbook, 'Reporte_Anteproyectos.xlsx');
  };

  useEffect(() => {
    const fetchAnteproyectos = async () => {
      const { data, error } = await supabase
        .from('Anteproyecto')
        .select(`
          id,
          empresa_id,
          contexto,
          justificacion,
          sintomas,
          estado,
          impacto,
          tipo,
          comentario,
          estudiante_id,
          actividad,
          departamento,
          comentario,
          Estudiante:estudiante_id (
            carnet,
            id_usuario,
            Usuario:id_usuario (
              nombre,
              correo,
              telefono,
              sede
            )
          ),
          Empresa:empresa_id (
            nombre,
            tipo,
            provincia,
            canton,
            distrito
          ),
          AnteproyectoContacto:anteproyectocontacto_anteproyecto_id_fkey (
            ContactoEmpresa:contacto_id(
              nombre,
              correo,
              departamento,
              telefono
            ),
            RRHH:rrhh_id(
              nombre,
              correo,
              telefono
            )
          )
        `);

      if (error) {
        alert('No se pudieron obtener los anteproyectos. ' + error.message);
        errorToast('No se pudieron obtener los anteproyectos');
        return;
      }
      setAnteproyectos(data || []);
    };
    fetchAnteproyectos();
  }, []);

  const cambiarEstado = async (anteproyecto) => {
    try {
      const { error } = await supabase
        .from('Anteproyecto')
        .update({ estado: 'Pendiente' })
        .eq('id', anteproyecto.id);

      if (error) {
        alert('No se pudo cambiar el estado del anteproyecto. ' + error.message);
      } else {
        setAnteproyectos((prev) =>
          prev.map((item) =>
            item.id === anteproyecto.id
              ? { ...item, estado: 'Pendiente' }
              : item
          )
        );
        alert('Estado del anteproyecto cambiado exitosamente.');
      }
    } catch (err) {
      console.error('Error cambiando el estado:', err);
      alert('Ocurrió un error al intentar cambiar el estado.');
    }
  };

  const eliminarAnteproyecto = async (id) => {
    const confirmacion = window.confirm("¿Está seguro de eliminar este anteproyecto?");
    if (!confirmacion) return;

    try {
      const { error } = await supabase
        .from('Anteproyecto')
        .delete()
        .eq('id', id);

      if (error) {
        alert('No se pudo eliminar el anteproyecto. ' + error.message);
        return;
      }
      setAnteproyectos((prev) => prev.filter((item) => item.id !== id));
      alert('Anteproyecto eliminado exitosamente.');
    } catch (err) {
      console.error('Error eliminando anteproyecto:', err);
      alert('Ocurrió un error al intentar eliminar el anteproyecto.');
    }
  };

  const filteredAnteproyectos = anteproyectos.filter((anteproyecto) => {
    // Convertimos el texto de búsqueda a minúsculas para hacer una comparación case-insensitive
    const lowerSearchText = searchText.toLowerCase();
  
    // Obtenemos los valores relevantes del anteproyecto
    const estudianteNombre = anteproyecto.Estudiante?.Usuario?.nombre?.toLowerCase() || '';
    const estado = anteproyecto.estado?.toLowerCase() || '';
    const empresaNombre = anteproyecto.Empresa?.nombre?.toLowerCase() || '';
  
    // Comprobamos si alguno de estos valores incluye el texto de búsqueda
    return (
      estudianteNombre.includes(lowerSearchText) ||
      estado.includes(lowerSearchText) ||
      empresaNombre.includes(lowerSearchText)
    );
  });
  

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title="Anteproyectos" />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6">
        {/* Search & Report */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <input
            type="text"
            className="border border-gray-300 rounded py-2 px-4 w-full sm:w-1/2"
            placeholder="Buscar anteproyectos..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Generar Reporte
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left border-b border-gray-300">Nombre</th>
                <th className="px-3 py-2 text-left border-b border-gray-300">Estado</th>
                <th className="px-3 py-2 text-left border-b border-gray-300">Empresa</th>
                <th className="px-3 py-2 text-left border-b border-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnteproyectos.map((anteproyecto) => (
                <tr key={anteproyecto.id} className="border-b border-gray-200">
                  <td className="px-3 py-2">
                    {anteproyecto.Estudiante?.Usuario?.nombre || "Sin nombre"}
                  </td>
                  <td className="px-3 py-2">
                    {anteproyecto.estado}
                  </td>
                  <td className="px-3 py-2">
                    {anteproyecto.Empresa?.nombre || "Sin empresa"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleRevisar(anteproyecto.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Revisar
                      </button>
                      <button
                        onClick={() => descargarAnteproyecto(anteproyecto)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Descargar
                      </button>
                      {(anteproyecto.estado !== "Pendiente" && anteproyecto.estado !== "Correccion") && (
                        <button
                          onClick={() => cambiarEstado(anteproyecto)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Pendiente
                        </button>
                      )}
                      <button
                        onClick={() => eliminarAnteproyecto(anteproyecto.id)}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnteproyectosCoordinador;
