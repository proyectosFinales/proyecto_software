import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { descargarAnteproyectos, descargarAnteproyecto } from '../../controller/DescargarPDF';
import { errorToast } from '../components/toast';



const AnteproyectosCoordinador = () => {
  const [anteproyectos, setAnteproyectos] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filtroSemestre, setFiltroSemestre] = useState(() => {
    const mes = new Date().getMonth() + 1;
    return mes <= 7 ? "1" : "2";
  });
  const [filtroAnio, setFiltroAnio] = useState(() => String(new Date().getFullYear()));
  const [filtroEstado, setFiltroEstado] = useState("");
  const navigate = useNavigate();

  //Para ordenar alfabéticamente
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  // Generar lista de años: año siguiente, año actual y 5 años anteriores (total 7 años)
  const anioActual = new Date().getFullYear();
  const listaAnios = [];
  for (let i = 1; i >= -5; i--) {
    listaAnios.push(anioActual + i);
  }

  // Filtrar anteproyectos por semestre, año y estado
  // Filtrar anteproyectos por semestre y año
  const anteproyectosFiltrados = anteproyectos.filter(a => {
    const semestre = a.semestre ?? a.semestre_id;
    const anio = a.año ?? a.anio;
    const cumpleSemestre = !filtroSemestre || String(semestre) === String(filtroSemestre);
    const cumpleAnio = !filtroAnio || String(anio) === String(filtroAnio);
    return cumpleSemestre && cumpleAnio;
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
    descargarAnteproyectos(anteproyectosFiltrados);
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
          categoria_id,
          semestre,
          año,
          Categoria:categoria_id (
            nombre
          ),
          Estudiante:estudiante_id (
            carnet,
            id_usuario,
            situacion_laboral,
            Usuario:id_usuario (
              nombre,
              correo,
              telefono,
              sede,
              canton
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

      //Hacer la consulta del historial de reprobacion por aparte, ya que da error si se hace anidado por temas de como apunta las FK.
      const { data: historial, error: errorHist } = await supabase
        .from('HistorialReprobacion')
        .select('estudiante_id, causa, semestre, anio');

      if (!errorHist) {
        const porEstudiante = new Map();
        (historial || []).forEach(h => {
          if (!porEstudiante.has(h.estudiante_id)) porEstudiante.set(h.estudiante_id, []);
          porEstudiante.get(h.estudiante_id).push(h);
        });
        data.forEach(a => {
          a.HistorialReprobacion = porEstudiante.get(a.estudiante_id) || [];
        });
      }

      setAnteproyectos(data || []);
    };
    fetchAnteproyectos();
    
  }, []);

  // Funciones auxiliares para eliminación de anteproyecto
  const consultarContactos = async (nombreContact) => {
    try {
      const { data, error } = await supabase
        .from('ContactoEmpresa')
        .select(`
          id,
          nombre,
          AnteproyectoContact:anteproyectocontacto_contacto_id_fkey (
            contacto_id         
          )
        `)
        .eq('nombre', nombreContact);
      
      if(error) throw error;
      
      if(data && data.length > 0 && data[0].AnteproyectoContact && data[0].AnteproyectoContact.length === 1){
        return true;
      }
      return false;
    } catch(err) {
      console.error('Error al buscar contacto: ', err);
      return false;
    }
  };

  const consultarHR = async (nombreContact) => {
    try {
      const { data, error } = await supabase
        .from('ContactoEmpresa')
        .select(`
          id,
          nombre,
          AnteproyectoContact:AnteproyectoContacto_rrhh_id_fkey (
            contacto_id         
          )
        `)
        .eq('nombre', nombreContact);
      
      if(error) throw error;
      
      if(data && data.length > 0 && data[0].AnteproyectoContact && data[0].AnteproyectoContact.length === 1){
        return true;
      }
      return false;
    } catch(err) {
      console.error('Error al buscar contacto RRHH: ', err);
      return false;
    }
  };

  const consultarEmpresas = async (nombreEmpresa) => {
    try {
      const { data, error } = await supabase
        .from('Empresa')
        .select(`
          id,
          nombre,
          ContactoEmpresa:contactoempresa_empresa_id_fkey(
            nombre
          )
        `)
        .eq('nombre', nombreEmpresa)
        .single();
      
      if(error) throw error;
      
      if(data && data.ContactoEmpresa && data.ContactoEmpresa.length === 0){
        return true;
      }
      return false;
    } catch(err) {
      console.error('Error al buscar empresas', err);
      return false;
    }
  };

  const eliminarAnteproyecto = async (anteproyecto) => {
    const confirmDelete = window.confirm("¿Está seguro de que quiere borrar el anteproyecto?");
    if (!confirmDelete) return;

    try {
      const nombreAsesor = anteproyecto.AnteproyectoContacto?.[0]?.ContactoEmpresa?.nombre || '';
      const nombreHR = anteproyecto.AnteproyectoContacto?.[0]?.RRHH?.nombre || '';
      const nombreEmpresa = anteproyecto.Empresa?.nombre || '';

      // Verificar contactos
      const contactoCount = await consultarContactos(nombreAsesor);
      const rhCount = await consultarHR(nombreHR);
      
      // Eliminar correcciones
      await supabase
        .from('Correcciones')
        .delete()
        .eq('anteproyecto_id', anteproyecto.id);
      
      // Eliminar relación AnteproyectoContacto
      await supabase
        .from('AnteproyectoContacto')
        .delete()
        .eq('anteproyecto_id', anteproyecto.id);
      
      // Eliminar el anteproyecto
      const { error: deleteError } = await supabase
        .from('Anteproyecto')
        .delete()
        .eq('id', anteproyecto.id);
      
      if (deleteError) throw deleteError;

      // Eliminar contactos si solo estaban relacionados con este anteproyecto
      if(contactoCount === true && nombreAsesor){
        await supabase
          .from('ContactoEmpresa')
          .delete()
          .eq('nombre', nombreAsesor);
      }
      
      if(rhCount === true && nombreHR){
        await supabase
          .from('ContactoEmpresa')
          .delete()
          .eq('nombre', nombreHR);
      }
      
      // Eliminar empresa si no tiene más contactos
      const empresaCount = await consultarEmpresas(nombreEmpresa);
      if(empresaCount === true && nombreEmpresa){
        await supabase
          .from('Empresa')
          .delete()
          .eq('nombre', nombreEmpresa);
      }

      // Actualizar lista de anteproyectos
      setAnteproyectos(prev => prev.filter(a => a.id !== anteproyecto.id));
      
      alert('Anteproyecto eliminado exitosamente.');
    } catch (error) {
      console.error('Error al eliminar anteproyecto:', error);
      alert('Error al eliminar anteproyecto: ' + error.message);
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

        {/* Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <input
            type="text"
            className="border border-gray-300 rounded py-2 px-4 w-full sm:w-1/2"
            placeholder="Buscar anteproyectos..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Filtros y botón de reporte */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Semestre:</label>
            <select
              className="border rounded px-4 py-2 text-base min-w-[120px] h-12"
              value={filtroSemestre}
              onChange={e => setFiltroSemestre(e.target.value)}
            >
              <option value="">Todos</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Año:</label>
            <select
              className="border rounded px-4 py-2 text-base min-w-[120px] h-12"
              value={filtroAnio}
              onChange={e => setFiltroAnio(e.target.value)}
            >
              <option value="">Todos</option>
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
              <option value="Correccion">Para Corregir</option>
              <option value="Corregido">Corregido</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              style={{height: '48px'}}
            >
              Descargar reporte
            </button>
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
              {sortedAnteproyectos.map((anteproyecto) => (
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
                    <div className="flex flex-nowrap items-center gap-2">
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
                      {((anteproyecto.estado === "Reprobado") || (anteproyecto.estado === "Correccion")) && (
                        <button
                          onClick={() => eliminarAnteproyecto(anteproyecto)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Eliminar
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
