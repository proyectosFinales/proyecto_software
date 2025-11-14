import { useNavigate } from "react-router-dom";
/**
 * EdicionAsignacionProyectos.jsx
 * Ventana para asignar manualmente Anteproyectos a profesores,
 * ver reporte, deasignar, etc.
 */
import React, { useEffect, useState, useRef } from "react";
import Anteproyecto from "../../../controller/anteproyecto";
import Button from "../../components/button";
import Modal from "../../components/modal.jsx";
import { FloatInput } from "../../components/input.jsx";
import { errorToast, successToast } from "../../components/toast";
import supabase from "../../../model/supabase";
import HeaderCoordinador from "../../components/HeaderCoordinador";
import Footer from "../../components/Footer";
import Profesor from "../../../controller/profesor.js";
import { fetchSemestreActual } from "../../../controller/Semestre";
import sendMail from "../../../controller/Email";
import { obtenerEstudiante } from "../../../controller/edicionController.js";

/**
 * EdicionAsignacionProyectos
 * Muestra proyectos (Proyecto) y los profesores (Profesor) para asignar o desasignar.
 * - Proyecto.profesor_id -> la relación con Profesor (profesor_id).
 * - Profesor.id_usuario, etc.
 * 
 * @returns JSX
 */
function EdicionAsignacionProyectos() {
  const navigate = useNavigate();
  // Descarga CSV de los proyectos filtrados
  function descargarCSV() {
    if (!proyectosFiltrados.length) return;
    const encabezados = [
      'Estudiante',
      'Carnet',
      'Empresa',
      'Departamento',
      'Categoría de anteproyecto',
      'Semestre',
      'Año',
      'Estado',
      'Profesor',
      'Categoría de profesor'
    ];
    const filas = proyectosFiltrados.map((proyecto) => {
      const assignedProf = profesores.find((prof) => prof.profesor_id === proyecto.profesor_id);
      return [
        proyecto.Estudiante?.Usuario?.nombre ?? '',
        proyecto.Estudiante?.carnet ?? '',
        proyecto.Anteproyecto?.Empresa?.nombre ?? '',
        proyecto.Anteproyecto?.departamento ?? '',
        proyecto.Anteproyecto?.Categoria?.nombre ?? '',
        proyecto.semestre ?? '',
        proyecto.año ?? '',
        proyecto.estado ?? '',
        assignedProf ? assignedProf.nombre : '',
        assignedProf ? (assignedProf.categoria ?? '') : ''
      ];
    });
    const csvContent = [
      encabezados.join(','),
      ...filas.map(fila => fila.map(valor => `"${String(valor).replace(/"/g, '""')}` + '"').join(','))
    ].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_proyectos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  // Obtener semestre y año actual igual que en HeaderCoordinador
  const fecha = new Date();
  const anoActual = fecha.getFullYear();
  const mes = fecha.getMonth() + 1;
  const semestreActual = mes <= 7 ? 1 : 2;
  const [proyectos, setProyectos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [filteredProfesores, setFilteredProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  // Filtros de semestre, año y estado
  const [filtroSemestre, setFiltroSemestre] = useState(String(semestreActual));
  const [filtroAno, setFiltroAno] = useState(String(anoActual));
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  // Estado para ordenamiento de columnas
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  /**
   * Carga la lista de proyectos y profesores.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: proyectosData, error: proyectosError } = await supabase
          .from("Proyecto")
          .select(`
            id,
            profesor_id,
            estudiante_id,
            anteproyecto_id,
            estado,
            fecha_inicio,
            fecha_fin,
            semestre,
            año,
            Estudiante:estudiante_id (
              estudiante_id,
              carnet,
              Usuario:id_usuario (
                id,
                nombre,
                correo
              )
            ),
            Anteproyecto:anteproyecto_id (
              departamento,
              empresa_id,
              categoria_id,
              Empresa: empresa_id (
                nombre
              ),
              Categoria: categoria_id (
                nombre
              )
            )
          `);

        if (proyectosError) {
          console.error("Error fetching Proyectos:", proyectosError);
          return;
        }

        setProyectos(proyectosData);
        Profesor.obtenerTodos().then((profesoresData) => {
          setProfesores(profesoresData);
        }).catch(console.error);
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

    useEffect(() => {
      // Filtra profesores que tienen disponibilidad mayor a asignados
      // Ya no es necesario filtrar aquí porque el filtrado se hace por proyecto
      // en el render del select
      setFilteredProfesores(profesores);
    }, [profesores]);

  /**
   * Asigna un profesor a un proyecto (UPDATE Proyecto.profesor_id).
   * @param {string} proyectoId
   * @param {string} profesorId
   */
  const handleAssign = async (proyectoId, profesorId, estudianteId) => {
    if (!profesorId) return;
    try {
      const proyecto = proyectos.find(proj => proj.id === proyectoId);
      const profesorAnteriorId = proyecto.profesor_id;

      // Obtener datos actuales de asignaciones del profesor para el semestre/año del proyecto
      const profActual = profesores.find(p => 
        p.profesor_id === profesorId && 
        p.semestre === proyecto.semestre && 
        p.año === proyecto.año
      );
      
      if (!profActual) {
        errorToast("El profesor no tiene asignación para este semestre/año.");
        return;
      }
      
      const asignados = profActual?.original?.proyectosAsignados ?? 0;
      const disponibilidad = profActual?.original?.disponibilidad ?? 0;
      if (asignados + 1 > disponibilidad) {
        errorToast("No se puede asignar: el profesor ya alcanzó su disponibilidad máxima.");
        return;
      }

      // Actualizar el proyecto con el nuevo profesor y estado Asignado
      const { proyectoError } = await supabase
        .from("Proyecto")
        .update({ profesor_id: profesorId, estado: "Asignado" })
        .eq("id", proyectoId);
      if (proyectoError) throw proyectoError;

      // Actualizar el estudiante con el nuevo asesor
      const { estudianteError } = await supabase
        .from("Estudiante")
        .update({ asesor: profesorId })
        .eq("estudiante_id", estudianteId);
      if (estudianteError) throw estudianteError;

      // Sumar 1 a asignados en AsignacionesProfesor para el nuevo profesor en el semestre/año específico
      const { error: asignacionError } = await supabase
        .from("AsignacionesProfesor")
        .update({ asignados: asignados + 1 })
        .eq("idProfesor", profesorId)
        .eq("semestre", proyecto.semestre)
        .eq("año", proyecto.año);
      if (asignacionError) throw asignacionError;

      // Si había un profesor anterior, restar 1 a asignados en AsignacionesProfesor
      if (profesorAnteriorId) {
        const profAnterior = profesores.find(p => 
          p.profesor_id === profesorAnteriorId && 
          p.semestre === proyecto.semestre && 
          p.año === proyecto.año
        );
        const asignadosAnterior = profAnterior?.original?.proyectosAsignados ?? 0;
        await supabase
          .from("AsignacionesProfesor")
          .update({ asignados: Math.max(0, asignadosAnterior - 1) })
          .eq("idProfesor", profesorAnteriorId)
          .eq("semestre", proyecto.semestre)
          .eq("año", proyecto.año);
      }

      setProyectos((prevProyectos) =>
        prevProyectos.map((proj) =>
          proj.id === proyectoId ? { ...proj, profesor_id: profesorId, estado: "Asignado" } : proj
        )
      );

      setProfesores((prevProfesores) =>
        prevProfesores.map((prof) => {
          if (prof.profesor_id === profesorId && prof.semestre === proyecto.semestre && prof.año === proyecto.año) {
            return { ...prof, original: { ...prof.original, proyectosAsignados: asignados + 1 }, proyectosAsignados: asignados + 1 };
          } else if (prof.profesor_id === profesorAnteriorId && prof.semestre === proyecto.semestre && prof.año === proyecto.año) {
            return { ...prof, original: { ...prof.original, proyectosAsignados: Math.max(0, (prof.original.proyectosAsignados ?? 0) - 1) }, proyectosAsignados: Math.max(0, (prof.proyectosAsignados ?? 0) - 1) };
          } else {
            return prof;
          }
        })
      );

      alert("Proyecto asignado exitosamente");
    } catch (err) {
      console.error("handleAssign error:", err);
      errorToast("Error al asignar el proyecto");
    }
  };

  /**
   * Desasigna el profesor de un proyecto (UPDATE Proyecto.profesor_id = null).
   * @param {string} proyectoId
   */
  const handleUnassign = async (proyectoId, estudianteId, profesorId) => {
    try {
      const proyecto = proyectos.find(proj => proj.id === proyectoId);
      
      // Obtener datos actuales de asignaciones del profesor para el semestre/año del proyecto
      const profActual = profesores.find(p => 
        p.profesor_id === profesorId && 
        p.semestre === proyecto.semestre && 
        p.año === proyecto.año
      );
      const asignados = profActual?.original?.proyectosAsignados ?? 0;

      const { error: proyectoError } = await supabase
        .from("Proyecto")
        .update({ profesor_id: null, estado: "Pendiente" })
        .eq("id", proyectoId);
      if (proyectoError) throw proyectoError;

      const { estudianteError } = await supabase
        .from("Estudiante")
        .update({ asesor: null })
        .eq("estudiante_id", estudianteId);
      if (estudianteError) throw estudianteError;

      // Restar 1 a asignados en AsignacionesProfesor para el profesor en el semestre/año específico
      const { error: asignacionError } = await supabase
        .from("AsignacionesProfesor")
        .update({ asignados: Math.max(0, asignados - 1) })
        .eq("idProfesor", profesorId)
        .eq("semestre", proyecto.semestre)
        .eq("año", proyecto.año);
      if (asignacionError) throw asignacionError;

      setProyectos((prevProyectos) =>
        prevProyectos.map((proj) =>
          proj.id === proyectoId ? { ...proj, profesor_id: null, estado: "Pendiente" } : proj
        )
      );

      setProfesores((prevProfesores) =>
        prevProfesores.map((prof) =>
          prof.profesor_id === profesorId && prof.semestre === proyecto.semestre && prof.año === proyecto.año
            ? { ...prof, original: { ...prof.original, proyectosAsignados: Math.max(0, (prof.original.proyectosAsignados ?? 0) - 1) }, proyectosAsignados: Math.max(0, (prof.proyectosAsignados ?? 0) - 1) }
            : prof
        )
      );

      alert("Proyecto desasignado exitosamente");
    } catch (err) {
      console.error("handleUnassign error:", err);
      alert("Error al desasignar el proyecto");
    }
  };

  const handleEstadoChange = async (proyectoId, nuevoEstado, estudianteId) => {
    try{
      const { proyectoError } = await supabase
        .from("Proyecto")
        .update({ estado: nuevoEstado })
        .eq("id", proyectoId);

      if (proyectoError) throw proyectoError;

      fetchSemestreActual().then(async (semestreId) => {
        const { estudianteError } = await supabase
          .from("Estudiante")
          .update({ estado: nuevoEstado === 'Aprobado' ? 'defensa' : 'reprobado',
            semestre_id: semestreId
           })
          .eq("estudiante_id", estudianteId);

          if (estudianteError) throw estudianteError;
      }).catch((err) => {throw err;});

      setProyectos((prevProyectos) =>
        prevProyectos.map((proj) =>
          proj.id === proyectoId ? { ...proj, estado: nuevoEstado } : proj
        )
      );
      //Enviar correo de comprobación al estudiante
      await enviarCorreo(estudianteId, nuevoEstado);
      alert("Estado actualizado exitosamente");

    } catch (err) {
      console.error("handleEstadoChange error:", err);
      alert("Error al actualizar el estado del proyecto");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <HeaderCoordinador />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-xl">Cargando información...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Filtros de semestre, año y estado sobre los proyectos
  let proyectosFiltrados = proyectos.filter(
    (proy) =>
      (filtroSemestre === 'Todos' || proy.semestre === Number(filtroSemestre)) &&
      (filtroAno === 'Todos' || proy.año === Number(filtroAno)) &&
      (filtroEstado === 'Todos' || proy.estado === filtroEstado)
  );

  // Ordenar proyectos según sortConfig
  if (sortConfig.key) {
    proyectosFiltrados = [...proyectosFiltrados].sort((a, b) => {
      let aValue = a;
      let bValue = b;
      // Soporte para campos anidados
      for (const part of sortConfig.key.split('.')) {
        aValue = aValue?.[part];
        bValue = bValue?.[part];
      }
      // Si es null o undefined, convertir a string vacío para evitar errores
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Filtro de semestre: solo 1 y 2
  const listaSemestres = ['Todos', 1, 2];
  // Filtro de año: año siguiente, año actual y 5 años anteriores
  const listaAnios = ['Todos'];
  for (let i = 1; i >= -5; i--) {
    listaAnios.push(anoActual + i);
  }

  // Función para manejar el ordenamiento
  function handleSort(key) {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Alternar dirección
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  }

  const enviarCorreo = async (estID, estado) => {
    const estudiante = await obtenerEstudiante(estID);
    console.log("El estudiante:", estudiante);
    //Mensajes a enviar por correo segun si se aprueba o no un proyecto
    const mensajeAprobado = `Buenas,\n` +
      `Se le comunica que el proyecto final de graduación presentado por ${estudiante[0].Usuario.nombre}, carnet ${estudiante[0].carnet}, ` +
      `correo ${estudiante[0].Usuario.correo}, ha sido APROBADO por el coordinador.\n` +
      `\nInstituto Tecnológico de Costar Rica,\n` +
      `Escuela de Producción Industrial.`;
    const mensajeSuspendido = `Buenas,\n` +
      `Se le comunica que el proyecto final de graduación presentado por ${estudiante[0].Usuario.nombre}, carnet ${estudiante[0].carnet}, ` +
      `correo ${estudiante[0].Usuario.correo}, ha sido APROBADO por el coordinador.\n` +
      `\nDe tener alguna consulta por favor comunpíquese con la coordinación.\n` +
      `\nInstituto Tecnológico de Costar Rica,\n` +
      `Escuela de Producción Industrial.`;

    //Se le comunica al estudiante
    if (estado === "Aprobado") {
      sendMail(estudiante[0].Usuario.correo, 'Proyecto Aprobado', mensajeAprobado);
    }else {
      sendMail(estudiante[0].Usuario.correo, 'Proyecto Suspendido', mensajeSuspendido);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <HeaderCoordinador title="Asignación de Proyectos a Profesores" />
      <main className="flex-grow p-4 sm:p-8">
        <h1 className="text-2xl font-semibold mb-4">Lista de Proyectos</h1>
        {/* Filtros de semestre, año y estado */}
  <div className="flex flex-wrap gap-4 mb-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Semestre</label>
            <select
              className="border rounded px-2 py-1 min-w-[100px]"
              value={filtroSemestre}
              onChange={(e) => setFiltroSemestre(e.target.value)}
            >
              {listaSemestres.map((sem) => (
                <option key={sem} value={sem}>{sem === 'Todos' ? 'Todos' : sem}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Año</label>
            <select
              className="border rounded px-2 py-1 min-w-[100px]"
              value={filtroAno}
              onChange={(e) => setFiltroAno(e.target.value)}
            >
              {listaAnios.map((anio) => (
                <option key={anio} value={anio}>{anio === 'Todos' ? 'Todos' : anio}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              className="border rounded px-2 py-1 min-w-[120px]"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Asignado">Asignado</option>
              <option value="Suspendido">Suspendido</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Reprobado">Reprobado</option>
            </select>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
            onClick={descargarCSV}
            disabled={proyectosFiltrados.length === 0}
          >
            Descargar reporte CSV
          </button>
        </div>
        {proyectosFiltrados.length === 0 ? (
          <p className="bg-white p-4 shadow rounded">No existen proyectos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('Estudiante.Usuario.nombre')}>
                    Estudiante&nbsp;
                    <span style={{fontSize: '0.9em'}}>
                      <span style={{color: sortConfig.key === 'Estudiante.Usuario.nombre' && sortConfig.direction === 'asc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'Estudiante.Usuario.nombre' && sortConfig.direction === 'asc' ? 'bold' : 'normal'}}>▲</span>
                      <span style={{color: sortConfig.key === 'Estudiante.Usuario.nombre' && sortConfig.direction === 'desc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'Estudiante.Usuario.nombre' && sortConfig.direction === 'desc' ? 'bold' : 'normal'}}>▼</span>
                    </span>
                  </th>
                  <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('Estudiante.carnet')}>
                    Carnet&nbsp;
                    <span style={{fontSize: '0.9em'}}>
                      <span style={{color: sortConfig.key === 'Estudiante.carnet' && sortConfig.direction === 'asc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'Estudiante.carnet' && sortConfig.direction === 'asc' ? 'bold' : 'normal'}}>▲</span>
                      <span style={{color: sortConfig.key === 'Estudiante.carnet' && sortConfig.direction === 'desc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'Estudiante.carnet' && sortConfig.direction === 'desc' ? 'bold' : 'normal'}}>▼</span>
                    </span>
                  </th>
                  <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('Anteproyecto.Empresa.nombre')}>
                    Empresa&nbsp;
                    <span style={{fontSize: '0.9em'}}>
                      <span style={{color: sortConfig.key === 'Anteproyecto.Empresa.nombre' && sortConfig.direction === 'asc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'Anteproyecto.Empresa.nombre' && sortConfig.direction === 'asc' ? 'bold' : 'normal'}}>▲</span>
                      <span style={{color: sortConfig.key === 'Anteproyecto.Empresa.nombre' && sortConfig.direction === 'desc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'Anteproyecto.Empresa.nombre' && sortConfig.direction === 'desc' ? 'bold' : 'normal'}}>▼</span>
                    </span>
                  </th>
                  <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('Anteproyecto.departamento')}>
                    Departamento&nbsp;
                    <span style={{fontSize: '0.9em'}}>
                      <span style={{color: sortConfig.key === 'Anteproyecto.departamento' && sortConfig.direction === 'asc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'Anteproyecto.departamento' && sortConfig.direction === 'asc' ? 'bold' : 'normal'}}>▲</span>
                      <span style={{color: sortConfig.key === 'Anteproyecto.departamento' && sortConfig.direction === 'desc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'Anteproyecto.departamento' && sortConfig.direction === 'desc' ? 'bold' : 'normal'}}>▼</span>
                    </span>
                  </th>
                  <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('Anteproyecto.Categoria.nombre')}>
                    Categoría de anteproyecto&nbsp;
                    <span style={{fontSize: '0.9em'}}>
                      <span style={{color: sortConfig.key === 'Anteproyecto.Categoria.nombre' && sortConfig.direction === 'asc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'Anteproyecto.Categoria.nombre' && sortConfig.direction === 'asc' ? 'bold' : 'normal'}}>▲</span>
                      <span style={{color: sortConfig.key === 'Anteproyecto.Categoria.nombre' && sortConfig.direction === 'desc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'Anteproyecto.Categoria.nombre' && sortConfig.direction === 'desc' ? 'bold' : 'normal'}}>▼</span>
                    </span>
                  </th>
                  <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('semestre')}>
                    Semestre&nbsp;
                    <span style={{fontSize: '0.9em'}}>
                      <span style={{color: sortConfig.key === 'semestre' && sortConfig.direction === 'asc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'semestre' && sortConfig.direction === 'asc' ? 'bold' : 'normal'}}>▲</span>
                      <span style={{color: sortConfig.key === 'semestre' && sortConfig.direction === 'desc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'semestre' && sortConfig.direction === 'desc' ? 'bold' : 'normal'}}>▼</span>
                    </span>
                  </th>
                  <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('año')}>
                    Año&nbsp;
                    <span style={{fontSize: '0.9em'}}>
                      <span style={{color: sortConfig.key === 'año' && sortConfig.direction === 'asc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'año' && sortConfig.direction === 'asc' ? 'bold' : 'normal'}}>▲</span>
                      <span style={{color: sortConfig.key === 'año' && sortConfig.direction === 'desc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'año' && sortConfig.direction === 'desc' ? 'bold' : 'normal'}}>▼</span>
                    </span>
                  </th>
                  <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('estado')}>
                    Estatus del proyecto&nbsp;
                    <span style={{fontSize: '0.9em'}}>
                      <span style={{color: sortConfig.key === 'estado' && sortConfig.direction === 'asc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'estado' && sortConfig.direction === 'asc' ? 'bold' : 'normal'}}>▲</span>
                      <span style={{color: sortConfig.key === 'estado' && sortConfig.direction === 'desc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'estado' && sortConfig.direction === 'desc' ? 'bold' : 'normal'}}>▼</span>
                    </span>
                  </th>
                  <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('profesor_id')}>
                    Profesor&nbsp;
                    <span style={{fontSize: '0.9em'}}>
                      <span style={{color: sortConfig.key === 'profesor_id' && sortConfig.direction === 'asc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'profesor_id' && sortConfig.direction === 'asc' ? 'bold' : 'normal'}}>▲</span>
                      <span style={{color: sortConfig.key === 'profesor_id' && sortConfig.direction === 'desc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'profesor_id' && sortConfig.direction === 'desc' ? 'bold' : 'normal'}}>▼</span>
                    </span>
                  </th>
                  <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('profesor_categoria')}>
                    Categoría de profesor&nbsp;
                    <span style={{fontSize: '0.9em'}}>
                      <span style={{color: sortConfig.key === 'profesor_categoria' && sortConfig.direction === 'asc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'profesor_categoria' && sortConfig.direction === 'asc' ? 'bold' : 'normal'}}>▲</span>
                      <span style={{color: sortConfig.key === 'profesor_categoria' && sortConfig.direction === 'desc' ? '#1d4ed8' : '#bbb', fontWeight: sortConfig.key === 'profesor_categoria' && sortConfig.direction === 'desc' ? 'bold' : 'normal'}}>▼</span>
                    </span>
                  </th>
                  <th className="p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proyectosFiltrados.map((proyecto) => {
                  const assignedProf = profesores.find(
                    (prof) => prof.profesor_id === proyecto.profesor_id
                  );
                  return (
                    <tr key={proyecto.id} className="border-b">
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.Estudiante.Usuario.nombre}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.Estudiante.carnet}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.Anteproyecto.Empresa.nombre}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.Anteproyecto.departamento}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.Anteproyecto.Categoria?.nombre ?? "N/A"}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.semestre}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.año}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.estado}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {assignedProf ? assignedProf.nombre : "N/A"}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {assignedProf ? assignedProf.categoria ?? "N/A" : "N/A"}
                      </td>
                      <td className="flex p-3 text-sm text-gray-700 space-x-2">
                        <button
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2"
                          onClick={() => navigate(`/verProyecto?id=${proyecto.id}`)}
                          title="Ver datos del proyecto"
                        >
                          Ver
                        </button>
                        {(() => {
                          // Calcular el siguiente semestre y año
                          let semestreSiguiente, anoSiguiente;
                          if (semestreActual === 1) {
                            semestreSiguiente = 2;
                            anoSiguiente = anoActual;
                          } else {
                            semestreSiguiente = 1;
                            anoSiguiente = anoActual + 1;
                          }
                          
                          // Permitir editar si es el semestre actual o el siguiente
                          const esPeriodoEditable = 
                            (proyecto.semestre === semestreActual && proyecto.año === anoActual) ||
                            (proyecto.semestre === semestreSiguiente && proyecto.año === anoSiguiente);
                          
                          return <>
                            <button
                              onClick={() => handleEstadoChange(proyecto.id, 'Aprobado', proyecto.estudiante_id)}
                              className="px-2 py-1 bg-green-500 text-white rounded mr-2"
                              disabled={!esPeriodoEditable}
                              style={!esPeriodoEditable ? { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' } : {}}
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleEstadoChange(proyecto.id, 'Suspendido', proyecto.estudiante_id)}
                              className="px-2 py-1 bg-red-500 text-white rounded"
                              disabled={!esPeriodoEditable}
                              style={!esPeriodoEditable ? { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' } : {}}
                            >
                              Suspender
                            </button>
                            <select
                              className="border rounded px-2 py-1"
                              value={proyecto.profesor_id || ""}
                              onChange={(e) => handleAssign(proyecto.id, e.target.value, proyecto.estudiante_id)}
                              disabled={!esPeriodoEditable}
                              style={!esPeriodoEditable ? { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' } : {}}
                            >
                              <option value="">-- Asignar profesor --</option>
                              {assignedProf && (
                                <option key={assignedProf.profesor_id} value={assignedProf.profesor_id}>
                                  {assignedProf.nombre}
                                </option>
                              )}
                              {filteredProfesores
                                .filter((prof) => {
                                  // Filtrar por semestre y año del proyecto
                                  // Y verificar que disponibilidad > asignados
                                  return (
                                    prof.año === proyecto.año &&
                                    prof.semestre === proyecto.semestre &&
                                    prof.profesor_id !== proyecto.profesor_id &&
                                    prof.disponibilidad > prof.proyectosAsignados
                                  );
                                })
                                .map((prof) => (
                                  <option key={prof.profesor_id} value={prof.profesor_id}>
                                    {prof.nombre}
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() => handleUnassign(proyecto.id, proyecto.estudiante_id, proyecto.profesor_id)}
                              disabled={!esPeriodoEditable}
                              style={!esPeriodoEditable ? { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' } : {}}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                            >
                              Desasignar
                            </button>
                          </>;
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

/**
 * Modal para agregar un anteproyecto asignable al profesor.
 */
const AdicionAnteproyectoProfesor = ({ profesor, onAdicion }) => {
  const modalRef = useRef(null);
  const [anteproyectos, setAnteproyectos] = useState([]);
  const [seleccionado, setSeleccionado] = useState("");

  const abrir = async () => {
    const asignables = await Anteproyecto.obtenerAsignables();
    setAnteproyectos(asignables);
    modalRef.current.open();
  };

  const agregar = async () => {
    if(!seleccionado) {
      errorToast("Selecciona un proyecto a asignar");
      return;
    }
    /** @type {Anteproyecto} */
    const anteproyectoSeleccionado = anteproyectos.find(ap => ap.id === seleccionado);
    anteproyectoSeleccionado.encargado = profesor;
    await anteproyectoSeleccionado.guardarAsignacion();
    onAdicion();
    successToast("Proyecto agregado");
    setSeleccionado("");
    modalRef.current.close();
  };

  if (!profesor) return null;

  return (
    <>
      <Button onClick={abrir}>Agregar proyecto</Button>
      <Modal
        title={`Adición de proyecto a ${profesor.nombre}`}
        modalRef={modalRef}
        footer={<Button onClick={agregar}>Agregar</Button>}
      >
        <FloatInput text="Anteproyectos disponibles">
          <select
            value={seleccionado}
            onChange={event => setSeleccionado(event.target.value)}
          >
            <option disabled value="">Seleccione un anteproyecto</option>
            {anteproyectos.map((ap, index) => (
              <option key={`anteproyecto-asignable-${index}`} value={ap.id}>
                {ap.estudiante.nombre} - {ap.nombreEmpresa}
              </option>
            ))}
          </select>
        </FloatInput>
      </Modal>
    </>
  );
};

export default EdicionAsignacionProyectos;
