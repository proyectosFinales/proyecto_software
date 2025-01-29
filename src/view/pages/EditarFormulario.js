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
import { AiOutlineInfoCircle } from 'react-icons/ai';
import Select from 'react-select';
import supabase from '../../model/supabase'; // Para verificar si ya calificó
import Footer from '../components/Footer';
import { errorToast, successToast } from '../components/toast';
import { fetchCategorias } from '../../controller/Categoria';

/**
 * Componente principal de edición.
 */
const CoordinadorForm = () => {
  // Campos del estudiante (propios de Estudiante y de Usuario)
  const [userId, setUserId] = useState('');            // PK en Usuario
  const [estudianteId, setEstudianteId] = useState(''); // PK en Estudiante
  const [idAnteproyecto, setIdAnteproyecto] = useState('');
  const [estado, setEstado] = useState('');

  // Datos de Usuario (nombre, correo, telefono, sede)
  const [nombre, setNombre] = useState('');
  const [carnet, setCarnet] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [sede, setSede] = useState('');
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
  
  // Estados para el contenido actual y anterior
  const [contexto, setContexto] = useState('');
  const [oldContexto, setOldContexto] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [oldJustificacion, setOldJustificacion] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [oldSintomas, setOldSintomas] = useState('');
  const [impacto, setImpacto] = useState('');
  const [oldImpacto, setOldImpacto] = useState('');
  
  const [nombreDepartamento, setNombreDepartamento] = useState('');
  const [tipoProyecto, setTipoProyecto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [infoVisible, setInfoVisible] = useState({});
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [categorias, setCategorias] = useState([]);
  
  // Correction states for form validation
  const [contextoC, setContextoC] = useState('');
  const [justificacionC, setJustificacionC] = useState('');
  const [sintomasC, setSintomasC] = useState('');
  const [impactoC, setImpactoC] = useState('');
  const [nombreDepartamentoC, setNombreDepartamentoC] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Obtener query param "id" (anteproyecto ID)
  const getQueryParam = (param) => {
    const params = new URLSearchParams(location.search);
    return params.get(param);
  };

  useEffect(() => {
    fetchCategorias().then(data => {
      const options = data.map(categoria => ({
        value: categoria.categoria_id,
        label: categoria.nombre
      }));
      setCategorias([{value: '', label: "-- Asigna una categoria --"}, ...options]);
    }).catch(console.error);
  }, []);

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
          categoria_id,
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
          ),
          Proyecto:proyecto_anteproyecto_id_fkey (
            id
          ),
          Categoria:categoria_id (
            nombre
          )
        `)
        .eq('id', id)
        .single();
        console.log(data);
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
      if(data.Proyecto.length == 0){
        setProyecto("empty")
      }
      else{
        setProyecto("assigned");
      }
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

      if(data.Categoria){
        setSelectedCategoria({value: data.categoria_id, label: data.Categoria.nombre});
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

  async function eliminarCorrecciones(){
    try{
      const { error } = await supabase
        .from('Correcciones')
        .delete()
        .eq('anteproyecto_id', idAnteproyecto);
        if (error) {
        alert('Error al eliminar correcciones: ' + error.message);
        return;
      }
    }catch(error){
      alert('Error al eliminar correcciones:' + error);
    }
  }

  async function borrarAnteproyecto(){
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
          impacto: impacto,
          categoria_id: selectedCategoria.value
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

  async function eliminarAnteproyecto(e) {
    e.preventDefault();
    const confirmReprobar = window.confirm("¿Está seguro de que quiere borrar el anteproyecto?");
    if (!confirmReprobar) return;
    if(proyecto == "empty"){
      try {
        const contactoCount = await consultarContactos(nombreAsesor);
        const rhCount = await consultarHR(nombreHR);
        await eliminarCorrecciones();
        await eliminarAnteContact();
        await borrarAnteproyecto();
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

        alert('Anteproyecto eliminado exitosamente.');
        navigate('/anteproyectosEstudiante');
      } catch (error) {
        alert('Error al eliminar anteproyecto: ' + error.message);
      }
    }
    else{
      alert("No se puede eliminar el anteproyecto, ya se encuentra asignado a un profesor");
    }
  }

  const handleGoBack = () => {
    navigate(-1);
  };

  const toggleInfo = (field) => {
    setInfoVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-20 bg-gray-300 flex items-center justify-center border-b border-black">
        <h1 className="text-2xl font-bold">Editar Anteproyecto</h1>
      </header>

      <form onSubmit={editarAnteproyecto} className="max-w-7xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
        {/* DATOS DEL ESTUDIANTE */}
        <h2 className="text-xl font-bold mb-6 border-b pb-2">Datos del estudiante</h2>

        <div className="space-y-6">
          {/* Each form group */}
          <div className="space-y-2">
            <label className="block font-semibold">1. Nombre del estudiante:</label>
            <input
              type="text"
              value={nombre}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">2. Carnet:</label>
            <input
              type="text"
              value={carnet}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">3. Teléfono:</label>
            <input
              type="text"
              value={telefono}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">4. Correo electrónico:</label>
            <input
              type="email"
              value={correo}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">5. Sede:</label>
            <input
              type="text"
              value={sede}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>
        </div>

        {/* DATOS DE LA EMPRESA */}
        <h2 className="text-xl font-bold mt-8 mb-6 border-b pb-2">Datos de la empresa</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block font-semibold">6. Tipo de Empresa:</label>
            <input
              type="text"
              value={tipoEmpresa}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">7. Nombre de la empresa:</label>
            <input
              type="text"
              value={nombreEmpresa}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">8. Actividad de la empresa:</label>
            <input
              type="text"
              value={actividadEmpresa}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block font-semibold">9. Distrito:</label>
              <input
                type="text"
                value={distritoEmpresa}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-semibold">10. Cantón:</label>
              <input
                type="text"
                value={cantonEmpresa}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-semibold">11. Provincia:</label>
              <input
                type="text"
                value={provinciaEmpresa}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* DATOS DE CONTACTOS */}
        <h2 className="text-xl font-bold mt-8 mb-6 border-b pb-2">Datos de contactos en la empresa</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block font-semibold">12. Nombre del asesor industrial:</label>
            <input
              type="text"
              value={nombreAsesor}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">13. Puesto que desempeña el asesor:</label>
            <input
              type="text"
              value={puestoAsesor}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">14. Teléfono del contacto:</label>
            <input
              type="text"
              value={telefonoContacto}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">15. Correo del contacto:</label>
            <input
              type="email"
              value={correoContacto}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">16. Nombre del contacto de RRHH:</label>
            <input
              type="text"
              value={nombreHR}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">17. Teléfono RRHH:</label>
            <input
              type="text"
              value={telefonoHR}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">18. Correo RRHH:</label>
            <input
              type="email"
              value={correoHR}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>
        </div>

        {/* DATOS DEL PROYECTO */}
        <h2 className="text-xl font-bold mt-8 mb-6 border-b pb-2">Datos del proyecto</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block font-semibold flex items-center">
              19. Contexto:
              <AiOutlineInfoCircle
                className="ml-2 text-blue-500 cursor-pointer"
                onClick={() => toggleInfo('contexto')}
              />
            </label>
            <textarea
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              required
              className="w-full p-2 border rounded-md min-h-[100px]"
            />
            {infoVisible.contexto && (
              <p className="text-sm text-gray-600 mt-1">Explicación sobre el contexto...</p>
            )}
            {contextoC && (
              <p className="text-red-600 mt-1">{contextoC}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block font-semibold flex items-center">
              20. Justificación:
              <AiOutlineInfoCircle
                className="ml-2 text-blue-500 cursor-pointer"
                onClick={() => toggleInfo('justificacion')}
              />
            </label>
            <textarea
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              required
              className="w-full p-2 border rounded-md min-h-[100px]"
            />
            {infoVisible.justificacion && (
              <p className="text-sm text-gray-600 mt-1">Información sobre la justificación...</p>
            )}
            {justificacionC && (
              <p className="text-red-600 mt-1">{justificacionC}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block font-semibold flex items-center">
              21. Síntomas:
              <AiOutlineInfoCircle
                className="ml-2 text-blue-500 cursor-pointer"
                onClick={() => toggleInfo('sintomas')}
              />
            </label>
            <textarea
              value={sintomas}
              onChange={(e) => setSintomas(e.target.value)}
              required
              className="w-full p-2 border rounded-md min-h-[100px]"
            />
            {infoVisible.sintomas && (
              <p className="text-sm text-gray-600 mt-1">Información sobre los síntomas...</p>
            )}
            {sintomasC && (
              <p className="text-red-600 mt-1">{sintomasC}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block font-semibold flex items-center">
              22. Impacto:
              <AiOutlineInfoCircle
                className="ml-2 text-blue-500 cursor-pointer"
                onClick={() => toggleInfo('impacto')}
              />
            </label>
            <textarea
              value={impacto}
              onChange={(e) => setImpacto(e.target.value)}
              required
              className="w-full p-2 border rounded-md min-h-[100px]"
            />
            {infoVisible.impacto && (
              <p className="text-sm text-gray-600 mt-1">Información sobre el impacto...</p>
            )}
            {impactoC && (
              <p className="text-red-600 mt-1">{impactoC}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block font-semibold flex items-center">
              23. Nombre del departamento:
              <AiOutlineInfoCircle
                className="ml-2 text-blue-500 cursor-pointer"
                onClick={() => toggleInfo('departamento')}
              />
            </label>
            <input
              type="text"
              value={nombreDepartamento}
              onChange={(e) => setNombreDepartamento(e.target.value)}
              required
              className="w-full p-2 border rounded-md"
            />
            {infoVisible.departamento && (
              <p className="text-sm text-gray-600 mt-1">Información sobre el departamento...</p>
            )}
            {nombreDepartamentoC && (
              <p className="text-red-600 mt-1">{nombreDepartamentoC}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">24. Tipo de Proyecto:</label>
            <input
              type="text"
              value={tipoProyecto}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">25. Categoría</label>
            <Select
              value={selectedCategoria}
              onChange={e => setSelectedCategoria(e)}
              options={categorias}
              placeholder="Seleccione una categoría"
              className="mt-2"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">Observaciones del profesor:</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100 min-h-[100px]"
            />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-4 mt-8">
        {proyecto == empty && (
          <button
            type="submit"
            className="px-6 py-2 bg-azul text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Editar
          </button>
        )}
          {proyecto == empty && (
          <button
            type="button"
            onClick={eliminarAnteproyecto}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
          )}
          <button
            type="button"
            onClick={handleGoBack}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </form>

      <Footer />
    </div>
  );
};

export default CoordinadorForm;
