import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FormularioCoordinador.css'
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { supabase } from '../../model/Cliente';

const CoordinadorForm = () => {
  const [nombre, setNombre] = useState('');
  const [carnet, setCarnet] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const sede="Cartago";
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
  const [observaciones, setObservaciones] = useState('');

  const navigate = useNavigate();
  const [infoVisible, setInfoVisible] = useState({}); 
  const [anteproyectos, setAnteproyectos] = useState([]);


  useEffect(() => {
    consultarAnteproyectos(); // Llamada a la función para consultar anteproyectos
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para enviar los datos
    console.log({ nombre, carnet, telefono, correo, sede });
  };

  const handleGoBack = () => {
    navigate(-1); // Navega a la página anterior
  };

  const toggleInfo = (field) => {
    setInfoVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  async function consultarAnteproyectos() {
    try {
      const { data, error } = await supabase
        .from('anteproyectos')
        .select('*');

      if (error) {
        console.error('Error al consultar anteproyectos 1:', error);
        return;
      }

      setAnteproyectos(data);
      setNombre(data[0].nombre);
    } catch (error) {
      console.error('Error al consultar anteproyectos 2:', error);
    }
  }

  return (
    <div>

    <header>
        <h1>Crear anteproyecto</h1>
        </header>

    <form className='form' onSubmit={handleSubmit}>
      <h2>Datos del estudiante</h2>
      
      <div className="form-group">
        <label>1. Nombre del estudiante: *</label>
        <input
          type="text"
          value={nombre}
          readOnly
        />
      </div>

      <div className="form-group">
        <label>2. Carnet: *</label>
        <input
          type="text"
          value={carnet}
          readOnly
        />
      </div>

      <div className="form-group">
        <label>3. Teléfono: *</label>
        <input
          type="text"
          value={telefono}
          readOnly
        />
      </div>

      <div className="form-group">
        <label>4. Correo electrónico: *</label>
        <input
          type="email"
          value={correo}
          readOnly
        />
      </div>

      <div className="form-group">
        <label>5. Sede de estudio: *</label>
        <div>
          <label>
            <input
              type="radio"
              name="sede"
              value="Cartago"
              defaultChecked={sede === "Cartago"}
              disabled
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
              defaultChecked={sede === "San Carlos"}
              disabled
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
              defaultChecked={sede === "Limón"}
              disabled
            />
            Limón
          </label>
        </div>
        </div>
        <h2>Datos de la empresa</h2>

        <div className="form-group">
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
              value="Regimen definitivo"
              onChange={(e) => setEmpresa(e.target.value)}
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
            />
            Perfeccionamiento activo
          </label>
        </div>

        <div className="form-group">
        <label>7. Nombre de la empresa: *</label>
        <input
          type="text"
          value={nombreEmpresa}
          onChange={(e) => setNombreEmpresa(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>8. Actividad a la que se dedica la empresa: *</label>
        <input
          type="text"
          value={actividadEmpresa}
          onChange={(e) => setActividadEmpresa(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>9. Ubicación de la empresa (Distrito): *</label>
        <input
          type="text"
          value={distritoEmpresa}
          onChange={(e) => setDistritoEmpresa(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>10. Ubicación de la empresa (Cantón): *</label>
        <input
          type="text"
          value={cantonEmpresa}
          onChange={(e) => setCantonEmpresa(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>11. Ubicación de la empresa (Provincia): *</label>
        <input
          type="text"
          value={provinciaEmpresa}
          onChange={(e) => setProvinciaEmpresa(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>12. Nombre del asesor industrial: *</label>
        <input
          type="text"
          value={nombreAsesor}
          onChange={(e) => setNombreAsesor(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>13. Puesto que desempeña el asesor industrial en la empresa: *</label>
        <input
          type="text"
          value={puestoAsesor}
          onChange={(e) => setPuestoAsesor(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>14. Teléfono del contacto: *</label>
        <input
          type="text"
          value={telefonoContacto}
          onChange={(e) => setTelefonoContacto(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>15. Correo del contacto: *</label>
        <input
          type="email"
          value={correoContacto}
          onChange={(e) => setCorreoContacto(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>16. Nombre del contacto de recursos humanos: *</label>
        <input
          type="text"
          value={nombreHR}
          onChange={(e) => setNombreHR(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>17. Teléfono del contacto de recursos humanos: *</label>
        <input
          type="text"
          value={telefonoHR}
          onChange={(e) => setTelefonoHR(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label>18. Correo del contacto de recursos humanos: *</label>
        <input
          type="email"
          value={correoHR}
          onChange={(e) => setCorreoHR(e.target.value)}
          required
        />
      </div>

      <h2>Datos del proyecto a realizar</h2>

      <div className="form-group">
        <label>19. Contexto: *
        <AiOutlineInfoCircle 
              className="info-icon" 
              onClick={() => toggleInfo('contexto')} 
              title="contexto_info"
            />
        </label>
        <input
          type="text"
          value={contexto}
          onChange={(e) => setContexto(e.target.value)}
          required
        />
         {infoVisible.contexto && <p className="info-text">Que ha pasado en la empresa, cuales son las circunstancias que rodean al hecho
          o a interpretar la situación que desea abordar.</p>}
      </div>

      <div className="form-group">
        <label>20. Justitificación del trabajo a realizar: *
        <AiOutlineInfoCircle 
              className="info-icon" 
              onClick={() => toggleInfo('justificacion')} 
              title="contexto_info"
            />
        </label>
        <input
          type="text"
          value={justificacion}
          onChange={(e) => setJustificacion(e.target.value)}
          required
        />
        {infoVisible.justificacion && <p className="info-text">La razón por la cual debe de realizarse el proyecto y el 
          porqué es necesario e importante para la empresa. Se debe tener claro que la justificación no es el análisis del
           problema, sino la que indica que hay un problema que amerita ser resuelta.</p>}
      </div>

      <div className="form-group">
        <label>21. Síntomas principales (a lo sumo 3): *
        <AiOutlineInfoCircle 
              className="info-icon" 
              onClick={() => toggleInfo('sintomas')} 
              title="contexto_info"
            />
        </label>
        <input
          type="text"
          value={sintomas}
          onChange={(e) => setSintomas(e.target.value)}
          required
        />
        {infoVisible.sintomas && <p className="info-text">Cuáles son los indicios, que indican que algo está ocurriendo
          y no está funcionando bien.</p>}
      </div>

      <div className="form-group">
        <label>22. Efectos o impactos para la empresa: *
        <AiOutlineInfoCircle 
              className="info-icon" 
              onClick={() => toggleInfo('impacto')} 
              title="contexto_info"
            />
        </label>
        <input
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

      <div className="form-group">
        <label>23. Nombre del departamento a realizar el proyecto: *</label>
        <input
          type="text"
          value={nombreDepartamento}
          onChange={(e) => setNombreDepartamento(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
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

    <div className="form-group">
        <label>Observaciones del profesor *</label>
        <input
          type="text"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          required
        />
      </div>

    <div className='button-container'>
      <button type="submit" className='button aprobar'>Aprobar</button>
      <button type="submit" className='button reprobar'>Reprobar</button>
      <button type="button" className='button cancelar' onClick={handleGoBack}>Cancelar</button>
    </div>

    

    </form>
    
    <footer>
        <p>Instituto Tecnológico de Costa Rica 2024</p>
    </footer>
    </div>
  );
};

export default CoordinadorForm;
