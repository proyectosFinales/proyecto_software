import React, { useState, useEffect } from 'react';
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
  const [sede, setSede] = useState('');

  // Datos de la empresa y anteproyecto a crear
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
  const telRegex = /^(\+?506\s?)?[2-9]\d{7}$/;

  const navigate = useNavigate();
  const [infoVisible, setInfoVisible] = useState({});

  // Guardar el ID del estudiante (estudiante_id) que necesitamos para insertar en Anteproyecto
  const [estudianteId, setEstudianteId] = useState(null);

  useEffect(() => {
    consultarEstudiante();
  }, []);

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
          distrito: distritoEmpresa
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
      if(data.length == 0){
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
      if(data.length == 0){
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

    try {
      const empresaCount = await consultarEmpresas();
      const contactoCount = await consultarContactos(nombreAsesor);
      const rhCount = await consultarContactos(nombreHR);
      if(empresaCount == "empty"){
        await insertarEmpresa();
      }
      const empresID = await consultarEmpresas();
      if(contactoCount == "empty"){
        await insertarContacto(nombreAsesor, puestoAsesor, correoContacto, telefonoContacto, empresID);
      }
      const contactID = await consultarContactos(nombreAsesor);
      if(rhCount == "empty"){
        await insertarContacto(nombreHR, 'Recursos Humanos', correoHR, telefonoHR, empresID);
      }
      const rrhhID = await consultarContactos(nombreHR);
      // Insertar en la tabla "Anteproyecto"
      const { data, error } = await supabase
        .from('Anteproyecto')
        .insert({
          estudiante_id: estudianteId,      // fk
          empresa_id: empresID,
          actividad: actividadEmpresa,
          contexto: contexto,
          justificacion: justificacion,
          sintomas: sintomas,
          impacto: impacto,
          tipo: tipoProyecto,
          departamento: nombreDepartamento,
          estado: 'Pendiente'
        })
        .select();
      

      if (error){ 
        throw error;
      }
      else{
        insertarAnteContact(data[0].id, contactID, rrhhID);
      }
      successToast('Anteproyecto insertado exitosamente');
      navigate('/anteproyectosEstudiante');
    } catch (err) {
      console.error('Error al insertar anteproyecto:', err);
      errorToast('Error al insertar anteproyecto: ' + err.message);
    }
  }

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
                value=" Empresa Pública"
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
          <input
            type="text"
            value={actividadEmpresa}
            onChange={(e) => setActividadEmpresa(e.target.value)}
            required
          />
        </div>

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
            onChange={(e) => setNombreDepartamento(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>24. Tipo de proyecto: *</label>
          <div>
            <label>
              <input
                type="radio"
                name="tipoProyecto"
                value="Extensión"
                onChange={(e) => setTipoProyecto(e.target.value)}
                required
              />
              Extensión
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="tipoProyecto"
                value="Investigación"
                onChange={(e) => setTipoProyecto(e.target.value)}
              />
              Investigación
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="tipoProyecto"
                value="Aplicado a empresa"
                onChange={(e) => setTipoProyecto(e.target.value)}
              />
              Aplicado a empresa
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="tipoProyecto"
                value="Aplicado a PYME"
                onChange={(e) => setTipoProyecto(e.target.value)}
              />
              Aplicado a PYME
            </label>
          </div>
        </div>

        <div className={styles.contenedorBotonesFormEstudiante}>
          <button type="submit" className={`${styles.button} ${styles.enviar}`}>
            Enviar
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

export default EstudianteForm;
