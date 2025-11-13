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
  const [filtroSemestre, setFiltroSemestre] = useState(() => {
    const mes = new Date().getMonth() + 1;
    return mes <= 7 ? 1 : 2;
  });
  const [filtroAnio, setFiltroAnio] = useState(() => new Date().getFullYear());
  const [filtroEstado, setFiltroEstado] = useState("");
  const navigate = useNavigate();

  //Para ordenar alfabéticamente
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  // Generar lista de años (últimos 10)
  const anioActual = new Date().getFullYear();
  const listaAnios = Array.from({length: 10}, (_, i) => anioActual - i);

  // Filtrar anteproyectos por semestre, año y estado
  // Filtrar anteproyectos por semestre y año
  const anteproyectosFiltrados = anteproyectos.filter(a => {
    const semestre = a.semestre ?? a.semestre_id;
    const anio = a.año ?? a.anio;
    return String(semestre) === String(filtroSemestre) && String(anio) === String(filtroAnio);
  });

  // Filtrar por búsqueda
  const filteredAnteproyectos = anteproyectosFiltrados.filter((anteproyecto) => {
    const lowerSearchText = searchText.toLowerCase();
    const estudianteNombre = anteproyecto.Estudiante?.Usuario?.nombre?.toLowerCase() || '';
    const estado = anteproyecto.estado?.toLowerCase() || '';
    const empresaNombre = anteproyecto.Empresa?.nombre?.toLowerCase() || '';
    return (
      estudianteNombre.includes(lowerSearchText) ||
      estado.includes(lowerSearchText) ||
      empresaNombre.includes(lowerSearchText)
    );
  });

  // Filtrar por estado
  const finalAnteproyectos = filteredAnteproyectos.filter((a) => {
    if (!filtroEstado) return true;
    return (a.estado?.toLowerCase() || '') === filtroEstado.toLowerCase();
  });

  const handleRevisar = (id) => {
    navigate('/formulario-coordinador?id=' + id);
  };

  const handleGenerateReport = () => {
    if (anteproyectos.length === 0) {
      alert('No hay anteproyectos para generar el reporte');
      return;
    }

    const dataToExport = anteproyectos.map((p) => ({
      // El orden nuevo solicitado
      ID: p.id,
      'Estatus del proyecto': p.estado,
      'Sede': p.Estudiante.Usuario.sede,
      'Nombre del estudiante': p.Estudiante?.Usuario?.nombre || 'N/A',
      'Carnet': p.Estudiante.carnet,
      'Teléfono del estudiante': p.Estudiante.Usuario.telefono,
      'Correo del estudiante': p.Estudiante.Usuario.correo,
      'Nombre de la empresa': p.Empresa.nombre,
      'Tipo de empresa': p.Empresa.tipo,
      'Actividad de la empresa': p.Empresa.actividad,
      'Ubicación de la empresa (provincia)': p.Empresa.provincia,
      'Ubicación de la empresa (cantón)': p.Empresa.canton,
      'Ubicación de la empresa (distrito)': p.Empresa.distrito,
      'Nombre del asesor industrial': p.AnteproyectoContacto[0].ContactoEmpresa.nombre,
      'Puesto que desempeña el asesor industrial': p.AnteproyectoContacto[0].ContactoEmpresa.departamento,
      'Teléfono del asesor industrial': p.AnteproyectoContacto[0].ContactoEmpresa.telefono,
      'Correo del asesor industrial': p.AnteproyectoContacto[0].ContactoEmpresa.correo,
      'Nombre del contacto de recursos humanos': p.AnteproyectoContacto[0].RRHH.nombre,
      'Teléfono del contacto de recursos humanos': p.AnteproyectoContacto[0].RRHH.telefono,
      'Correo del contacto de recursos humanos': p.AnteproyectoContacto[0].RRHH.correo,
      'Contexto': p.contexto,
      'Justificación': p.justificacion,
      'Síntomas': p.sintomas,
      'Efectos o impactos': p.impacto,
      'Departamento donde realizará el proyecto': p.departamento,
      'Tipo de proyecto': p.tipo,
      'Categoría del proyecto': p.Categoria.nombre,
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
          categoria_id,
          semestre,
          año,
          Categoria:categoria_id (
            nombre
          ),
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
          Correcciones:correcciones_anteproyecto_id_fkey (
            seccion,
            contenido
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

      if(bitacoras.length > 0){
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
      }

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


  // (Eliminado: filtrado duplicado de filteredAnteproyectos)
  
  // Ordenamiento alfabético
  const sortedAnteproyectos = React.useMemo(() => {
    if (!sortField) return finalAnteproyectos; // Sin orden
    return [...finalAnteproyectos].sort((a, b) => {
      let aValue = '', bValue = '';
      if (sortField === 'nombre') {
        aValue = a.Estudiante?.Usuario?.nombre?.toLowerCase() || '';
        bValue = b.Estudiante?.Usuario?.nombre?.toLowerCase() || '';
      } else if (sortField === 'estado') {
        aValue = a.estado?.toLowerCase() || '';
        bValue = b.estado?.toLowerCase() || '';
      } else if (sortField === 'empresa') {
        aValue = a.Empresa?.nombre?.toLowerCase() || '';
        bValue = b.Empresa?.nombre?.toLowerCase() || '';
      }
      if (aValue < bValue) return sortAsc ? -1 : 1;
      if (aValue > bValue) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredAnteproyectos, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField !== field) {
      setSortField(field);
      setSortAsc(true);
    } else if (sortAsc) {
      setSortAsc(false);
    } else {
      setSortField(null); // Estado "sin orden"
      setSortAsc(true);
    }
  };

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

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Semestre:</label>
            <select
              className="border rounded px-4 py-2 text-base min-w-[120px] h-12"
              value={filtroSemestre}
              onChange={e => setFiltroSemestre(Number(e.target.value))}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Año:</label>
            <select
              className="border rounded px-4 py-2 text-base min-w-[120px] h-12"
              value={filtroAnio}
              onChange={e => setFiltroAnio(Number(e.target.value))}
            >
              {listaAnios.map(anio => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado:</label>
            <select
              className="border rounded px-4 py-2 text-base min-w-[120px] h-12"
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Reprobado">Reprobado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Correccion">Correccion</option>
            </select>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left border-b border-gray-300"
                    onClick={() => handleSort('nombre')}>
                      Nombre &nbsp;
                      <span style={{fontSize: '0.9em'}}>
                        <span style={{
                          color: sortField === 'nombre' && sortAsc ? '#1d4ed8' : '#bbb',
                          fontWeight: sortField === 'nombre' && sortAsc ? 'bold' : 'normal'
                        }}>▲</span>
                        <span style={{
                          color: sortField === 'nombre' && !sortAsc ? '#1d4ed8' : '#bbb',
                          fontWeight: sortField === 'nombre' && !sortAsc ? 'bold' : 'normal'
                        }}>▼</span>
                      </span></th>
                <th className="px-3 py-2 text-left border-b border-gray-300"
                    onClick={() => handleSort('estado')}>
                      Estado&nbsp;
                      <span style={{fontSize: '0.9em'}}>
                        <span style={{
                          color: sortField === 'estado' && sortAsc ? '#1d4ed8' : '#bbb',
                          fontWeight: sortField === 'estado' && sortAsc ? 'bold' : 'normal'
                        }}>▲</span>
                        <span style={{
                          color: sortField === 'estado' && !sortAsc ? '#1d4ed8' : '#bbb',
                          fontWeight: sortField === 'estado' && !sortAsc ? 'bold' : 'normal'
                        }}>▼</span>
                      </span></th>
                <th className="px-3 py-2 text-left border-b border-gray-300"
                    onClick={() => handleSort('empresa')}>
                      Empresa &nbsp;
                      <span style={{fontSize: '0.9em'}}>
                        <span style={{
                          color: sortField === 'empresa' && sortAsc ? '#1d4ed8' : '#bbb',
                          fontWeight: sortField === 'empresa' && sortAsc ? 'bold' : 'normal'
                        }}>▲</span>
                        <span style={{
                          color: sortField === 'empresa' && !sortAsc ? '#1d4ed8' : '#bbb',
                          fontWeight: sortField === 'empresa' && !sortAsc ? 'bold' : 'normal'
                        }}>▼</span>
                      </span></th>
                <th className="px-3 py-2 text-left border-b border-gray-300">Semestre</th>
                <th className="px-3 py-2 text-left border-b border-gray-300">Año</th>
                <th className="px-3 py-2 text-left border-b border-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedAnteproyectos
                .filter(a => {
                  const semestre = a.semestre ?? a.semestre_id;
                  const anio = a.año ?? a.anio;
                  return String(semestre) === String(filtroSemestre) && String(anio) === String(filtroAnio);
                })
                .map((anteproyecto) => (
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
                  <td className="px-3 py-2">{anteproyecto.semestre ?? anteproyecto.semestre_id ?? ''}</td>
                  <td className="px-3 py-2">{anteproyecto.año ?? anteproyecto.anio ?? ''}</td>
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
