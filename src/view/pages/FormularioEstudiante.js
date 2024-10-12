import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FormularioEstudiante.css'
import { AiOutlineInfoCircle } from 'react-icons/ai';
import {supabase} from '../../model/Cliente';

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

  async function insertarAnteproyecto(e) {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('anteproyectos')
        .insert({nombre:nombre,
          carnet:carnet,
          telefono:telefono,
          correo:correo,
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
        });
      if (error) {
        console.error('Error al insertar anteproyecto:', error);
        return;
      }

      console.log('Anteproyecto insertado:', data);
    } catch (error) {
      console.error('Error al insertar anteproyecto:', error);
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

    <header>
        <h1>Crear anteproyecto</h1>
        </header>

    <form className='form' onSubmit={insertarAnteproyecto}>
      <h2>Datos del estudiante</h2>
      
      <div className="form-group">
        <label>1. Nombre del estudiante: *
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>2. Carnet: *</label>
        <input
          type="text"
          value={carnet}
          onChange={(e) => setCarnet(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>3. Teléfono: *</label>
        <input
          type="text"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>4. Correo electrónico: *</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
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
              onChange={(e) => setSede(e.target.value)}
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
              onChange={(e) => setSede(e.target.value)}
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
              value="Régimen definitivo"
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
    <div className='button-container'>
      <button type="submit" className='button enviar'>Enviar</button>
      <button type="button" className='button cancelar' onClick={handleGoBack}>Cancelar</button>
    </div>
    </form>
    
    <footer>
        <p>Instituto Tecnológico de Costa Rica 2024</p>
    </footer>
    </div>
  );
};

export default EstudianteForm;
