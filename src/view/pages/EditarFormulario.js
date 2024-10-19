import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/FormularioCoordinador.module.css'
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { supabase } from '../../model/Cliente';

const CoordinadorForm = () => {
  const [idAnteproyecto, setIdAnteproyecto] = useState('');
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
  const [tipoEmpresa, setTipoEmpresa] = useState('');
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
  const [anteproyectos, setAnteproyectos] = useState([]);

  // Función para obtener el valor de un query parameter
  const getQueryParam = (param) => {
    const params = new URLSearchParams(location.search);
    return params.get(param);
  };


  useEffect(() => {
    const id = getQueryParam('id'); // Obtener el id del query parameter
    if (id) {
      // Aquí puedes hacer una consulta para obtener los datos del anteproyecto por su id
      console.log('ID del anteproyecto para editar:', id);
      // Ejemplo: consultarAnteproyecto(id);
    }
    consultarAnteproyectos(id);
  }, [location]);

  
  async function editarAnteproyecto(e) {
    e.preventDefault();
    const confirmAprobar=window.confirm("¿Está seguro de ACTUALIZAR el anteproyecto?");

    if(!confirmAprobar){return;}

    try {
        const { data1, error1 } = await supabase
        .from('estudiantes')
        .update({
          nombre: nombre,
          carnet: carnet,
          telefono: telefono,
          correo: correo
        })
        .eq('id','8a673ee4-4842-4936-92eb-85b598b5d810');
      
      if (error1) throw error1;

      console.log('Actualización en tabla estudiante exitosa', data1);

      const { data2, error2 } = await supabase
        .from('anteproyectos')
        .update({
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
          tipoProyecto:tipoProyecto
        })
        .eq('id', idAnteproyecto);

      console.log('Anteproyecto actualizado:', data2);
      if (error2) throw error2;
      navigate('/anteproyectosEstudiante');

    } catch (error) {
      console.error('Error al actualizar anteproyecto:', error);
    }
  }


  const handleGoBack = () => {
    navigate(-1); // Navega a la página anterior
  };

  const toggleInfo = (field) => {
    setInfoVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  async function consultarAnteproyectos(id) {
    try {
      const { data, error } = await supabase
        .from('anteproyectos')
        .select(`sede,
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
          tipoEmpresa,
          contexto,
          justificacion,
          sintomas,
          impacto,
          nombreDepartamento,
          tipoProyecto,
          observaciones,
          idEstudiante,
          estudiantes(id, nombre, carnet, telefono, correo)`)
        .eq('id', id);

      if (error) {
        console.error('Error al consultar anteproyectos:', error);
        return;
      }

      setIdAnteproyecto(id);
      setNombre(data[0].estudiantes.nombre);
      setCarnet(data[0].estudiantes.carnet);
      setTelefono(data[0].estudiantes.telefono);
      setCorreo(data[0].estudiantes.correo);
      setSede(data[0].sede);
      setTipoEmpresa(data[0].tipoEmpresa);
      setNombreEmpresa(data[0].nombreEmpresa);
      setActividadEmpresa(data[0].actividadEmpresa);
      setDistritoEmpresa(data[0].distritoEmpresa);
      setCantonEmpresa(data[0].cantonEmpresa);
      setProvinciaEmpresa(data[0].provinciaEmpresa);
      setNombreAsesor(data[0].nombreAsesor);
      setPuestoAsesor(data[0].puestoAsesor);
      setTelefonoContacto(data[0].telefonoContacto);
      setCorreoContacto(data[0].correoContacto);
      setNombreHR(data[0].nombreHR);
      setTelefonoHR(data[0].telefonoHR);
      setCorreoHR(data[0].correoHR);
      setContexto(data[0].contexto);
      setJustificacion(data[0].justificacion);
      setSintomas(data[0].sintomas);
      setImpacto(data[0].impacto);
      setNombreDepartamento(data[0].nombreDepartamento);
      setTipoProyecto(data[0].tipoProyecto);
      setObservaciones(data[0].observaciones);
    } catch (error) {
      console.error('Error al consultar setear variables:', error);
    }
  }

  return (
    <div>

    <header>
        <h1>Crear anteproyecto</h1>
        </header>

    <form className={styles.form} onSubmit={editarAnteproyecto}>
      <h2>Datos del estudiante</h2>
      
      <div className={styles.formGroup}>
        <label>1. Nombre del estudiante: *</label>
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
        <label>5. Sede de estudio: *</label>
        <div>
          <label>
            <input
              type="radio"
              name="sede"
              value="Cartago"
              checked={sede === "Cartago" || sede === " "}
              onChange={(e) => setSede(e.target.value)}
              required
            />
            Cartago
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              name="sede"
              value="San Carlos"
              checked={sede === "San Carlos" || sede === " "}
              onChange={(e) => setSede(e.target.value)}
              required
            />
            San Carlos
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              name="sede"
              value="Limón"
              checked={sede === "Limón" || sede === " "}
              onChange={(e) => setSede(e.target.value)}
              required
            />
            Limón
          </label>
        </div>
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
              checked={tipoEmpresa === "Zona franca" || tipoEmpresa === " "}
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
              checked={tipoEmpresa === "Régimen definitivo" || tipoEmpresa === " "}
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
              checked={tipoEmpresa === "Perfeccionamiento activo" || tipoEmpresa === " "}
              onChange={(e) => setTipoEmpresa(e.target.value)}
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
              checked={provinciaEmpresa === "Heredia" || provinciaEmpresa === " "}
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
              checked={provinciaEmpresa === "Cartago" || provinciaEmpresa === " "}
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
              checked={provinciaEmpresa === "San José" || provinciaEmpresa === " "}
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
              checked={provinciaEmpresa === "Limón" || provinciaEmpresa === " "}
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
              checked={provinciaEmpresa === "Puntarenas" || provinciaEmpresa === " "}
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
         {infoVisible.contexto && <p className="info-text">Que ha pasado en la empresa, cuales son las circunstancias que rodean al hecho
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
        {infoVisible.justificacion && <p className="info-text">La razón por la cual debe de realizarse el proyecto y el 
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
        {infoVisible.sintomas && <p className="info-text">Cuáles son los indicios, que indican que algo está ocurriendo
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
        {infoVisible.impacto && <p className="info-text">Cuáles son los efectos o resultados no conformes que 
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
              value="Extensión"
              checked={tipoProyecto === "Extensión" || tipoProyecto === " "}
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
              checked={tipoProyecto === "Investigación" || tipoProyecto === " "}
              onChange={(e) => setTipoProyecto(e.target.value)}
              required
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
              checked={tipoProyecto === "Aplicado a empresa" || tipoProyecto === " "}
              onChange={(e) => setTipoProyecto(e.target.value)}
              required
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
              checked={tipoProyecto === "Aplicado a PYME" || tipoProyecto === " "}
              onChange={(e) => setTipoProyecto(e.target.value)}
              required
            />
            Aplicado a PYME
          </label>
        </div>
      </div>
    </div>

    <div className={styles.formGroup}>
        <label>Observaciones del profesor </label>
        <input
          type="text"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          readOnly
        />
      </div>

    <div className={styles.contenedor_botones_formCoordinador}>
      <button type="submit" className={styles.button + ' ' + styles.aprobar}>Editar</button>
      <button type="button" className={styles.button + ' ' + styles.cancelar} onClick={handleGoBack}>Cancelar</button>
    </div>

    </form>
    
    <footer>
        <p>Instituto Tecnológico de Costa Rica 2024</p>
    </footer>
    </div>
  );
};

export default CoordinadorForm;
