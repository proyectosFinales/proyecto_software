import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { fetchCategorias } from '../../controller/Categoria';
import { fetchTiposProyectos } from '../../controller/TipoProyecto';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/FormularioEstudiante.module.css';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import { errorToast, successToast } from '../components/toast';

/**
 * EstudianteForm.jsx
 * 
 * Permite a un estudiante crear un nuevo anteproyecto.
 * 
 * Se asume la BD:
 *  - Usuario(id, nombre, correo, telefono, sede, rol, ...)
 *  - Estudiante(estudiante_id, id_usuario (FK), carnet, ...)
 *  - Anteproyecto(id, estudiante_id (FK), estado, tipoEmpresa, ...)
 */

const EstudianteForm = () => {
  // Datos del estudiante (vienen de la relación con Usuario + Estudiante)
  const [nombre, setNombre] = useState('');
  const [carnet, setCarnet] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [correoParticular, setCorreoParticular] = useState('');
  const [sede, setSede] = useState('');

  // Datos académicos del estudiante
  const [semestrePropuesto, setSemestrePropuesto] = useState(null);
  const [anioPropuesto, setAnioPropuesto] = useState(null);
  const [situacionLaboral, setSituacionLaboral] = useState(null);
  const [haPerdido, setHaPerdido] = useState(false);
  const [historialReprobacion, setHistorialReprobacion] = useState([]); // Array para la lista de reprobaciones
  const [causaPerdida, setCausaPerdida] = useState(null);
  const [semestrePerdida, setSemestrePerdida] = useState(null);
  const [anioPerdida, setAnioPerdida] = useState('');

  // Datos de la empresa y anteproyecto a crear
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [sending, setSending] = useState(false)
  const [otra, setOtra] = useState('');
  const [actividadEmpresa, setActividadEmpresa] = useState('');
  const [activity, setActivity] = useState('');
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
  const [tiposProyectos, setTiposProyectos] = useState([]);
  const [selectedTipoProyecto, setSelectedTipoProyecto] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const telRegex = /^(\+?506\s?)?[2-9]\d{7}$/;

  const navigate = useNavigate();
  const [infoVisible, setInfoVisible] = useState({});

  // Guardar el ID del estudiante (estudiante_id) que necesitamos para insertar en Anteproyecto
  const [estudianteId, setEstudianteId] = useState(null);

  useEffect(() => {
    consultarEstudiante();
    fetchCategorias().then(data => {
      const options = data.map(categoria => ({
        value: categoria.categoria_id,
        label: categoria.nombre
      }));
      setCategorias([{value: '', label: "-- Asigna una categoria --"}, ...options]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    fetchTiposProyectos().then(data => {
      const options = data.map(TIPO=> ({
        //Se envia el nombre en value, ya que en la BD no se guarda el id, como en categorias
        value: TIPO.nombre,
        label: TIPO.nombre
      }));
      setTiposProyectos([{value: '', label: "-- Asigna un tipo de proyecto --"}, ...options]);
    }).catch(console.error);
  }, []);


// ENUMs de la Base de Datos. Si, no es muy practico, pero funciona por ahora.
const opcionesSemestre = [
  { value: '1', label: '1' },
  { value: '2', label: '2' }
];

// Opciones de año: año actual y siguiente
const currentYear = new Date().getFullYear();
const opcionesAnio = [
  { value: currentYear, label: currentYear.toString() },
  { value: currentYear + 1, label: (currentYear + 1).toString() }
];

const opcionesSituacionLaboral = [
  { value: 'Trabaja', label: 'Trabaja' },
  { value: 'Trabaja y estudia', label: 'Trabaja y estudia' },
  { value: 'Solo estudia', label: 'Solo estudia' }
];
 
// Causas de pérdida de la práctica
const opcionesCausasPerdida = [
  { value: 'Situaciones familiares', label: 'Situaciones familiares' },
  { value: 'Por Trabajo', label: 'Por Trabajo' },
  { value: 'Por asesoría inadecuada de profesor asesor', label: 'Por asesoría inadecuada de profesor asesor' },
  { value: 'Situaciones de la empresa', label: 'Situaciones de la empresa' },
  { value: 'Por falta de datos de la empresa', label: 'Por falta de datos de la empresa' },
  { value: 'Por mala organización del tiempo', label: 'Por mala organización del tiempo' },
  { value: 'Situaciones de salud certificada', label: 'Situaciones de salud certificada' }
];


  /**
   * Consulta datos del Usuario y Estudiante asociados al token.
   *  - En la nueva BD: "Usuario" en singular, "Estudiante" en singular.
   */
  async function consultarEstudiante() {
    try {
      const userToken = sessionStorage.getItem('token');
      // Obtenemos la relación: Usuario -> Estudiante
      // Ajusta el naming "!Estudiante_id_usuario_fkey" según tu constraint
      const { data, error } = await supabase
        .from('Usuario')
        .select(`
          id,
          sede,
          correo,
          telefono,
          nombre,
          Estudiante:Estudiante!Estudiante_id_usuario_fkey (
            estudiante_id,
            carnet
          )
        `)
        .eq('id', userToken)
        .single();
      if (error) throw error;
      if (!data) {
        errorToast('No se encontró la información del usuario/estudiante.');
        return;
      }

      // Llenar datos
      setCorreo(data.correo || '');
      setSede(data.sede || '');

      if (data.Estudiante) {
        setEstudianteId(data.Estudiante[0].estudiante_id);
        setNombre(data.nombre || '');
        setCarnet(data.Estudiante[0].carnet || '');
        setTelefono(data.telefono || '');
      } else {
        // Caso: no existe Estudiante vinculado
        errorToast('Este usuario no está registrado como estudiante.');
      }
    } catch (err) {
      console.error('Error al consultar estudiante o usuario', err);
      errorToast('Error al consultar estudiante o usuario: ' + err.message);
    }
  }

  /**
   * Inserta el anteproyecto en la tabla "Anteproyecto".
   * Usamos 'estudiante_id: estudianteId' como FK.
   */
  async function insertarEmpresa(){
    try{
      const { data, error } = await supabase
        .from('Empresa')
        .insert({
          nombre: nombreEmpresa,
          tipo: tipoEmpresa,
          provincia: provinciaEmpresa,
          canton: cantonEmpresa,
          distrito: distritoEmpresa,
          actividad: actividadEmpresa
        })
        .select();
        if (error){
          throw error;
        }
    } catch(err){
      console.error('Error con los datos de empresa', err);
      errorToast('Error con los datos de empresa' + err.message);
    }
  }

  async function insertarContacto(nombreContact, dept, mail, phone, empresaID){
    try{
      const { data, error } = await supabase
        .from('ContactoEmpresa')
        .insert({
          empresa_id: empresaID,      // fk
          nombre: nombreContact,
          departamento: dept,
          correo: mail,
          telefono: phone
        })
        .select();
        if (error){
          throw error;
        }
    } catch(err){
      console.error('Error con los datos de contacto', err);
      errorToast('Error con los datos de contacto' + err.message);
    }
  }

  async function insertarAnteContact(anteproyecto, contacto, rrhh){
    try{
      const { data, error } = await supabase
        .from('AnteproyectoContacto')
        .insert({
          anteproyecto_id: anteproyecto,      // fk
          contacto_id: contacto,
          rrhh_id: rrhh
        });
        if (error){
          throw error;
        }
    } catch(err){
      console.error('Error con datos de anteproyecto', err);
      errorToast('Error con datos de anteproyecto' + err.message);
    }
  }

  async function consultarEmpresas(){
    try{
      const { data, error } = await supabase
        .from('Empresa')
        .select(`
          id,
          nombre
        `)
        .eq('nombre', nombreEmpresa)
      if(data.length === 0){
        return "empty";
      }
      else{
        return data[0].id;
      }
    } catch(err){
      console.error('Error al buscar empresas', err);
      errorToast('Error al buscar empresas' + err.message);
    }
  }

  async function consultarContactos(nombreContact){
    try{
      const { data, error } = await supabase
        .from('ContactoEmpresa')
        .select(`
          id,
          nombre
        `)
        .eq('nombre', nombreContact)
      if(data.length === 0){
        return "empty";
      }
      else{
        return data[0].id;
      }
    } catch(err){
      console.error('Error al buscar contacto', err);
      errorToast('Error al buscar contacto' + err.message);
    }
  }

  async function insertarAnteproyecto(e) {
    e.preventDefault();
    const confirmarEnvio = window.confirm(
      "¿Está seguro que desea enviar el anteproyecto?"
    );
    if (!confirmarEnvio) {
      return;
    }
    if(actividadEmpresa === "Otras" && (activity === '' || activity === 'Otras')){
      alert("Debe ingresar la actividad de la empresa");
      return;
    }
    if (!telRegex.test(telefonoContacto)) {
      alert(
        "El número de teléfono del asesor industrial no cumple con un formato válido. Debe ser 8 dígitos, con o sin prefijo +506."
      );
      return;
    } 
    if (!telRegex.test(telefonoHR)) {
      alert(
        "El número de teléfono del contacto RRHH no cumple con un formato válido. Debe ser 8 dígitos, con o sin prefijo +506."
      );
      return;
    } 
    if (!estudianteId) {
      errorToast("No se encontró un 'estudiante_id' válido. No se puede insertar.");
      return;
    }
    if ((nombreDepartamento || '').length > 40) {
      alert("El nombre del departamento no puede exceder 40 caracteres.");
      return;
    }
    setSending(true)
    try {
      const empresaCount = await consultarEmpresas();
      const contactoCount = await consultarContactos(nombreAsesor);
      const rhCount = await consultarContactos(nombreHR);

      //--- Actualizar la situación laboral del estudiante con lo que colocó el porque esta esto aquí es una buena pregunta.
      const { error: updateEstudianteError } = await supabase
        .from('Estudiante')
        .update({ 
          situacion_laboral: situacionLaboral.value 
        })
        .eq('estudiante_id', estudianteId);
      if (updateEstudianteError) {
        throw new Error(`Error actualizando datos del estudiante: ${updateEstudianteError.message}`);
      }
      //---

      if(empresaCount === "empty"){
        await insertarEmpresa();
      }
      const empresID = await consultarEmpresas();
      if(contactoCount === "empty"){
        await insertarContacto(nombreAsesor, puestoAsesor, correoContacto, telefonoContacto, empresID);
      }
      const contactID = await consultarContactos(nombreAsesor);
      if(rhCount === "empty"){
        await insertarContacto(nombreHR, 'Recursos Humanos', correoHR, telefonoHR, empresID);
      }
      const rrhhID = await consultarContactos(nombreHR);
      // Insertar en la tabla "Anteproyecto"
      const { data, error } = await supabase
        .from('Anteproyecto')
        .insert({
          estudiante_id: estudianteId,      // fk
          empresa_id: empresID,
          actividad: activity,
          contexto: contexto,
          justificacion: justificacion,
          sintomas: sintomas,
          impacto: impacto,
          tipo: selectedTipoProyecto.value,
          departamento: nombreDepartamento,
          estado: 'Pendiente',
          categoria_id: selectedCategoria.value,
          semestre: semestrePropuesto.value,
          año: anioPropuesto.value,
        })
        .select();
      

      if (error){
        throw error;
      }
      else{
        insertarAnteContact(data[0].id, contactID, rrhhID);
      }

      if (haPerdido && historialReprobacion.length > 0) {
        
        // Mapeamos el array de estado a lo que la BD espera
        const historialData = historialReprobacion.map(entry => ({
          estudiante_id: estudianteId,
          causa: entry.causa.value,
          semestre: entry.semestre.value,
          anio: parseInt(entry.anio, 10),
          detalle: `Añadido durante creación de anteproyecto`
        }));

        const { error: historialError } = await supabase
          .from('HistorialReprobacion')
          .insert(historialData);

        if (historialError) {
          // No lanzamos error para no revertir el anteproyecto, 
          // pero sí notificamos
          console.error("Error insertando historial:", historialError);
          errorToast(`El anteproyecto se guardó, pero hubo un error guardando el historial: ${historialError.message}`);
        }
      }

      successToast('Anteproyecto insertado exitosamente');
      setSending(false)
      navigate('/anteproyectosEstudiante');
    } catch (err) {
      console.error('Error al insertar anteproyecto:', err);
      errorToast('Error al insertar anteproyecto: ' + err.message);
    }
    setSending(false)
  }

  /**
   * Agrega una entrada al array de historial de reprobación.
   */
  const handleAgregarHistorial = () => {
    if (!causaPerdida || !semestrePerdida || !anioPerdida) {
      errorToast("Debe seleccionar causa, semestre y año para agregar un historial.");
      return;
    }
    
    const nuevaEntrada = {
      causa: causaPerdida,
      semestre: semestrePerdida,
      anio: anioPerdida
    };

    setHistorialReprobacion([...historialReprobacion, nuevaEntrada]);

    // Limpiar campos del sub-formulario
    setCausaPerdida(null);
    setSemestrePerdida(null);
    setAnioPerdida('');
  };

  /**
   * Quita una entrada del array de historial (por índice).
   */
  const handleQuitarHistorial = (index) => {
    setHistorialReprobacion(historialReprobacion.filter((_, i) => i !== index));
  };

  
  const handleActividadChange = (e) => {
    setActividadEmpresa(e.target.value);
    setActivity(e.target.value);
  };

  const handleOtroChange = (e) => {
    setActivity(e.target.value);
  };

  const handleGoBack = () => {
    navigate(-1); // Navega a la página anterior
  };

  const toggleInfo = (field) => {
    setInfoVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div>
      <header className={styles.header_estudiante}>
        <h1>Crear anteproyecto</h1>
      </header>

      <form className={styles.form} onSubmit={insertarAnteproyecto}>
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
          <label>4. Correo e-oficial TEC: *</label>
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
          <label>6. Tipo de empresa: *</label>
          <div>
            <label>
              <input
                type="radio"
                name="tipoEmpresa"
                value="Zona franca"
                onChange={(e) => setTipoEmpresa(e.target.value)}
                required
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
                onChange={(e) => setTipoEmpresa(e.target.value)}
                required
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
                onChange={(e) => setTipoEmpresa(e.target.value)}
                required
              />
              Perfeccionamiento activo
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="tipoEmpresa"
                value="Empresa Pública"
                onChange={(e) => setTipoEmpresa(e.target.value)}
                required
              />
              Empresa pública
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="tipoEmpresa"
                value="PYME"
                onChange={(e) => setTipoEmpresa(e.target.value)}
                required
              />
              PYME
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="tipoEmpresa"
                value="Organismo Internacional"
                onChange={(e) => setTipoEmpresa(e.target.value)}
                required
              />
              Organismo Internacional
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>7. Nombre de la empresa: *</label>
          <input
            type="text"
            value={nombreEmpresa}
            onChange={(e) => setNombreEmpresa(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>8. Actividad de la empresa: *</label>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Retail"
                onChange={handleActividadChange}
                required
              />
              Retail
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Servicio financiero"
                onChange={handleActividadChange}
                required
              />
              Servicio financiero
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Servicios del estado"
                onChange={handleActividadChange}
                required
              />
              Servicios del Estado
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Manufactura de alimentos"
                onChange={handleActividadChange}
                required
              />
              Manufactura de alimentos
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Manufactura médica"
                onChange={handleActividadChange}
                required
              />
              Manufactura médica
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Manufactura Comercial"
                onChange={handleActividadChange}
                required
              />
              Manufactura comercial
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Manufactura electrónica"
                onChange={handleActividadChange}
                required
              />
              Manufactura electrónica
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Otras"
                onChange={handleActividadChange}
                required
              />
              Otras...
            </label>
          </div>
        </div>

        {(actividadEmpresa === "Otras") && (
          <div className={styles.formGroup}>
            <label>Ingrese la actividad: *</label>
            <input
              type="text"
              value={activity}
              onChange={handleOtroChange}
              required
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <label>9. Ubicación de la empresa (Distrito): *</label>
          <input
            type="text"
            value={distritoEmpresa}
            onChange={(e) => setDistritoEmpresa(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>10. Ubicación de la empresa (Cantón): *</label>
          <input
            type="text"
            value={cantonEmpresa}
            onChange={(e) => setCantonEmpresa(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>11. Ubicación de la empresa (Provincia): *</label>
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="Heredia"
                onChange={(e) => setProvinciaEmpresa(e.target.value)}
                required
              />
              Heredia
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="Alajuela"
                onChange={(e) => setProvinciaEmpresa(e.target.value)}
                required
              />
              Alajuela
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="Cartago"
                onChange={(e) => setProvinciaEmpresa(e.target.value)}
                required
              />
              Cartago
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="San José"
                onChange={(e) => setProvinciaEmpresa(e.target.value)}
                required
              />
              San José
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="Limón"
                onChange={(e) => setProvinciaEmpresa(e.target.value)}
                required
              />
              Limón
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="Puntarenas"
                onChange={(e) => setProvinciaEmpresa(e.target.value)}
                required
              />
              Puntarenas
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="Guanacaste"
                onChange={(e) => setProvinciaEmpresa(e.target.value)}
                required
              />
              Guanacaste
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>12. Nombre del asesor industrial: *</label>
          <input
            type="text"
            value={nombreAsesor}
            onChange={(e) => setNombreAsesor(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>13. Puesto que desempeña el asesor industrial: *</label>
          <input
            type="text"
            value={puestoAsesor}
            onChange={(e) => setPuestoAsesor(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>14. Teléfono del contacto: *</label>
          <input
            type="text"
            value={telefonoContacto}
            onChange={(e) => setTelefonoContacto(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>15. Correo del contacto: *</label>
          <input
            type="email"
            value={correoContacto}
            onChange={(e) => setCorreoContacto(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>16. Nombre del contacto de RRHH: *</label>
          <input
            type="text"
            value={nombreHR}
            onChange={(e) => setNombreHR(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>17. Teléfono de RRHH: *</label>
          <input
            type="text"
            value={telefonoHR}
            onChange={(e) => setTelefonoHR(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>18. Correo de RRHH: *</label>
          <input
            type="email"
            value={correoHR}
            onChange={(e) => setCorreoHR(e.target.value)}
            required
          />
        </div>

        <h2>Datos del proyecto</h2>
        <h3 className={styles.aviso}>
          (Si la información es extensa, puede arrastrar la esquina para agrandar.)
        </h3>

        <div className={styles.formGroup}>
          <label>
            19. Contexto: *
            <AiOutlineInfoCircle
              className={styles.infoIcon}
              onClick={() => toggleInfo('contexto')}
              title="contexto_info"
            />
          </label>
          <textarea
            type="text"
            value={contexto}
            onChange={(e) => setContexto(e.target.value)}
            required
          />
          {infoVisible.contexto && (
            <p className={styles.infoText}>
              Describa el contexto de la empresa y la situación actual...
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>
            20. Justificación: *
            <AiOutlineInfoCircle
              className={styles.infoIcon}
              onClick={() => toggleInfo('justificacion')}
              title="contexto_info"
            />
          </label>
          <textarea
            type="text"
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
            required
          />
          {infoVisible.justificacion && (
            <p className={styles.infoText}>
              Explique por qué se necesita este proyecto...
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>
            21. Síntomas principales: *
            <AiOutlineInfoCircle
              className={styles.infoIcon}
              onClick={() => toggleInfo('sintomas')}
              title="contexto_info"
            />
          </label>
          <textarea
            type="text"
            value={sintomas}
            onChange={(e) => setSintomas(e.target.value)}
            required
          />
          {infoVisible.sintomas && (
            <p className={styles.infoText}>
              Indicios de que algo no funciona...
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>
            22. Efectos o impactos para la empresa: *
            <AiOutlineInfoCircle
              className={styles.infoIcon}
              onClick={() => toggleInfo('impacto')}
              title="contexto_info"
            />
          </label>
          <textarea
            type="text"
            value={impacto}
            onChange={(e) => setImpacto(e.target.value)}
            required
          />
          {infoVisible.impacto && (
            <p className={styles.infoText}>
              Describa los impactos cuantificables...
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>
            23. Nombre del departamento: *
          </label>
          <input
            type="text"
            value={nombreDepartamento}
            onChange={(e) => setNombreDepartamento(e.target.value.slice(0, 40))}
            maxLength={40}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <div>
            <label>24. Tipo de proyecto: *
              <Select
                value={selectedTipoProyecto}
                onChange={e => setSelectedTipoProyecto(e)}
                options={tiposProyectos}
                placeholder="Seleccione un tipo de proyecto"
                className="mt-2"
                />
            </label>
          </div>
          <div>
            <label>
              25. Categoría
              <Select
                value={selectedCategoria}
                onChange={e => setSelectedCategoria(e)}
                options={categorias}
                placeholder="Seleccione una categoría"
                className="mt-2"
              />
            </label>
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label>
            26. Situación laboral actual: *
            <Select
              value={situacionLaboral}
              onChange={setSituacionLaboral}
              options={opcionesSituacionLaboral}
              placeholder="Seleccione su situación laboral"
              className="mt-2"
              required
            />
          </label>
        </div>

        <div>
            <label>
              27. Semestre propuesto: *
              <Select
                value={semestrePropuesto}
                onChange={setSemestrePropuesto}
                options={opcionesSemestre}
                placeholder="Seleccione el semestre"
                className="mt-2"
                required
              />
            </label>
        </div>

        <div>
            <label>
              28. Año propuesto: *
              <Select
                value={anioPropuesto}
                onChange={setAnioPropuesto}
                options={opcionesAnio}
                placeholder="Seleccione el año"
                className="mt-2"
                required
              />
            </label>
        </div>

        
        <div className={`${styles.formGroup} ${styles.toggle}`}>
          <label htmlFor="haPerdidoCheck">
            29- ¿Ha perdido el proyecto de graduación anteriormente?
          </label>
          <input
            id="haPerdidoCheck"
            type="checkbox"
            checked={haPerdido}
            onChange={(e) => setHaPerdido(e.target.checked)}
            className={styles.checkbox}
          />
        </div>


        {/* Formulario sobre el historial */}
        {haPerdido && (
          <div className={`${styles.formGroup} ${styles.fullWidth} ${styles.historialBox}`}>
            <p>Por favor, indique la(s) causa(s) de la pérdida:</p>
            <div className={styles.historialGrid}>
              <label>
                Causa:
                <Select
                  value={causaPerdida}
                  onChange={setCausaPerdida}
                  options={opcionesCausasPerdida}
                  placeholder="Seleccione la causa"
                />
              </label>
              <label>
                Semestre:
                <Select
                  value={semestrePerdida}
                  onChange={setSemestrePerdida}
                  options={opcionesSemestre}
                  placeholder="Semestre"
                />
              </label>
              <label>
                Año:
                <input
                  type="number"
                  placeholder="Ej: 2024"
                  value={anioPerdida}
                  min="1975"
                  max="2100"
                  onChange={(e) => setAnioPerdida(e.target.value)}
                />
              </label>
              <button
                type="button"
                className={`${styles.button} ${styles.agregarHistorial}`}
                onClick={handleAgregarHistorial}
              >
                Agregar
              </button>
            </div>

            {historialReprobacion.length > 0 && (
              <table className={styles.historialTable}>
                <thead>
                  <tr>
                    <th>Causa</th>
                    <th>Semestre</th>
                    <th>Año</th>
                    <th>Quitar</th>
                  </tr>
                </thead>
                <tbody>
                  {historialReprobacion.map((item, index) => (
                    <tr key={index}>
                      <td>{item.causa.label}</td>
                      <td>{item.semestre.label}</td>
                      <td>{item.anio}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.quitarHistorial}
                          onClick={() => handleQuitarHistorial(index)}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        

        <div className={styles.contenedorBotonesFormEstudiante}>
          {(sending === false) && (
            <button type="submit" className={`${styles.button} ${styles.enviar}`}>
              Enviar
            </button>
          )}
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

export default EstudianteForm;
