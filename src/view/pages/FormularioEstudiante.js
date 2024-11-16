import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/FormularioEstudiante.module.css'
import { AiOutlineInfoCircle } from 'react-icons/ai';
import {supabase} from '../../model/Cliente';
import Footer from '../components/Footer';
import {errorToast, successToast} from '../components/toast';

const EstudianteForm = () => {
  const [nombre, setNombre] = useState('');
  const [carnet, setCarnet] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [sede, setSede] = useState('');
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
  const [tipoEmpresa, setEmpresa] = useState('');
  const [contexto, setContexto] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [impacto, setImpacto] = useState('');
  const [nombreDepartamento, setNombreDepartamento] = useState('');
  const [tipoProyecto, setProyecto] = useState('');

  const navigate = useNavigate();
  const [infoVisible, setInfoVisible] = useState({});

  useEffect(() => {
    consultarEstudiante();
  },);

  async function consultarEstudiante() {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`id,
          sede,
          correo,
          estudiantes(id, nombre, carnet, telefono)`)
          .eq('id', sessionStorage.getItem('token'));
      if (error) {
        console.error('Error al consultar estudiante:', error);
        return;
      }
      setNombre(data[0].estudiantes.nombre);
      setCarnet(data[0].estudiantes.carnet);
      setTelefono(data[0].estudiantes.telefono);
      setCorreo(data[0].correo);
      setSede(data[0].sede);

    } catch (error) {
      alert('Error al consultar estudiante o usuario');
    }
  }

  async function insertarAnteproyecto(e) {
    e.preventDefault();
    const confirmarEnvio=window.confirm("¿Está seguro que desea enviar el anteproyecto?");

    if(!confirmarEnvio){return;}

    try {
      const { data2, error2 } = await supabase
        .from('anteproyectos')
        .insert({
          sede:sede,
          tipoEmpresa:tipoEmpresa,
          nombreEmpresa:nombreEmpresa,
          actividadEmpresa:actividadEmpresa,
          distritoEmpresa:distritoEmpresa,
          cantonEmpresa:cantonEmpresa,
          provinciaEmpresa:provinciaEmpresa,
          nombreAsesor:nombreAsesor,
          puestoAsesor:puestoAsesor,
          telefonoContacto:telefonoContacto,
          correoContacto:correoContacto,
          nombreHR:nombreHR,
          telefonoHR:telefonoHR,
          correoHR:correoHR,
          tipoEmpresa:tipoEmpresa,
          contexto:contexto,
          justificacion:justificacion,
          sintomas:sintomas,
          impacto:impacto,
          nombreDepartamento:nombreDepartamento,
          tipoProyecto:tipoProyecto,
          idEstudiante: sessionStorage.getItem('token')
        });

      if (error2) throw error2;
      

      alert('Anteproyecto insertado exitosamente');

      navigate('/anteproyectosEstudiante');

    } catch (error) {
      alert('Error al insertar anteproyecto:', error);
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
        <label>1. Nombre del estudiante: *
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          readOnly
        />
      </div>

      <div className={styles.formGroup}>
        <label>2. Carnet: *</label>
        <input
          type="text"
          value={carnet}
          onChange={(e) => setCarnet(e.target.value)}
          readOnly
        />
      </div>

      <div className={styles.formGroup}>
        <label>3. Teléfono: *</label>
        <input
          type="text"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          readOnly
        />
      </div>

      <div className={styles.formGroup}>
        <label>4. Correo electrónico: *</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          readOnly
        />
      </div>

      <div className={styles.formGroup}>
        <label>5. Sede: *</label>
        <input
          type="text"
          value={sede}
          onChange={(e) => setSede(e.target.value)}
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
              onChange={(e) => setEmpresa(e.target.value)}
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
              onChange={(e) => setEmpresa(e.target.value)}
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
              onChange={(e) => setEmpresa(e.target.value)}
              required
            />
            Perfeccionamiento activo
          </label>
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
        <label>8. Actividad a la que se dedica la empresa: *</label>
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
        <label>13. Puesto que desempeña el asesor industrial en la empresa: *</label>
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
        <label>16. Nombre del contacto de recursos humanos: *</label>
        <input
          type="text"
          value={nombreHR}
          onChange={(e) => setNombreHR(e.target.value)}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>17. Teléfono del contacto de recursos humanos: *</label>
        <input
          type="text"
          value={telefonoHR}
          onChange={(e) => setTelefonoHR(e.target.value)}
          required
        />
      </div>
      
      <div className={styles.formGroup}>
        <label>18. Correo del contacto de recursos humanos: *</label>
        <input
          type="email"
          value={correoHR}
          onChange={(e) => setCorreoHR(e.target.value)}
          required
        />
      </div>

      <h2>Datos del proyecto a realizar</h2>
      <h3 className={styles.aviso}>(En caso de que la cantidad de información supere la altura del campo puede expandir el campo al arrastrar la esquina inferior derecha del mismo)</h3>

      <div className={styles.formGroup}>
        <label>19. Contexto: *
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
         {infoVisible.contexto && <p className={styles.infoText}>Que ha pasado en la empresa, cuales son las circunstancias que rodean al hecho
          o a interpretar la situación que desea abordar.</p>}
      </div>

      <div className={styles.formGroup}>
        <label>20. Justitificación del trabajo a realizar: *
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
        {infoVisible.justificacion && <p className={styles.infoText}>La razón por la cual debe de realizarse el proyecto y el 
          porqué es necesario e importante para la empresa. Se debe tener claro que la justificación no es el análisis del
           problema, sino la que indica que hay un problema que amerita ser resuelta.</p>}
      </div>

      <div className={styles.formGroup}>
        <label>21. Síntomas principales (a lo sumo 3): *
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
        {infoVisible.sintomas && <p className={styles.infoText}>Cuáles son los indicios, que indican que algo está ocurriendo
          y no está funcionando bien.</p>}
      </div>

      <div className={styles.formGroup}>
        <label>22. Efectos o impactos para la empresa: *
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
        {infoVisible.impacto && <p className={styles.infoText}>Cuáles son los efectos o resultados no conformes que 
          alertan sobre la necesidad de desarrollar el proyecto. Tome en cuenta que esta sección es parte de un 
          trabajo de ingeniería, por lo tanto, debe mostrarse la dimensión (cuantificación) de los efectos 
          (incluir cifras, métricas, indicadores que evidencien lo que está ocurriendo y por ende justifiquen el estudio).</p>}
      </div>

      <div className={styles.formGroup}>
        <label>23. Nombre del departamento a realizar el proyecto: *</label>
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
              value="Extension"
              onChange={(e) => setProyecto(e.target.value)}
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
              onChange={(e) => setProyecto(e.target.value)}
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
              onChange={(e) => setProyecto(e.target.value)}
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
              onChange={(e) => setProyecto(e.target.value)}
            />
            Aplicado a PYME
          </label>
        </div>
      </div>
    </div>
    <div className={styles.contenedorBotonesFormEstudiante}>
          <button type="submit" className={styles.button + ' ' + styles.enviar}>Enviar</button>
          <button type="button" className={styles.button + ' ' + styles.cancelar} onClick={handleGoBack}>Cancelar</button>
    </div>
    </form>
    
    <Footer />
    </div>
  );
};

export default EstudianteForm;
