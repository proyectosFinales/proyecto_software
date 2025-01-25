/**
 * CoordinadorForm.jsx
 *
 * Pantalla para que el coordinador edite un anteproyecto y los datos
 * del estudiante asociados, de acuerdo con la nueva estructura de la BD:
 *  - Usuario (nombre, correo, telefono, sede)
 *  - Estudiante (carnet, cedula, etc.)
 *  - Anteproyecto (campos de proyecto).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/EditarFormulario.module.css';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import { errorToast, successToast } from '../components/toast';

/**
 * Componente principal de edición.
 */
const CoordinadorForm = () => {
  // Campos del estudiante (propios de Estudiante y de Usuario)
  const [userId, setUserId] = useState('');            // PK en Usuario
  const [estudianteId, setEstudianteId] = useState(''); // PK en Estudiante

  // Datos de Usuario (nombre, correo, telefono, sede)
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sede, setSede] = useState('');

  // Datos propios de Estudiante (carnet, cedula, etc.)
  const [carnet, setCarnet] = useState('');
  // Si manejas `cedula` en la tabla Estudiante, agrégalo:
  // const [cedula, setCedula] = useState('');

  // Datos de Anteproyecto
  const [idAnteproyecto, setIdAnteproyecto] = useState('');
  const [tipoEmpresa, setTipoEmpresa] = useState('');
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
  const [contexto, setContexto] = useState('');
  const [oldContexto, setOldContexto] = useState('');
  const [contextoC, setContextoC] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [oldJustificacion, setOldJustificacion] = useState('');
  const [justificacionC, setJustificacionC] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [oldSintomas, setOldSintomas] = useState('');
  const [sintomasC, setSintomasC] = useState('');
  const [impacto, setImpacto] = useState('');
  const [oldImpacto, setOldImpacto] = useState('');
  const [impactoC, setImpactoC] = useState('');
  const [nombreDepartamento, setNombreDepartamento] = useState('');
  const [tipoProyecto, setTipoProyecto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [estado, setEstado] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const [infoVisible, setInfoVisible] = useState({});

  // Obtener query param "id" (anteproyecto ID)
  const getQueryParam = (param) => {
    const params = new URLSearchParams(location.search);
    return params.get(param);
  };

  // Al montar, consultar el anteproyecto
  useEffect(() => {
    const id = getQueryParam('id');
    if (id) {
      consultarAnteproyecto(id);
    }
  }, [location]);

  /**
   * Consulta datos del anteproyecto y su estudiante,
   * uniendo con Usuario a través de Estudiante.id_usuario => Usuario.id.
   */

  async function consultarAnteproyecto(id) {
    try {
      // Anteproyecto se relaciona con Estudiante, y Estudiante con Usuario
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
          estado,
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
          ),
          Correcciones:correcciones_anteproyecto_id_fkey (
            seccion,
            contenido
          )


        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      // Llenar estados
      setIdAnteproyecto(data.id);
      setEstado(data.estado);
      if(data.estado == "Correccion"){
        data.Correcciones.forEach(item => {
          switch(item.seccion) {
            case "Justificacion":
              setJustificacionC(item.contenido);
              break;
            case "Contexto":
              setContextoC(item.contenido);
              break;
            case "Sintomas":
              setSintomasC(item.contenido);
              break;
            case "Impacto":
              setImpactoC(item.contenido);
              break;
            default:
              break;
          }
        });
      }
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
      setOldContexto(data.contexto || '');
      setJustificacion(data.justificacion || '');
      setOldJustificacion(data.justificacion || '');
      setSintomas(data.sintomas || '');
      setOldSintomas(data.sintomas || '');
      setImpacto(data.impacto || '');
      setOldImpacto(data.impacto || '');
      setNombreDepartamento(data.departamento || '');
      setTipoProyecto(data.tipo || '');
      setObservaciones(data.comentario || '');

      // Datos del Estudiante
      if (data.Estudiante) {
        setEstudianteId(data.estudiante_id);
        setCarnet(data.Estudiante.carnet || '');

        // Usuario anidado
        if (data.Estudiante.Usuario) {
          setUserId(data.Estudiante.id_usuario);
          setNombre(data.Estudiante.Usuario.nombre || '');
          setCorreo(data.Estudiante.Usuario.correo || '');
          setTelefono(data.Estudiante.Usuario.telefono || '');
          setSede(data.Estudiante.Usuario.sede || '');
        }
      }
    } catch (err) {
      errorToast('Error al consultar anteproyecto: ' + err.message);
    }
  }

  /**
   * Editar la información del anteproyecto y los datos del estudiante (Usuario/Estudiante).
   */
  function verificarCorrecion(){
    if(contextoC != '' && (contexto == oldContexto)){
      return false;
    }
    else if(justificacionC != '' && (justificacion == oldJustificacion)){
      return false;
    }
    else if(impactoC != '' && (impacto == oldImpacto)){
      return false;
    }
    else if(sintomasC != '' && (sintomas == oldSintomas)){
      return false;
    }
    else{
      return true;
    }
  }

  async function borrarCorrecciones() {
    try{
      const {error: correctionError} = await supabase
        .from('Correcciones')
        .delete()
        .eq('anteproyecto_id',idAnteproyecto);
        if (correctionError) throw correctionError;
    }catch(error){
      errorToast('Error al borrar correcciones: ' + error.message);
    }
  }

  async function editarAnteproyecto(e) {
    e.preventDefault();
    const confirmUpdate = window.confirm("¿Está seguro de ACTUALIZAR el anteproyecto?");
    if (!confirmUpdate) return;
    if(estado == "Correccion" && (verificarCorrecion() == false)) {
      alert("Todavía hay correcciones pendientes, estas se ven en texto de color rojo");
      return;
    }
    try {
      // Actualizar el Anteproyecto (campos de la empresa, etc.)
      const estado = "Pendiente"
      const { error: antError } = await supabase
        .from('Anteproyecto')
        .update({
          estado: estado,
          contexto: contexto,
          justificacion: justificacion,
          sintomas: sintomas,
          impacto: impacto
        })
        .eq('id', idAnteproyecto);
        const {error: correctionError} = await supabase
          .from('Correcciones')
          .delete()
          .eq('anteproyecto_id',idAnteproyecto);
      if (correctionError) throw correctionError;
      if (antError) throw antError;

      successToast('Modificaciones realizadas exitosamente');
      // Redirigir a donde gustes
      navigate('/anteproyectosEstudiante');
    } catch (error) {
      errorToast('Error al actualizar anteproyecto: ' + error.message);
    }
  }

  const handleGoBack = () => {
    navigate(-1);
  };

  const toggleInfo = (field) => {
    setInfoVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div>
      <header className={styles.encabezado_formulario}>
        <h1>Editar Anteproyecto</h1>
      </header>

      <form className={styles.form} onSubmit={editarAnteproyecto}>
        {/* DATOS DEL ESTUDIANTE (Usuario + Estudiante) */}
        <h2>Datos del estudiante</h2>

        <div className={styles.formGroup}>
          <label>1. Nombre del estudiante:</label>
          <input
            type="text"
            value={nombre}
            readOnly
            /* readOnly si no quieres que lo edite */
          />
        </div>
        <div className={styles.formGroup}>
          <label>2. Carnet:</label>
          <input
            type="text"
            value={carnet}
            readOnly
          />
        </div>
        <div className={styles.formGroup}>
          <label>3. Teléfono:</label>
          <input
            type="text"
            value={telefono}
            readOnly
          />
        </div>
        <div className={styles.formGroup}>
          <label>4. Correo electrónico:</label>
          <input
            type="email"
            value={correo}
            readOnly
          />
        </div>
        <div className={styles.formGroup}>
          <label>5. Sede:</label>
          <input
            type="text"
            value={sede}
            readOnly
          />
        </div>

        {/* DATOS DE LA EMPRESA */}
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
          <input
            type="text"
            value={nombreEmpresa}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>8. Actividad de la empresa:</label>
          <input
            type="text"
            value={actividadEmpresa}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>9. Distrito:</label>
          <input
            type="text"
            value={distritoEmpresa}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>10. Cantón:</label>
          <input
            type="text"
            value={cantonEmpresa}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>11. Provincia:</label>
          <input
            type="text"
            value={provinciaEmpresa}
            readOnly
          />
        </div>

        {/* DATOS DE CONTACTOS EN LA EMPRESA */}
        <div className={styles.formGroup}>
          <label>12. Nombre del asesor industrial:</label>
          <input
            type="text"
            value={nombreAsesor}
            readOnly
          />
        </div>
        <div className={styles.formGroup}>
          <label>13. Puesto que desempeña el asesor:</label>
          <input
            type="text"
            value={puestoAsesor}
            readOnly
          />
        </div>
        <div className={styles.formGroup}>
          <label>14. Teléfono del contacto:</label>
          <input
            type="text"
            value={telefonoContacto}
            readOnly
          />
        </div>
        <div className={styles.formGroup}>
          <label>15. Correo del contacto:</label>
          <input
            type="email"
            value={correoContacto}
            readOnly
          />
        </div>
        <div className={styles.formGroup}>
          <label>16. Nombre del contacto de RRHH:</label>
          <input
            type="text"
            value={nombreHR}
            readOnly
          />
        </div>
        <div className={styles.formGroup}>
          <label>17. Teléfono RRHH:</label>
          <input
            type="text"
            value={telefonoHR}
            readOnly
          />
        </div>
        <div className={styles.formGroup}>
          <label>18. Correo RRHH:</label>
          <input
            type="email"
            value={correoHR}
            readOnly
          />
        </div>

        {/* DATOS DEL PROYECTO */}
        <h2>Datos del proyecto</h2>
        <div className={styles.formGroup}>
          <label>
            19. Contexto:
            <AiOutlineInfoCircle
              className={styles.infoIcon}
              onClick={() => toggleInfo('contexto')}
            />
          </label>
          <textarea
            value={contexto}
            onChange={(e) => setContexto(e.target.value)}
          />
          {infoVisible.contexto && <p className="info-text">Explicación sobre el contexto...</p>}
          <p className={styles.correctionText}>
            {contextoC}
          </p>
        </div>

        <div className={styles.formGroup}>
          <label>
            20. Justificación:
            <AiOutlineInfoCircle
              className={styles.infoIcon}
              onClick={() => toggleInfo('justificacion')}
            />
          </label>
          <textarea
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
          />
          {infoVisible.justificacion && <p className="info-text">Información sobre la justificación...</p>}
          <p className={styles.correctionText}>
            {justificacionC}
          </p>
        </div>

        <div className={styles.formGroup}>
          <label>
            21. Síntomas:
            <AiOutlineInfoCircle
              className={styles.infoIcon}
              onClick={() => toggleInfo('sintomas')}
            />
          </label>
          <textarea
            value={sintomas}
            onChange={(e) => setSintomas(e.target.value)}
          />
          {infoVisible.sintomas && <p className="info-text">Descripción de los síntomas...</p>}
          <p className={styles.correctionText}>
            {sintomasC}
          </p>
        </div>

        <div className={styles.formGroup}>
          <label>
            22. Efectos o impactos para la empresa:
            <AiOutlineInfoCircle
              className={styles.infoIcon}
              onClick={() => toggleInfo('impacto')}
            />
          </label>
          <textarea
            value={impacto}
            onChange={(e) => setImpacto(e.target.value)}
          />
          {infoVisible.impacto && <p className="info-text">Descripción del impacto...</p>}
          <p className={styles.correctionText}>
            {impactoC}
          </p>
        </div>

        <div className={styles.formGroup}>
          <label>23. Departamento:</label>
          <input
            type="text"
            value={nombreDepartamento}
            readOnly
          />
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
          <label>Observaciones del profesor:</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            readOnly
          />
        </div>

        <div className={styles.contenedor_botones_formCoordinador}>
          <button
            type="submit"
            className={`${styles.button} ${styles.aprobar}`}
          >
            Editar
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

export default CoordinadorForm;
