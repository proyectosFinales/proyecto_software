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
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/FormularioCoordinador.module.css';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { FaEdit } from "react-icons/fa";
import Profesor from '../../controller/profesor';

const FormularioCoordinador = () => {
  // Datos del estudiante (read-only)
  const [nombre, setNombre] = useState('');
  const [carnet, setCarnet] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [sede, setSede] = useState('');

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
      
              `)
              .eq('id', id)
              .single();
      if (error) throw error;
      // Rellenar campos de anteproyecto
      setIdAnteproyecto(data.id);
      setTipoEmpresa(data.Empresa.tipo || '');
      setNombreEmpresa(data.Empresa.nombre || '');
      setActividadEmpresa(data.actividad || '');
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
      setObservaciones(data.comentario || '');

      // Rellenar campos de estudiante (read-only)
      if (data.Estudiante?.Usuario) {
        setCarnet(data.Estudiante.carnet || '');
        setNombre(data.Estudiante.Usuario.nombre || '');
        setCorreo(data.Estudiante.Usuario.correo || '');
        setTelefono(data.Estudiante.Usuario.telefono || '');
        setSede(data.Estudiante.Usuario.sede || '');
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
    const confirmAprobar = window.confirm("¿Está seguro de APROBAR el anteproyecto?");
    if (!confirmAprobar) return;

    try {
      // Obtener profesores con estudiantes libres
      const profesoresConEstudiantesLibres = await Profesor.obtenerProfesoresConEstudiantesLibres();
      if (profesoresConEstudiantesLibres.length === 0) {
        throw new Error("No hay profesores disponibles con estudiantes libres.");
      }

      // Seleccionar un profesor aleatorio
      const profesor = profesoresConEstudiantesLibres[Math.floor(Math.random() * profesoresConEstudiantesLibres.length)];

      // Actualizar estudiantes_libres del profesor seleccionado
      const { error: updateProfesorError } = await supabase
        .from('Profesor')
        .update({ estudiantes_libres: profesor.estudiantes_libres - 1})
        .eq('profesor_id', profesor.profesor_id);
      if (updateProfesorError) throw updateProfesorError;
      
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
      const { error: insertProyectoError } = await supabase
        .from('Proyecto')
        .insert({
          profesor_id: profesor.profesor_id,
          estudiante_id: data[0].estudiante_id, // Asegúrate de tener el estudianteId disponible
          anteproyecto_id: idAnteproyecto,
          estado: "Aprobado",
          semestre_id: 1,
          fecha_inicio: new Date().toISOString()
        });
      if (insertProyectoError) throw insertProyectoError;

      // Actualizar campo asesor en la tabla Estudiante
      const { error: updateEstudianteError } = await supabase
        .from('Estudiante')
        .update({ asesor: profesor.profesor_id })
        .eq('estudiante_id', data[0].estudiante_id); // Asegúrate de tener el estudianteId disponible
      if (updateEstudianteError) throw updateEstudianteError;
      
      alert('Anteproyecto actualizado exitosamente (Aprobado).');
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
      if(correccionC != ''){
        await insertarCorreccion("Contexto",correccionC);
      }
      if(correccionE != ''){
        await insertarCorreccion("Impacto",correccionE);
      }
      if(correccionS != ''){
        await insertarCorreccion("Sintomas",correccionS);
      }
      if(correccionJ != ''){
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
      if(data.AnteproyectoContact.length==1){
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
      if(data.ContactoEmpresa.length == 0){
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
      if(data.AnteproyectoContact.length==1){
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

    try {
      const contactoCount = await consultarContactos(nombreAsesor);
      const rhCount = await consultarHR(nombreHR);
      await eliminarAnteContact();
      await eliminarAnteproyecto();
      if(contactoCount==true){
        await eliminarContacto(nombreAsesor);
      }
      if(rhCount==true){
        await eliminarContacto(nombreHR);
      }
      const empresaCount = await consultarEmpresas();
      if(empresaCount == true){
        const { error } = await supabase
        .from('Empresa')
        .delete()
        .eq('nombre', nombreEmpresa);
        if (error) throw error;
      }

      alert('Anteproyecto actualizado exitosamente (Reprobado).');
      navigate('/anteproyectosCoordinador');
    } catch (error) {
      alert('Error al actualizar anteproyecto: ' + error.message);
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
          <label>3. Teléfono: *</label>
          <input
            type="text"
            value={telefono}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>4. Correo electrónico: *</label>
          <input
            type="email"
            value={correo}
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

        <h2>Datos de la empresa</h2>
        <div className={styles.formGroup}>
          <label>6. Tipo de Empresa:</label>
          <input
            type="text"
            value={tipoEmpresa}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>7. Nombre de la empresa:</label>
          <input type="text" value={nombreEmpresa} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>8. Actividad de la empresa:</label>
          <input type="text" value={actividadEmpresa} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>9. Ubicación (Distrito):</label>
          <input type="text" value={distritoEmpresa} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>10. Ubicación (Cantón):</label>
          <input type="text" value={cantonEmpresa} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>11. Provincia:</label>
          <input
            type="text"
            value={provinciaEmpresa}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>12. Nombre del asesor industrial:</label>
          <input type="text" value={nombreAsesor} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>13. Puesto del asesor:</label>
          <input type="text" value={puestoAsesor} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>14. Teléfono del contacto:</label>
          <input type="text" value={telefonoContacto} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>15. Correo del contacto:</label>
          <input type="email" value={correoContacto} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>16. Nombre del contacto de RRHH:</label>
          <input type="text" value={nombreHR} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>17. Teléfono de RRHH:</label>
          <input type="text" value={telefonoHR} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>18. Correo de RRHH:</label>
          <input type="email" value={correoHR} readOnly />
        </div>

        <h2>Datos del proyecto</h2>
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
          <label>23. Nombre del departamento:</label>
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
          <label>Observaciones del profesor</label>
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
            type="submit"
            className={`${styles.button} ${styles.reprobar}`}
            onClick={reprobarAnteproyecto}
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
