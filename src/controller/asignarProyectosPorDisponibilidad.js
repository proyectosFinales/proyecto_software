import supabase from "../model/supabase";

const normalizar = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const mismaUbicacion = (a, b) => {
  const provA = normalizar(a.provincia);
  const provB = normalizar(b.provincia);
  const canA = normalizar(a.canton);
  const canB = normalizar(b.canton);
  const disA = normalizar(a.distrito);
  const disB = normalizar(b.distrito);

  if (!provA || !provB || provA !== provB) return false;
  if (!canA || !canB || canA !== canB) return false;
  if (!disA || !disB || disA !== disB) return false;
  return true;
};

const claveSemestre = (semestre, año) => `${semestre}|${año}`;

/**
 * Tras guardar disponibilidad, asigna proyectos sin profesor del mismo semestre/año
 * a los profesores cuya disponibilidad cambió y aún tienen cupo libre.
 *
 * Prioridad:
 * 1) misma categoría + misma ubicación (provincia/cantón/distrito)
 * 2) cualquier proyecto restante (sin match), sin exceder cupos ni proyectos disponibles
 *
 * Actualiza: Proyecto, Estudiante.asesor, AsignacionesProfesor.asignados
 *
 * @param {Array<{ profesor_id: string, semestre: number|string, año: number|string, disponibilidad: number, proyectosAsignados?: number }>} profesoresConNuevaDisponibilidad
 * @returns {Promise<{ asignados: number, porMatch: number, porFallback: number, sinProyectos: number, detalles: object[] }>}
 */
export async function asignarProyectosPorDisponibilidad(profesoresConNuevaDisponibilidad = []) {
  const candidatos = (profesoresConNuevaDisponibilidad || []).filter((p) => {
    const cupo = Number(p.disponibilidad ?? 0) - Number(p.proyectosAsignados ?? 0);
    return p?.profesor_id && p.semestre != null && p.año != null && cupo > 0;
  });

  if (candidatos.length === 0) {
    return { asignados: 0, porMatch: 0, porFallback: 0, sinProyectos: 0, detalles: [] };
  }

  const grupos = new Map();
  candidatos.forEach((p) => {
    const key = claveSemestre(p.semestre, p.año);
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key).push(p);
  });

  let totalAsignados = 0;
  let totalMatch = 0;
  let totalFallback = 0;
  let totalSinProyectos = 0;
  const detalles = [];

  for (const [key, profesGrupo] of grupos.entries()) {
    const [semestreStr, añoStr] = key.split("|");
    const semestre = Number(semestreStr);
    const año = Number(añoStr);

    const resultado = await asignarGrupoSemestre(semestre, año, profesGrupo);
    totalAsignados += resultado.asignados;
    totalMatch += resultado.porMatch;
    totalFallback += resultado.porFallback;
    totalSinProyectos += resultado.sinProyectos;
    detalles.push({ semestre, año, ...resultado });
  }

  return {
    asignados: totalAsignados,
    porMatch: totalMatch,
    porFallback: totalFallback,
    sinProyectos: totalSinProyectos,
    detalles,
  };
}

