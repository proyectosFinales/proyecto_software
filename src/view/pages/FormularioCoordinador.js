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
import { supabase } from '../../model/Cliente';
import Footer from '../components/Footer';

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
            id_usuario,
            Usuario:id_usuario (
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

      setIdAnteproyecto(data.id);

      // Rellenar campos de anteproyecto
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

      // Rellenar campos de estudiante (read-only)
      if (data.Estudiante?.Usuario) {
        setNombre(data.Estudiante.Usuario.nombre || '');
        setCarnet(data.Estudiante.carnet || '');
        setTelefono(data.Estudiante.Usuario.telefono || '');
        setCorreo(data.Estudiante.Usuario.correo || '');
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
      const { error } = await supabase
        .from('Anteproyecto')
        .update({
          observaciones: observaciones,
          estado: "Aprobado"
        })
        .eq('id', idAnteproyecto);

      if (error) throw error;

      alert('Anteproyecto actualizado exitosamente (Aprobado).');
      navigate('/anteproyectosCoordinador');
    } catch (error) {
      alert('Error al actualizar anteproyecto: ' + error.message);
    }
  }

  /**
   * Reprobar => estado = "Reprobado" + guardar observaciones
   */
  async function reprobarAnteproyecto(e) {
    e.preventDefault();
    const confirmReprobar = window.confirm("¿Está seguro de REPROBAR el anteproyecto?");
    if (!confirmReprobar) return;

    try {
      const { error } = await supabase
        .from('Anteproyecto')
        .update({
          observaciones: observaciones,
          estado: "Reprobado"
        })
        .eq('id', idAnteproyecto);
      if (error) throw error;

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
      <header className={styles.header_coordinador}>
        <h1>Revisar Anteproyecto</h1>
      </header>

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
          <label>6. Tipo de empresa:</label>
          <div>
            <label>
              <input
                type="radio"
                name="tipoEmpresa"
                value="Zona franca"
                checked={tipoEmpresa === "Zona franca"}
                disabled
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
                disabled
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
                disabled
              />
              Perfeccionamiento activo
            </label>
          </div>
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
          <label>11. Ubicación (Provincia):</label>
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="Heredia"
                checked={provinciaEmpresa === "Heredia"}
                disabled
              />
              Heredia
            </label>
          </div>
          {/* ... y así para las demás provincias ... */}
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
            <AiOutlineInfoCircle
              className={styles.infoIcon}
              onClick={() => toggleInfo('contexto')}
            />
          </label>
          <textarea value={contexto} readOnly />
          {infoVisible.contexto && (
            <p className="info-text">
              Explicación sobre el contexto...
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>
            20. Justificación:
            <AiOutlineInfoCircle
              className={styles.infoIcon}
              onClick={() => toggleInfo('justificacion')}
            />
          </label>
          <textarea value={justificacion} readOnly />
          {infoVisible.justificacion && (
            <p className="info-text">
              Texto explicativo de la justificación...
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>
            21. Síntomas principales:
            <AiOutlineInfoCircle
              className={styles.infoIcon}
              onClick={() => toggleInfo('sintomas')}
            />
          </label>
          <textarea value={sintomas} readOnly />
          {infoVisible.sintomas && (
            <p className="info-text">
              Descripción de los síntomas...
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>
            22. Efectos o impactos para la empresa:
            <AiOutlineInfoCircle
              className={styles.infoIcon}
              onClick={() => toggleInfo('impacto')}
            />
          </label>
          <textarea value={impacto} readOnly />
          {infoVisible.impacto && (
            <p className="info-text">
              Detalle de los impactos...
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>23. Nombre del departamento:</label>
          <input type="text" value={nombreDepartamento} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>24. Tipo de proyecto:</label>
          <div>
            <label>
              <input
                type="radio"
                name="tipoProyecto"
                value="Extensión"
                checked={tipoProyecto === "Extensión"}
                disabled
              />
              Extensión
            </label>
          </div>
          {/* ...Más radios para tipos de proyecto... */}
        </div>

        <div className={styles.formGroup}>
          <label>Observaciones del profesor</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        <div className={styles.contenedor_botones_formCoordinador}>
          <button
            type="submit"
            className={`${styles.button} ${styles.aprobar}`}
          >
            Aprobar
          </button>
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
