/**
 * FormularioCoordinador.jsx
 *
 * Pantalla donde el coordinador revisa un anteproyecto, 
 * agrega observaciones y lo aprueba/reprueba.
 * 
 * Se asume la estructura de la BD:
 *  - Anteproyecto (id, estudiante_id, estado, observaciones, etc.)
 *  - Estudiante (estudiante_id, carnet, id_usuario, ...)
 *  - Usuario (id, nombre, correo, telefono, sede, ...)
 */

import React, { useState, useEffect } from 'react';
import sendMail from "../../controller/Email";
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/FormularioCoordinador.module.css';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { FaEdit } from "react-icons/fa";
import Profesor from '../../controller/profesor';
import { addAvance } from '../../controller/Avances';

const FormularioCoordinador = () => {
  // Datos del estudiante (read-only)
  const [nombre, setNombre] = useState('');
  const [carnet, setCarnet] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [sede, setSede] = useState('');
  const [provinciaEst, setProvinciaEst] = useState('');
  const [cantonEst, setCantonEst] = useState('');
  const [distritoEst, setdistritoEst] = useState('');
  
  // Datos de la empresa y del anteproyecto (read-only, excepto observaciones)
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [actividadEmpresa, setActividadEmpresa] = useState('');
  const [distritoEmpresa, setDistritoEmpresa] = useState('');
  const [cantonEmpresa, setCantonEmpresa] = useState('');
  const [provinciaEmpresa, setProvinciaEmpresa] = useState('');
  const [nombreAsesor, setNombreAsesor] = useState('');
  const [puestoAsesor, setPuestoAsesor] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [correoContacto, setCorreoContacto] = useState('');
  const [nombreHR, setNombreHR] = useState('');
  const [telefonoHR, setTelefonoHR] = useState('');
  const [correoHR, setCorreoHR] = useState('');
  const [tipoEmpresa, setTipoEmpresa] = useState('');
  const [contexto, setContexto] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [impacto, setImpacto] = useState('');
  const [nombreDepartamento, setNombreDepartamento] = useState('');
  const [tipoProyecto, setTipoProyecto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [revision, setRevision] = useState('');
  const [correccionC, setCorrecionC] = useState('');
  const [correccionJ, setCorrecionJ] = useState('');
  const [correccionS, setCorrecionS] = useState('');
  const [correccionE, setCorrecionE] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [estado, setEstado] = useState('');
  const [categoria, setCategoria] = useState('');
  //const [cantonEstudiante, setCantonEstudiante] = useState('');


  const [semestre, setSemestre] = useState('');
  const [anio, setAnio] = useState('');
  const [situacionLaboral, setSituacionLaboral] = useState('');
  const [haPerdido, setHaPerdido] = useState(false);
  const [historialReprobacion, setHistorialReprobacion] = useState([]);


  // ID del anteproyecto actual
  const [idAnteproyecto, setIdAnteproyecto] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [infoVisible, setInfoVisible] = useState({});

  // Función para obtener el valor de un query param (ej: ?id=XYZ)
  const getQueryParam = (param) => {
    const params = new URLSearchParams(location.search);
    return params.get(param);
  };

  // Al montar, obtener el anteproyecto
  useEffect(() => {
    const id = getQueryParam('id');
    if (id) {
      consultarAnteproyecto(id);
    }
  }, [location]);

  /**
   * Consulta un anteproyecto por ID, uniendo con Estudiante y Usuario
   * para mostrar datos del estudiante en modo lectura.
   */
  async function consultarAnteproyecto(id) {
    try {
      // Se asume la BD: Anteproyecto -> { estudiante_id, ... }
      // Estudiante -> { estudiante_id, carnet, id_usuario, ... }
      // Usuario -> { id, nombre, correo, telefono, sede, ... }
      const { data, error } = await supabase
              .from('Anteproyecto')
              .select(`
                id,
                empresa_id,
                contexto,
                justificacion,
                sintomas,
                impacto,
                tipo,
                comentario,
                estudiante_id,
                actividad,
                departamento,
                categoria_id,
                semestre,
                año,
                estado,
                Estudiante:estudiante_id (
                  carnet,
                  id_usuario,
                  situacion_laboral,
                  Usuario:id_usuario (
                    nombre,
                    correo,
                    telefono,
                    sede,
                    provincia,
                    canton,
                    distrito
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
                ),
                Proyecto!left (
                  id
                ),
                Categoria: categoria_id (
                  nombre
                )
              `)
              .eq('id', id)
              .single();
      if (error) throw error;
      // Rellenar campos de anteproyecto
      setIdAnteproyecto(data.id);
      setTipoEmpresa(data.Empresa.tipo || '');
      setNombreEmpresa(data.Empresa.nombre || '');
      setActividadEmpresa(data.Empresa.actividad || '');
      setDistritoEmpresa(data.Empresa.distrito || '');
      setCantonEmpresa(data.Empresa.canton || '');
      setProvinciaEmpresa(data.Empresa.provincia || '');
      setNombreAsesor(data.AnteproyectoContacto[0].ContactoEmpresa.nombre || '');
      setPuestoAsesor(data.AnteproyectoContacto[0].ContactoEmpresa.departamento || '');
      setTelefonoContacto(data.AnteproyectoContacto[0].ContactoEmpresa.telefono || '');
      setCorreoContacto(data.AnteproyectoContacto[0].ContactoEmpresa.correo || '');
      setNombreHR(data.AnteproyectoContacto[0].RRHH.nombre || '');
      setTelefonoHR(data.AnteproyectoContacto[0].RRHH.telefono || '');
      setCorreoHR(data.AnteproyectoContacto[0].RRHH.correo || '');
      setContexto(data.contexto || '');
      setJustificacion(data.justificacion || '');
      setSintomas(data.sintomas || '');
      setImpacto(data.impacto || '');
      setNombreDepartamento(data.departamento || '');
      setTipoProyecto(data.tipo || '');
      setCategoria(data.Categoria?.nombre || '');
      setObservaciones(data.comentario || '');
      setEstado(data.estado || '');
      
      // Log para debug
      console.log("Anteproyecto ID:", data.id);
      console.log("Proyecto data:", data.Proyecto);
      console.log("Proyecto length:", data.Proyecto ? data.Proyecto.length : 'undefined');
      
      if(data.Proyecto && data.Proyecto.length === 0){
        console.log("Estado del proyecto: EMPTY");
        setProyecto("empty");
      }
      else{
        console.log("Estado del proyecto: ASSIGNED");
        setProyecto("assigned");
      }
      // Rellenar campos de estudiante (read-only)
      if (data.Estudiante?.Usuario) {
      setCarnet(data.Estudiante.carnet || '');
      setNombre(data.Estudiante.Usuario.nombre || '');
      setCorreo(data.Estudiante.Usuario.correo || '');
      setTelefono(data.Estudiante.Usuario.telefono || '');
      setSede(data.Estudiante.Usuario.sede || '');
      setProvinciaEst(data.Estudiante.Usuario.provincia || '');
      setCantonEst(data.Estudiante.Usuario.canton || '');
      setdistritoEst(data.Estudiante.Usuario.distrito || '');
      }

      // (nuevo)
      setSemestre(data.semestre || 'No especificado');
      setAnio(data.año || 'No especificado');
      setSituacionLaboral(data.Estudiante.situacion_laboral || 'No especificado');

      const { data: historial, error: historialError } = await supabase
        .from('HistorialReprobacion')
        .select('*')
        .eq('estudiante_id', data.estudiante_id); // Usamos el ID de estudiante cargado

      if (historialError) {
        console.error("Error cargando historial:", historialError);
      }

      if (historial && historial.length > 0) {
        setHaPerdido(true);
        setHistorialReprobacion(historial); 
      }


    } catch (err) {
      console.error('Error al consultar anteproyecto:', err);
      alert('Error al consultar anteproyecto: ' + err.message);
    }
  }

  /**
   * Aprobar => estado = "Aprobado" + guardar observaciones
   */
  async function aprobarAnteproyecto(e) {
    e.preventDefault();
    if (estado === "Aprobado") return; // Protección extra
    const confirmAprobar = window.confirm("¿Está seguro de APROBAR el anteproyecto?");
    if (!confirmAprobar) return;

    try {
      // Usar el semestre y año del anteproyecto (no el actual)
      const semestreAnteproyecto = semestre;
      const anoAnteproyecto = anio;

      // Verificar si ya existe un proyecto para este anteproyecto en el semestre y año del anteproyecto
      const { data: proyectosExistentes, error: errorProyectoExistente } = await supabase
        .from('Proyecto')
        .select('id')
        .eq('anteproyecto_id', idAnteproyecto)
        .eq('semestre', semestreAnteproyecto)
        .eq('año', anoAnteproyecto);
      if (errorProyectoExistente) throw errorProyectoExistente;
      if (proyectosExistentes && proyectosExistentes.length > 0) {
        alert('Ya existe un proyecto para este anteproyecto en el semestre y año especificado. No se puede aprobar de nuevo.');
        return;
      }


      // Obtener profesores con espacios disponibles en el semestre y año del anteproyecto
      const profesoresDisponibles = (await Profesor.obtenerTodos()).filter(
        p => p.disponibilidad > p.proyectosAsignados && p.año === anoAnteproyecto && p.semestre === semestreAnteproyecto
      );
      
      let profesor = null;
      let hayProfesorAsignado = false;

      if (profesoresDisponibles.length > 0) {
        // 1. Filtrar por categoría
        let candidatos = profesoresDisponibles.filter(p => p.categoria && p.categoria === categoria);

        // 2. Si no hay por categoría, filtrar por cantón del estudiante (Usuario)
        if (candidatos.length === 0) {
          // Usar el estado cantonEstudiante guardado al consultar el anteproyecto
          candidatos = profesoresDisponibles.filter(p => {
            // El cantón del profesor está en p.Usuario.canton
            console.log("Filtrando por cantón:", cantonEst);
            console.log("Profesor:", p.Usuario ? p.Usuario.canton : "Sin usuario"); 
            return p.Usuario && p.Usuario.canton && p.Usuario.canton === cantonEst;
          });
        }

        // 3. Si no hay por cantón, usar todos los disponibles
        if (candidatos.length === 0) {
          candidatos = profesoresDisponibles;
        }

        // Seleccionar profesor aleatorio del subconjunto
        profesor = candidatos[Math.floor(Math.random() * candidatos.length)];
        hayProfesorAsignado = true;
        console.log("Profesor asignado:", profesor.nombre, "ID:", profesor.profesor_id);
      } else {
        console.log("No hay ");
      }

      console.log("hayProfesorAsignado:", hayProfesorAsignado);

      // Actualizar estado del anteproyecto
      const { data, error } = await supabase
        .from('Anteproyecto')
        .update({
          comentario: observaciones,
          estado: "Aprobado"
        })
        .eq('id', idAnteproyecto)
        .select();
      if (error) throw error;

      // Insertar registro en la tabla Proyecto
      const estadoProyecto = hayProfesorAsignado ? "Asignado" : "Pendiente";
      console.log("Estado del proyecto a crear:", estadoProyecto);
      console.log("Profesor ID:", hayProfesorAsignado ? profesor.profesor_id : null);
      
      const { data: insertProyecto, error: insertProyectoError } = await supabase
        .from('Proyecto')
        .insert({
          profesor_id: hayProfesorAsignado ? profesor.profesor_id : null,
          estudiante_id: data[0].estudiante_id,
          anteproyecto_id: idAnteproyecto,
          estado: estadoProyecto,
          semestre: semestreAnteproyecto,
          año: anoAnteproyecto,
          fecha_inicio: new Date().toISOString()
        })
        .select('*');
      if (insertProyectoError) throw insertProyectoError;
      
      console.log("Proyecto inmediatamente después de crear:", insertProyecto[0]);
      
      // Forzar actualización del estado si hay profesor asignado (por si hay un default en la BD)
      if (hayProfesorAsignado && insertProyecto[0].estado !== "Asignado") {
        console.log("ADVERTENCIA: El proyecto se creó con estado:", insertProyecto[0].estado, "- Forzando actualización a Asignado");
        const { error: updateEstadoError } = await supabase
          .from('Proyecto')
          .update({ estado: "Asignado" })
          .eq('id', insertProyecto[0].id);
        if (updateEstadoError) {
          console.error("Error al actualizar estado:", updateEstadoError);
        } else {
          console.log("Estado actualizado exitosamente a Asignado");
          insertProyecto[0].estado = "Asignado"; // Actualizar en memoria
        }
      }
      
      console.log("Proyecto final:", insertProyecto[0]);

      // Actualizar campo asesor en la tabla Estudiante solo si hay profesor asignado
      if (hayProfesorAsignado) {
        const { error: updateEstudianteError } = await supabase
          .from('Estudiante')
          .update({ asesor: profesor.profesor_id })
          .eq('estudiante_id', data[0].estudiante_id);
        if (updateEstudianteError) throw updateEstudianteError;

        // Sumar 1 a asignados en AsignacionesProfesor para el semestre y año específico
        const { error: updateAsignadosError } = await supabase
          .from('AsignacionesProfesor')
          .update({ asignados: profesor.proyectosAsignados + 1 })
          .eq('idProfesor', profesor.profesor_id)
          .eq('semestre', semestreAnteproyecto)
          .eq('año', anoAnteproyecto);
        if (updateAsignadosError) throw updateAsignadosError;
      }

      for (let i = 0; i < 3; i++)
        await addAvance(estadoProyecto, insertProyecto[0].id);

      //Para enviar el correo al estudiante de que le aprobaron el anteproyecto
      const mensaje = "Buenas,\n" +
        "Le informamos por este medio que, tras la revisión de su anteproyecto, este ha sido APROBADO.\n" +
        "En caso de requerir orientación o aclaraciones sobre cualquier aspecto relacionado al proceso, puede ponerse en contacto contacto con el coordinador de carrera.\n" +
        "\nInstituto Tecnológico de Costar Rica,\n" +
        "Escuela de Producción Industrial.";
      sendMail(correo, "Anteproyecto Aprobado", mensaje);

      if (hayProfesorAsignado) {
        alert('Anteproyecto actualizado exitosamente (Aprobado) y proyecto creado con profesor asignado.');
      } else {
        alert('Anteproyecto actualizado exitosamente (Aprobado). NOTA: No hay profesores disponibles, el proyecto fue creado sin profesor asignado (estado Pendiente).');
      }
      navigate('/anteproyectosCoordinador');
    } catch (error) {
      alert('Error al actualizar anteproyecto: ' + error.message);
    }
  }

  async function insertarCorreccion(section, content) {
    try{
      const { error } = await supabase
      .from('Correcciones')
      .insert({
        anteproyecto_id: idAnteproyecto,      // fk
        seccion: section,
        contenido: content
      })
    if (error) throw error;
    }catch (error) {
      alert('Error al registrar las correcciones: ' + error.message);
    }
  }

  async function corregirAnteproyecto(e) {
    e.preventDefault();
    const confirmAprobar = window.confirm("¿Está seguro de enviar las CORRECIONES solicitadas al anteproyecto?");
    if (!confirmAprobar) return;

    try {
      const { error } = await supabase
        .from('Anteproyecto')
        .update({
          comentario: observaciones,
          estado: "Correccion"
        })
        .eq('id', idAnteproyecto);
      if(correccionC !== ''){
        await insertarCorreccion("Contexto",correccionC);
      }
      if(correccionE !== ''){
        await insertarCorreccion("Impacto",correccionE);
      }
      if(correccionS !== ''){
        await insertarCorreccion("Sintomas",correccionS);
      }
      if(correccionJ !== ''){
        await insertarCorreccion("Justificacion",correccionJ);
      }
      
      if (error) throw error;
      
      alert('Las correcciones fueron solicitadas exitosamente.');
      navigate('/anteproyectosCoordinador');
    } catch (error) {
      alert('Error al enviar correcciones: ' + error.message);
    }
  }

  async function consultarHR(nombreContact){
    try{
      const { data, error } = await supabase
        .from('ContactoEmpresa')
        .select(`
          id,
          nombre,
          AnteproyectoContact:AnteproyectoContacto_rrhh_id_fkey (
            contacto_id         
          )
        `)
        .eq('nombre', nombreContact)
        .single();
      if(data.AnteproyectoContact.length===1){
        return true;
      }
      else{
        return false;
      }
    } catch(err){
      console.error('Error al buscar contacto', err);
      alert('Error al buscar contacto' + err.message);
    }
  }

  async function eliminarAnteproyecto(){
    try{
      const { error } = await supabase
        .from('Anteproyecto')
        .delete()
        .eq('id', idAnteproyecto);
        if (error) {
        alert('Error al eliminar anteproyecto: ' + error.message);
        return;
      }
    }catch(error){
      alert('Error al eliminar anteproyecto:' + error);
    }
  }

  async function consultarEmpresas(){
    try{
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
      if(data.ContactoEmpresa.length === 0){
        return true;
      }
      else{
        return false;
      }
    } catch(err){
      console.error('Error al buscar empresas', err);
      alert('Error al buscar empresas' + err.message);
    }
  }

  async function eliminarContacto(name){
    try{
      const { error } = await supabase
        .from('ContactoEmpresa')
        .delete()
        .eq('nombre', name);
        if (error) {
        alert('Error al eliminar contacto: ' + error.message);
        return;
      }
    }catch(error){
      alert('Error al eliminar contacto:' + error);
    }
  }

  async function eliminarAnteContact(){
    try{
      const { error } = await supabase
        .from('AnteproyectoContacto')
        .delete()
        .eq('anteproyecto_id', idAnteproyecto);
        if (error) {
        alert('Error al eliminar contacto: ' + error.message);
        return;
      }
    }catch(error){
      alert('Error al eliminar contacto:' + error);
    }
  }

  async function consultarContactos(nombreContact){
    try{
      const { data, error } = await supabase
        .from('ContactoEmpresa')
        .select(`
          id,
          nombre,
          AnteproyectoContact:anteproyectocontacto_contacto_id_fkey (
            contacto_id         
          )
        `)
        .eq('nombre', nombreContact)
        .single();
      if(error) throw error;
      if(data.AnteproyectoContact.length===1){
        return true;
      }
      else{
        return false;
      }
    } catch(err){
      console.error('Error al buscar contacto', err);
      alert('Error al buscar contacto' + err.message);
    }
  }

  /**
   * Reprobar => estado = "Reprobado" + guardar observaciones
   */

  async function reprobarAnteproyecto(e) {
    e.preventDefault();
    const confirmReprobar = window.confirm("¿Está seguro de REPROBAR el anteproyecto? Asegúrese de incluir la razón en las observaciones");
    if (!confirmReprobar) return;
    if(proyecto === "empty"){
      try {
        // Actualizar estado del anteproyecto a Reprobado
        const { error } = await supabase
          .from('Anteproyecto')
          .update({
            comentario: observaciones,
            estado: "Reprobado"
          })
          .eq('id', idAnteproyecto);
        
        if (error) throw error;

        // Enviar correo al estudiante
        const mensaje = "Buenas,\n" +
        "Le informamos por este medio que, tras la revisión de su anteproyecto, este ha sido rechazado por las siguientes razones:\n" +
        `${observaciones}\n\n`+
        "Le invitamos a revisar las observaciones y, si así lo desea, presentar una nueva propuesta.\n" +
        "En caso de requerir orientación o aclaraciones sobre los puntos señalados, puede ponerse en contacto con el coordinador de carrera.\n" +
        "\nInstituto Tecnológico de Costar Rica,\n" +
        "Escuela de Producción Industrial.";
        sendMail(correo, "Anteproyecto Reprobado", mensaje);

        alert('Anteproyecto reprobado exitosamente.');
        navigate('/anteproyectosCoordinador');
      } catch (error) {
        alert('Error al reprobar anteproyecto: ' + error.message);
      }
    }
    else{
      alert("No se puede reprobar el anteproyecto, ya se encuentra asignado a un profesor");
    }
  }

  /**
   * Para corregir => estado = "Para corregir" + guardar observaciones
   */

  async function paraCorregirAnteproyecto(e) {
    e.preventDefault();
    
    // Log para debug
    console.log("=== Intentando mandar a corregir ===");
    console.log("ID Anteproyecto:", idAnteproyecto);
    console.log("Estado proyecto:", proyecto);
    console.log("Estado anteproyecto:", estado);
    
    const confirmCorregir = window.confirm("¿Está seguro de MANDAR A CORREGIR el anteproyecto?\n\nAsegúrese de incluir la razón en las observaciones");
    if (!confirmCorregir) return;
    if(proyecto === "empty"){
      console.log("Proyecto es empty, procediendo...");
      try {
        // Actualizar estado del anteproyecto
        const { data, error } = await supabase
          .from('Anteproyecto')
          .update({
            comentario: observaciones,
            estado: "Correccion"
          })
          .eq('id', idAnteproyecto)
          .select();
        if (error) throw error;

        // Insertar correcciones específicas de cada campo
        if(correccionC !== ''){
          await insertarCorreccion("Contexto", correccionC);
        }
        if(correccionE !== ''){
          await insertarCorreccion("Impacto", correccionE);
        }
        if(correccionS !== ''){
          await insertarCorreccion("Sintomas", correccionS);
        }
        if(correccionJ !== ''){
          await insertarCorreccion("Justificacion", correccionJ);
        }

        const mensaje = "Buenas,\n" +
        "Le informamos por este medio que, tras la revisión de su anteproyecto, se le solicita que lo corrija por las siguientes razones:\n" +
        `${observaciones}\n`+
        "Le invitamos a revisar las observaciones y, si así lo desea, corregirlo para reevaluarlo nuevamente.\n" +
        "En caso de requerir orientación o aclaraciones sobre los puntos señalados, puede ponerse en contacto contacto con el coordinador de carrera.\n" +
        "\nInstituto Tecnológico de Costar Rica,\n" +
        "Escuela de Producción Industrial.";
        sendMail(correo, "Anteproyecto Para Corregir", mensaje);
        
        alert('Anteproyecto actualizado a "Para corregir" exitosamente.');
        navigate('/anteproyectosCoordinador');
      } catch (error) {
        console.error("Error al actualizar:", error);
        alert('Error al actualizar anteproyecto: ' + error.message);
      }
    }
    else{
      console.log("No se puede mandar a corregir - proyecto no está empty");
      console.log("Valor de proyecto:", proyecto);
      alert("No se puede mandar a corregir el anteproyecto, ya se encuentra asignado a un profesor.");
    }
  }

  /**
   * Para salir sin cambiar nada
   */
  const handleGoBack = () => {
    navigate(-1);
  };

  /**
   * Muestra/oculta la info de ayuda (icono AiOutlineInfoCircle).
   */
  const toggleInfo = (field) => {
    setInfoVisible(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div>
      <Header title="Revisar Anteproyecto"/>

      {/* Al hacer submit se llama aprobarAnteproyecto; 
          para reprobar hay un botón aparte. */}
      <form className={styles.form} onSubmit={aprobarAnteproyecto}>
        <h2>Datos del estudiante</h2>

        <div className={styles.formGroup}>
          <label>1. Nombre del estudiante: *</label>
          <input
            type="text"
            value={nombre}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>2. Carnet: *</label>
          <input
            type="text"
            value={carnet}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>3. Correo electrónico: *</label>
          <input
            type="email"
            value={correo}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>4. Teléfono: *</label>
          <input
            type="text"
            value={telefono}
            readOnly
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>5. Sede: *</label>
          <input
            type="text"
            value={sede}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>6. Canton: *</label>
          <input
            type="text"
            value={cantonEst}
            readOnly
          />
        </div>

        <h2>Datos de la empresa</h2>
        <div className={styles.formGroup}>
          <label>6. Nombre de la empresa:</label>
          <input type="text" value={nombreEmpresa} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>7. Tipo de Empresa:</label>
          <input
            type="text"
            value={tipoEmpresa}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>8. Ubicación (Provincia):</label>
          <input
            type="text"
            value={provinciaEmpresa}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>9. Ubicación (Cantón):</label>
          <input type="text" value={cantonEmpresa} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>10. Ubicación (Distrito):</label>
          <input type="text" value={distritoEmpresa} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>11. Actividad de la empresa:</label>
          <input type="text" value={actividadEmpresa} readOnly />
        </div>

        <h2>Contacto Empresa</h2>
        <div className={styles.formGroup}>
          <label>12. Nombre del asesor industrial:</label>
          <input type="text" value={nombreAsesor} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>13. Puesto que desempeña el asesor industrial:</label>
          <input type="text" value={puestoAsesor} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>14. Teléfono del asesor industrial:</label>
          <input type="text" value={telefonoContacto} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>15. Correo del asesor industrial:</label>
          <input type="email" value={correoContacto} readOnly />
        </div>

        <h2>Recursos Humanos</h2>
        <div className={styles.formGroup}>
          <label>16. Nombre del contacto de Recursos Humanos:</label>
          <input type="text" value={nombreHR} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>17. Teléfono del contacto de Recursos Humanos:</label>
          <input type="text" value={telefonoHR} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>18. Correo del contacto de Recursos Humanos:</label>
          <input type="email" value={correoHR} readOnly />
        </div>

        <h2>Datos del anteproyecto</h2>
        <h3 className={styles.aviso}>
          (Si hay mucha información, puede arrastrar la esquina del campo.)
        </h3>

        <div className={styles.formGroup}>
          <label>
            19. Contexto:
            <FaEdit
              className={styles.infoIcon}
              onClick={() => toggleInfo('correccionC')}
              size={20}
            />
          </label>
          <textarea value={contexto} readOnly />
          {infoVisible.correccionC && (
            <>
            <textarea
              value={correccionC}
              onChange={(e) => setCorrecionC(e.target.value)}
            />
            <button
              type="button"
              className={`${styles.button} ${styles.cancelar}`}
              onClick={() => setCorrecionC("")}
            >
            Borrar
            </button>
            </>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>
            20. Justificación:
            <FaEdit
              className={styles.infoIcon}
              onClick={() => toggleInfo('correccionJ')}
              size={20}
            />
          </label>
          <textarea value={justificacion} readOnly />
          {infoVisible.correccionJ && (
            <>
            <textarea
              value={correccionJ}
              onChange={(e) => setCorrecionJ(e.target.value)}
            />
            <button
              type="button"
              className={`${styles.button} ${styles.cancelar}`}
              onClick={() => setCorrecionJ("")}
            >
            Borrar
            </button>
            </>
          )}
          
        </div>

        <div className={styles.formGroup}>
          <label>
            21. Síntomas principales:
            <FaEdit
              className={styles.infoIcon}
              onClick={() => toggleInfo('correccionS')}
              size={20}
            />
          </label>
          <textarea value={sintomas} readOnly />
          {infoVisible.correccionS && (
            <>
            <textarea
              value={correccionS}
              onChange={(e) => setCorrecionS(e.target.value)}
            />
            <button
              type="button"
              className={`${styles.button} ${styles.cancelar}`}
              onClick={() => setCorrecionS("")}
            >
            Borrar
            </button>
            </>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>
            22. Efectos o impactos para la empresa:
            <FaEdit
              className={styles.infoIcon}
              onClick={() => toggleInfo('correccionE')}
              size={20}
            />
          </label>
          <textarea value={impacto} readOnly />
          {infoVisible.correccionE && (
            <>
            <textarea
              value={correccionE}
              onChange={(e) => setCorrecionE(e.target.value)}
            />
            <button
              type="button"
              className={`${styles.button} ${styles.cancelar}`}
              onClick={() => setCorrecionE("")}
            >
            Borrar
            </button>
          </>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>23. Departamento donde realizará el proyecto:</label>
          <input type="text" value={nombreDepartamento} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>24. Tipo de Proyecto:</label>
          <input
            type="text"
            value={tipoProyecto}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>
            25. Categoría del proyecto
          </label>
            <input
              type="text"
              value={categoria}
              readOnly
            />
        </div>

        <div className={styles.formGroup}>
          <label>26. Situación laboral:</label>
          <input
            type="text"
            value={situacionLaboral}
            readOnly
          />
        </div>

        
        <div className={`${styles.formGroup} ${haPerdido ? styles.historialBox : ''}`}>
          <label style={{ fontWeight: 'bold' }}>27. Historial de Reprobación:</label>
          
          {haPerdido ? (
            /* Si haPerdido es true, muestra la tabla */
            <table className={styles.historialTable}>
              <thead>
                <tr>
                  <th>Causa</th>
                  <th>Semestre</th>
                  <th>Año</th>
                </tr>
              </thead>
              <tbody>
                {historialReprobacion.map((item, index) => (
                  <tr key={index}>
                    <td>{item.causa}</td>
                    <td>{item.semestre ?? item.semestre_id ?? ''}</td>
                    <td>{item.año ?? item.anio ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Si haPerdido es false, muestra el aviso */
            <p className={styles.historialInfo}>
              El estudiante no reporta reprobar previamente.
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>28. Semestre:</label>
          <input
            type="text"
            value={semestre}
              readOnly
          />
        </div>
        <div className={styles.formGroup}>
          <label>29. Año:</label>
          <input
            type="text"
            className={styles.input}
            value={anio}
            readOnly
          />

        </div>

        <div className={styles.formGroup}>
          <label>Observaciones del coordinador
            <AiOutlineInfoCircle
              className="ml-2 text-blue-500 cursor-pointer"
              onClick={() => toggleInfo('observaciones')}
            />
          </label>
          {infoVisible.observaciones && (
              <p className="text-sm text-gray-600 mt-1">Son observaciones realizadas para la mejora del anteproyecto que se hicieron al estudiante y una vez aprobado son de referencia para el profesor asesor aunque fueron solventadas por el estudiante.</p>
            )}
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        <div className={styles.contenedor_botones_formCoordinador}>
          {(correccionC === '' && correccionE === '' && correccionS === '' && correccionJ === '') && (
          <button
            type="submit"
            className={`${styles.button} ${styles.aprobar}`}
            disabled={estado === "Aprobado" || estado === "Correccion" || estado === "Reprobado"}
            style={(estado === "Aprobado" || estado === "Correccion" || estado === "Reprobado") ? { backgroundColor: '#d1d5db', color: '#888', cursor: 'not-allowed' } : {}}
          >
            Aprobar
          </button>
          )}
          {(correccionC !== '' || correccionE !== '' || correccionS !== '' || correccionJ !== '') && (
            <button
            onClick={corregirAnteproyecto}
            className={`${styles.button} ${styles.aprobar}`}
          >
            Enviar
          </button>
          )}
          <button
            className={`${styles.button} ${styles.aprobar}`}
            onClick={paraCorregirAnteproyecto}
            disabled={estado === "Aprobado" || estado === "Correccion" || estado === "Reprobado"}
            style={(estado === "Aprobado" || estado === "Correccion" || estado === "Reprobado") ? { backgroundColor: '#d1d5db', color: '#888', cursor: 'not-allowed' } : {}}
          >
            Para Corregir
          </button>
          <button
            type="submit"
            className={`${styles.button} ${styles.reprobar}`}
            onClick={reprobarAnteproyecto}
            disabled={estado === "Aprobado" || estado === "Correccion" || estado === "Reprobado"}
            style={(estado === "Aprobado" || estado === "Correccion" || estado === "Reprobado") ? { backgroundColor: '#d1d5db', color: '#888', cursor: 'not-allowed' } : {}}
          >
            Reprobar
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.cancelar}`}
            onClick={handleGoBack}
          >
            Cancelar
          </button>
        </div>
      </form>
      <Footer />
    </div>
  );
};

export default FormularioCoordinador;