async function asignarGrupoSemestre(semestre, año, profesGrupo) {
  const ids = [...new Set(profesGrupo.map((p) => p.profesor_id))];

  const { data: profesoresDb, error: errorProfes } = await supabase
    .from("Profesor")
    .select(`
      profesor_id,
      categoria_id,
      Usuario:id_usuario (
        provincia,
        canton,
        distrito,
        nombre
      )
    `)
    .in("profesor_id", ids);

  if (errorProfes) throw new Error(`Error cargando profesores: ${errorProfes.message}`);

  const { data: cuposDb, error: errorCupos } = await supabase
    .from("AsignacionesProfesor")
    .select("idProfesor, disponibilidad, asignados, semestre, año")
    .eq("semestre", semestre)
    .eq("año", año)
    .in("idProfesor", ids);

  if (errorCupos) throw new Error(`Error cargando cupos: ${errorCupos.message}`);

  const mapaCupos = new Map((cuposDb || []).map((c) => [c.idProfesor, c]));
  const mapaProf = new Map((profesoresDb || []).map((p) => [p.profesor_id, p]));

  const profesores = ids
    .map((id) => {
      const base = mapaProf.get(id);
      const cupo = mapaCupos.get(id);
      if (!base || !cupo) return null;
      const libres = Number(cupo.disponibilidad ?? 0) - Number(cupo.asignados ?? 0);
      if (libres <= 0) return null;
      return {
        profesor_id: id,
        categoria_id: base.categoria_id ?? null,
        provincia: base.Usuario?.provincia ?? null,
        canton: base.Usuario?.canton ?? null,
        distrito: base.Usuario?.distrito ?? null,
        nombre: base.Usuario?.nombre ?? "",
        libres,
        asignadosActuales: Number(cupo.asignados ?? 0),
      };
    })
    .filter(Boolean);

  if (profesores.length === 0) {
    return { asignados: 0, porMatch: 0, porFallback: 0, sinProyectos: 0 };
  }

  const { data: proyectos, error: errorProy } = await supabase
    .from("Proyecto")
    .select(`
      id,
      estudiante_id,
      profesor_id,
      semestre,
      año,
      estado,
      Anteproyecto:anteproyecto_id (
        categoria_id,
        Empresa:empresa_id (
          provincia,
          canton,
          distrito
        )
      )
    `)
    .eq("semestre", semestre)
    .eq("año", año)
    .is("profesor_id", null);

  if (errorProy) throw new Error(`Error cargando proyectos: ${errorProy.message}`);

  const pendientes = (proyectos || []).map((p) => ({
    id: p.id,
    estudiante_id: p.estudiante_id,
    categoria_id: p.Anteproyecto?.categoria_id ?? null,
    provincia: p.Anteproyecto?.Empresa?.provincia ?? null,
    canton: p.Anteproyecto?.Empresa?.canton ?? null,
    distrito: p.Anteproyecto?.Empresa?.distrito ?? null,
  }));

  if (pendientes.length === 0) {
    return { asignados: 0, porMatch: 0, porFallback: 0, sinProyectos: 0 };
  }

  const cupoTotal = profesores.reduce((acc, p) => acc + p.libres, 0);
  const maxAsignaciones = Math.min(cupoTotal, pendientes.length);

  const asignaciones = [];
  const proyectosUsados = new Set();

  // Fase 1: match categoría + ubicación
  for (const proyecto of pendientes) {
    if (asignaciones.length >= maxAsignaciones) break;

    const candidatosMatch = profesores
      .filter((prof) => prof.libres > 0)
      .filter((prof) => {
        if (prof.categoria_id == null || proyecto.categoria_id == null) return false;
        if (Number(prof.categoria_id) !== Number(proyecto.categoria_id)) return false;
        return mismaUbicacion(prof, proyecto);
      })
      .sort((a, b) => a.libres - b.libres || a.asignadosActuales - b.asignadosActuales);

    if (candidatosMatch.length === 0) continue;

    const elegido = candidatosMatch[0];
    asignaciones.push({ proyecto, profesor: elegido, tipo: "match" });
    proyectosUsados.add(proyecto.id);
    elegido.libres -= 1;
    elegido.asignadosActuales += 1;
  }

  // Fase 2: fallback sin match
  for (const proyecto of pendientes) {
    if (asignaciones.length >= maxAsignaciones) break;
    if (proyectosUsados.has(proyecto.id)) continue;

    const candidatos = profesores
      .filter((prof) => prof.libres > 0)
      .sort((a, b) => a.libres - b.libres || a.asignadosActuales - b.asignadosActuales);

    if (candidatos.length === 0) break;

    const elegido = candidatos[0];
    asignaciones.push({ proyecto, profesor: elegido, tipo: "fallback" });
    proyectosUsados.add(proyecto.id);
    elegido.libres -= 1;
    elegido.asignadosActuales += 1;
  }

  let porMatch = 0;
  let porFallback = 0;

  for (const item of asignaciones) {
    await persistirAsignacion(item.proyecto, item.profesor, semestre, año);
    if (item.tipo === "match") porMatch += 1;
    else porFallback += 1;
  }

  return {
    asignados: asignaciones.length,
    porMatch,
    porFallback,
    sinProyectos: Math.max(0, pendientes.length - asignaciones.length),
  };
}

async function persistirAsignacion(proyecto, profesor, semestre, año) {
  const { error: errorProyecto } = await supabase
    .from("Proyecto")
    .update({ profesor_id: profesor.profesor_id, estado: "Asignado" })
    .eq("id", proyecto.id)
    .is("profesor_id", null);

  if (errorProyecto) {
    throw new Error(`Error actualizando proyecto ${proyecto.id}: ${errorProyecto.message}`);
  }

  if (proyecto.estudiante_id) {
    const { error: errorEstudiante } = await supabase
      .from("Estudiante")
      .update({ asesor: profesor.profesor_id })
      .eq("estudiante_id", proyecto.estudiante_id);

    if (errorEstudiante) {
      throw new Error(`Error actualizando estudiante ${proyecto.estudiante_id}: ${errorEstudiante.message}`);
    }
  }

  const { data: cupoActual, error: errorLectura } = await supabase
    .from("AsignacionesProfesor")
    .select("asignados")
    .eq("idProfesor", profesor.profesor_id)
    .eq("semestre", semestre)
    .eq("año", año)
    .single();

  if (errorLectura) {
    throw new Error(`Error leyendo cupo del profesor ${profesor.profesor_id}: ${errorLectura.message}`);
  }

  const nuevosAsignados = Number(cupoActual?.asignados ?? 0) + 1;
  const { error: errorCupo } = await supabase
    .from("AsignacionesProfesor")
    .update({ asignados: nuevosAsignados })
    .eq("idProfesor", profesor.profesor_id)
    .eq("semestre", semestre)
    .eq("año", año);

  if (errorCupo) {
    throw new Error(`Error actualizando asignados del profesor ${profesor.profesor_id}: ${errorCupo.message}`);
  }
}

export default asignarProyectosPorDisponibilidad;
