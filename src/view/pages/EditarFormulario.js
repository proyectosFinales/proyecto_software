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
import { supabase } from '../../model/Cliente';
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
  const [justificacion, setJustificacion] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [impacto, setImpacto] = useState('');
  const [nombreDepartamento, setNombreDepartamento] = useState('');
  const [tipoProyecto, setTipoProyecto] = useState('');
  const [observaciones, setObservaciones] = useState('');

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
          estudiante_id,
          Estudiante:estudiante_id (
            estudiante_id,
            carnet,
            id_usuario,   -- FK a Usuario
            Usuario:id_usuario (
              id,
              nombre,
              correo,
              telefono,
              sede
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Llenar estados
      setIdAnteproyecto(data.id);
      setTipoEmpresa(data.tipoEmpresa || '');
      setNombreEmpresa(data.nombreEmpresa || '');
      setActividadEmpresa(data.actividadEmpresa || '');
      setDistritoEmpresa(data.distritoEmpresa || '');
      setCantonEmpresa(data.cantonEmpresa || '');
      setProvinciaEmpresa(data.provinciaEmpresa || '');
      setNombreAsesor(data.nombreAsesor || '');
      setPuestoAsesor(data.puestoAsesor || '');
      setTelefonoContacto(data.telefonoContacto || '');
      setCorreoContacto(data.correoContacto || '');
      setNombreHR(data.nombreHR || '');
      setTelefonoHR(data.telefonoHR || '');
      setCorreoHR(data.correoHR || '');
      setContexto(data.contexto || '');
      setJustificacion(data.justificacion || '');
      setSintomas(data.sintomas || '');
      setImpacto(data.impacto || '');
      setNombreDepartamento(data.nombreDepartamento || '');
      setTipoProyecto(data.tipoProyecto || '');
      setObservaciones(data.observaciones || '');

      // Datos del Estudiante
      if (data.Estudiante) {
        setEstudianteId(data.Estudiante.estudiante_id);
        setCarnet(data.Estudiante.carnet || '');

        // Usuario anidado
        if (data.Estudiante.Usuario) {
          setUserId(data.Estudiante.Usuario.id);
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
  async function editarAnteproyecto(e) {
    e.preventDefault();
    const confirmUpdate = window.confirm("¿Está seguro de ACTUALIZAR el anteproyecto?");
    if (!confirmUpdate) return;

    try {
      // 1. Actualizar primero el Usuario (datos personales):
      //    - nombre, correo, telefono, sede
      if (userId) {
        const { error: userError } = await supabase
          .from('Usuario')
          .update({
            nombre: nombre,
            correo: correo,
            telefono: telefono,
            sede: sede
          })
          .eq('id', userId);
        if (userError) throw userError;
      }

      // 2. Actualizar Estudiante (carnet, cedula, etc.)
      //    En tu script final no usas 'cedula', pero si la tuvieras, la incluyes.
      if (estudianteId) {
        const { error: estError } = await supabase
          .from('Estudiante')
          .update({
            carnet: carnet
            // cedula: cedula, etc.
          })
          .eq('estudiante_id', estudianteId);
        if (estError) throw estError;
      }

      // 3. Actualizar el Anteproyecto (campos de la empresa, etc.)
      const { error: antError } = await supabase
        .from('Anteproyecto')
        .update({
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
          tipoProyecto
          // Observaciones suele ser del profesor, tal vez no se edita desde aquí, o sí:
          //observaciones
        })
        .eq('id', idAnteproyecto);

      if (antError) throw antError;

      successToast('Anteproyecto y datos de estudiante actualizados exitosamente');
      // Redirigir a donde gustes
      navigate('/anteproyectosCoordinador');
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
          <label>Nombre del estudiante:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            /* readOnly si no quieres que lo edite */
          />
        </div>
        <div className={styles.formGroup}>
          <label>Carnet:</label>
          <input
            type="text"
            value={carnet}
            onChange={(e) => setCarnet(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Teléfono:</label>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Correo electrónico:</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Sede:</label>
          <input
            type="text"
            value={sede}
            onChange={(e) => setSede(e.target.value)}
          />
        </div>

        {/* DATOS DE LA EMPRESA */}
        <h2>Datos de la empresa</h2>
        <div className={styles.formGroup}>
          <label>Tipo de empresa:</label>
          <div>
            <label>
              <input
                type="radio"
                name="tipoEmpresa"
                value="Zona franca"
                checked={tipoEmpresa === "Zona franca"}
                onChange={(e) => setTipoEmpresa(e.target.value)}
              />
              Zona franca
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="tipoEmpresa"
                value="Régimen definitivo"
                checked={tipoEmpresa === "Régimen definitivo"}
                onChange={(e) => setTipoEmpresa(e.target.value)}
              />
              Régimen definitivo
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="tipoEmpresa"
                value="Perfeccionamiento activo"
                checked={tipoEmpresa === "Perfeccionamiento activo"}
                onChange={(e) => setTipoEmpresa(e.target.value)}
              />
              Perfeccionamiento activo
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Nombre de la empresa:</label>
          <input
            type="text"
            value={nombreEmpresa}
            onChange={(e) => setNombreEmpresa(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Actividad de la empresa:</label>
          <input
            type="text"
            value={actividadEmpresa}
            onChange={(e) => setActividadEmpresa(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Distrito:</label>
          <input
            type="text"
            value={distritoEmpresa}
            onChange={(e) => setDistritoEmpresa(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Cantón:</label>
          <input
            type="text"
            value={cantonEmpresa}
            onChange={(e) => setCantonEmpresa(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Provincia:</label>
          {/* Igual que con tipoEmpresa, un radio group o un input textual */}
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="Heredia"
                checked={provinciaEmpresa === "Heredia"}
                onChange={(e) => setProvinciaEmpresa(e.target.value)}
              />
              Heredia
            </label>
          </div>
          {/* ... las demás provincias ... */}
        </div>

        {/* DATOS DE CONTACTOS EN LA EMPRESA */}
        <div className={styles.formGroup}>
          <label>Nombre del asesor industrial:</label>
          <input
            type="text"
            value={nombreAsesor}
            onChange={(e) => setNombreAsesor(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Puesto que desempeña el asesor:</label>
          <input
            type="text"
            value={puestoAsesor}
            onChange={(e) => setPuestoAsesor(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Teléfono del contacto:</label>
          <input
            type="text"
            value={telefonoContacto}
            onChange={(e) => setTelefonoContacto(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Correo del contacto:</label>
          <input
            type="email"
            value={correoContacto}
            onChange={(e) => setCorreoContacto(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Nombre del contacto de RRHH:</label>
          <input
            type="text"
            value={nombreHR}
            onChange={(e) => setNombreHR(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Teléfono RRHH:</label>
          <input
            type="text"
            value={telefonoHR}
            onChange={(e) => setTelefonoHR(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Correo RRHH:</label>
          <input
            type="email"
            value={correoHR}
            onChange={(e) => setCorreoHR(e.target.value)}
          />
        </div>

        {/* DATOS DEL PROYECTO */}
        <h2>Datos del proyecto</h2>
        <div className={styles.formGroup}>
          <label>Contexto:</label>
          <AiOutlineInfoCircle
            className={styles.infoIcon}
            onClick={() => toggleInfo('contexto')}
          />
          <textarea
            value={contexto}
            onChange={(e) => setContexto(e.target.value)}
          />
          {infoVisible.contexto && <p className="info-text">Explicación sobre el contexto...</p>}
        </div>

        <div className={styles.formGroup}>
          <label>Justificación:</label>
          <AiOutlineInfoCircle
            className={styles.infoIcon}
            onClick={() => toggleInfo('justificacion')}
          />
          <textarea
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
          />
          {infoVisible.justificacion && <p className="info-text">Información sobre la justificación...</p>}
        </div>

        <div className={styles.formGroup}>
          <label>Síntomas:</label>
          <AiOutlineInfoCircle
            className={styles.infoIcon}
            onClick={() => toggleInfo('sintomas')}
          />
          <textarea
            value={sintomas}
            onChange={(e) => setSintomas(e.target.value)}
          />
          {infoVisible.sintomas && <p className="info-text">Descripción de los síntomas...</p>}
        </div>

        <div className={styles.formGroup}>
          <label>Impacto:</label>
          <AiOutlineInfoCircle
            className={styles.infoIcon}
            onClick={() => toggleInfo('impacto')}
          />
          <textarea
            value={impacto}
            onChange={(e) => setImpacto(e.target.value)}
          />
          {infoVisible.impacto && <p className="info-text">Descripción del impacto...</p>}
        </div>

        <div className={styles.formGroup}>
          <label>Departamento:</label>
          <input
            type="text"
            value={nombreDepartamento}
            onChange={(e) => setNombreDepartamento(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Tipo de proyecto:</label>
          <div>
            <label>
              <input
                type="radio"
                name="tipoProyecto"
                value="Extensión"
                checked={tipoProyecto === "Extensión"}
                onChange={(e) => setTipoProyecto(e.target.value)}
              />
              Extensión
            </label>
          </div>
          {/* Agrega las demás opciones */}
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
