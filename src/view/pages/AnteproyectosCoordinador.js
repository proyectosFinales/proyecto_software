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
      'Carnet': p.Estudiante.carnet,
      'Correo': p.Estudiante.Usuario.correo,
      'Correo': p.Estudiante.Usuario.telefono,
      'Sede': p.Estudiante.Usuario.sede,
      'Empresa': p.Empresa.nombre,
      'Tipo de Empresa': p.Empresa.tipo,
      'Actividad de empresa': p.Empresa.actividad,
      'Provincia': p.Empresa.provincia,
      'Cantón': p.Empresa.canton,
      'Distrito': p.Empresa.distrito,
      'Contacto Asesor': p.AnteproyectoContacto[0].ContactoEmpresa.nombre,
      'Puesto': p.AnteproyectoContacto[0].ContactoEmpresa.departamento,
      'Telefono': p.AnteproyectoContacto[0].ContactoEmpresa.telefono,
      'Correo': p.AnteproyectoContacto[0].ContactoEmpresa.correo,
      'Contacto RRHH': p.AnteproyectoContacto[0].RRHH.nombre,
      'Puesto': p.AnteproyectoContacto[0].RRHH.departamento,
      'Telefono': p.AnteproyectoContacto[0].RRHH.telefono,
      'Correo': p.AnteproyectoContacto[0].RRHH.correo,
      'Estado del proyecto': p.estado,
      'Contexto': p.contexto,
      'Justificación': p.justificacion,
      'Síntomas': p.sintomas,
      'Impacto': p.impacto,
      'Observaciones': p.observaciones,
      
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
            distrito,
            actividad
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
    // 1. Buscar el proyecto asociado al anteproyecto
    const { data: proyectos, error: fetchError } = await supabase
      .from('Proyecto')
      .select('id, estudiante_id, profesor_id')
      .eq('anteproyecto_id', anteproyecto.id);

    if (fetchError) throw fetchError;

    if (proyectos.length > 0) {
      const proyecto = proyectos[0];

      const {data: bitacoras, error: bitacoraFetchError} = await supabase
        .from('Bitacora')
        .select('id')
        .eq('proyecto_id', proyecto.id);
      if (bitacoraFetchError) throw bitacoraFetchError;

      const bitacora = bitacoras[0];

      const { error: deteleEntrada} = await supabase
        .from('Entrada')
        .delete()
        .eq('bitacora_id', bitacora.id);
      if (deteleEntrada) throw deteleEntrada;

      const { error: bitacoraError } = await supabase
        .from('Bitacora')
        .delete()
        .eq('proyecto_id', proyecto.id);
      if (bitacoraError) throw bitacoraError;

      const {error: deleteAvance} = await supabase
        .from('Avance')
        .delete()
        .eq('proyecto_id', proyecto.id);
      if (deleteAvance) throw deleteAvance;

      const { error: deleteCitaError } = await supabase
        .from('Cita')
        .delete()
        .eq('proyecto_id', proyecto.id);
      if (deleteCitaError) throw deleteCitaError;

      // 2. Eliminar el proyecto encontrado
      const { error: deleteProyectoError } = await supabase
        .from('Proyecto')
        .delete()
        .eq('id', proyecto.id);
      if (deleteProyectoError) throw deleteProyectoError;

      // 3. Actualizar el estudiante para quitar la relación con el asesor
      const { error: updateEstudianteError } = await supabase
        .from('Estudiante')
        .update({ asesor: null })
        .eq('estudiante_id', proyecto.estudiante_id);
      if (updateEstudianteError) throw updateEstudianteError;

      // 4. Aumentar en 1 el número de estudiantes libres del profesor
      const { data, error: fetchError } = await supabase
        .from('Profesor')
        .select('estudiantes_libres')
        .eq('profesor_id', proyecto.profesor_id)
        .single();

      if (fetchError) throw fetchError;

      const nuevoValor = data.estudiantes_libres + 1;

      const { error: updateError } = await supabase
        .from('Profesor')
        .update({ estudiantes_libres: nuevoValor })
        .eq('profesor_id', proyecto.profesor_id);

      if (updateError) throw updateError;
    }

    // 5. Actualizar el estado del anteproyecto a "Pendiente"
    const { error: updateAnteproyectoError } = await supabase
      .from('Anteproyecto')
      .update({ estado: 'Pendiente' })
      .eq('id', anteproyecto.id);
    if (updateAnteproyectoError) throw updateAnteproyectoError;

    // 6. Actualizar el estado en el estado de React
    setAnteproyectos((prev) =>
      prev.map((item) =>
        item.id === anteproyecto.id
          ? { ...item, estado: 'Pendiente' }
          : item
      )
    );

    alert('Estado del anteproyecto cambiado exitosamente y se eliminó el proyecto asociado.');
  } catch (err) {
    console.error('Error cambiando el estado:', err);
    alert('Ocurrió un error al intentar cambiar el estado: ' + err.message);
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
                    {(anteproyecto.estado !== "Correccion") && (
                      <button
                        onClick={() => handleRevisar(anteproyecto.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Revisar
                      </button>
                    )}
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
