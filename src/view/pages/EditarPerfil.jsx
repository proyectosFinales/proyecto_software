import { React, useState, useEffect } from "react";
import Select from "react-select";
import { 
  FaUser, 
  FaIdCard, 
  FaPhone, 
  FaEnvelope, 
  FaLock, 
  FaMapMarked, 
  FaUsers,
  FaShieldAlt
} from 'react-icons/fa';
import Footer from "../components/Footer";
import { getUserInfo, updateUserInfo } from "../../controller/userInfo";
import { useNavigate } from "react-router-dom";
import HeaderCoordinador from "../components/HeaderCoordinador";
import HeaderProfesor from "../components/HeaderProfesor";
import HeaderEstudiante from "../components/HeaderEstudiante";
import { fetchCategorias } from "../../controller/Categoria";
import supabase from "../../model/supabase";

const EditarPerfil = () => {
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const id = sessionStorage.getItem("token");
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateUserInfo({...userData, categoria_id: selectedCategoria?.value});
      alert("Usuario modificado con éxito.");
      handleCancel();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (userData.rol === "1") {
      navigate("/menuCoordinador");
    } else if (userData.rol === "2") {
      navigate("/menuProfesor");
    } else if (userData.rol === "3") {
      navigate("/menuEstudiante");
    }
  };

  useEffect(() => {
    const obtenerInfoUsuario = async () => {
      try {
        setIsLoading(true);
        const data = await getUserInfo(id);
        const baseData = {
          id: data.id,
          rol: data.rol?.toString(),
          correo: data.correo,
          contrasena: data.contrasena,
          sede: data.sede,
          telefono: data.telefono,
          nombre: data.nombre
        };

        if (data.rol == 2 && data.Profesor && data.Profesor.length > 0) {
          baseData.profesor_id = data.Profesor[0].profesor_id;
          baseData.cantidad_estudiantes = data.Profesor[0].cantidad_estudiantes ?? 0;
          setSelectedCategoria({value: data.Profesor[0].categoria_id, label: data.Profesor[0].Categoria?.nombre});
        }

        if (data.rol == 3 && data.Estudiante) {
          baseData.estudiante_id = data.Estudiante.estudiante_id;
          baseData.carnet = data.Estudiante.carnet || "";
          baseData.asesor = data.Estudiante.asesor || "Sin asignar";
          baseData.estado = data.Estudiante.estado || "En progreso";
        }

        console.log("User data:", data); // For debugging
        console.log("Base data:", baseData); // For debugging
        setUserData(baseData);
      } catch (error) {
        alert(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      obtenerInfoUsuario();
    }
  }, [id]);

  useEffect(() => {
    fetchCategorias().then(data => {
      const options = data.map(categoria => ({
        value: categoria.categoria_id,
        label: categoria.nombre
      }));
      setCategorias([{value: '', label: "-- Asigna una categoria --"}, ...options]);
    }).catch(console.error);
  }, []);

  const getRolLabel = (rolNum) => {
    switch (rolNum) {
      case "1": return "Coordinador";
      case "2": return "Profesor";
      case "3": return "Estudiante";
      default: return "Desconocido";
    }
  };

  const InputField = ({ icon: Icon, label, name, type = "text", value, onChange, readOnly = false }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-azul" />
        </div>
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          readOnly={readOnly}
          className={`
            w-full pl-10 pr-4 py-2.5
            border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-azul focus:border-transparent
            ${readOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:border-azul'}
            transition-all duration-200
          `}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dynamic Header based on role */}
      {userData.rol === "1" && <HeaderCoordinador title="Editar Perfil" />}
      {userData.rol === "2" && <HeaderProfesor title="Editar Perfil" />}
      {userData.rol === "3" && <HeaderEstudiante title="Editar Perfil" />}

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azul"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
            <div className="bg-gradient-to-r from-azul to-blue-500 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">
                Editar Información de Usuario
              </h2>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Rol */}
                  <InputField
                    icon={FaShieldAlt}
                    label="Rol (no modificable)"
                    name="rol"
                    value={getRolLabel(userData.rol)}
                    readOnly={true}
                  />

                  {/* Nombre */}
                  <InputField
                    icon={FaUser}
                    label="Nombre"
                    name="nombre"
                    value={userData.nombre}
                    onChange={handleChange}
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Correo */}
                  <InputField
                    icon={FaEnvelope}
                    label="Correo electrónico"
                    name="correo"
                    type="email"
                    value={userData.correo}
                    onChange={handleChange}
                  />

                  {/* Teléfono */}
                  <InputField
                    icon={FaPhone}
                    label="Teléfono"
                    name="telefono"
                    value={userData.telefono}
                    onChange={handleChange}
                  />
                </div>

                {/* Security Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contraseña */}
                  <InputField
                    icon={FaLock}
                    label="Contraseña"
                    name="contrasena"
                    type="password"
                    value={userData.contrasena}
                    onChange={handleChange}
                  />

                  {/* Sede */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sede
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMapMarked className="h-5 w-5 text-azul" />
                      </div>
                      <select
                        name="sede"
                        value={userData.sede || ""}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul focus:border-transparent hover:border-azul transition-all duration-200"
                      >
                        <option value="">Seleccione una sede</option>
                        <option value="Central Cartago">Central Cartago</option>
                        <option value="Local San José">Local San José</option>
                        <option value="Local San Carlos">Local San Carlos</option>
                        <option value="Limón">Centro Académico de Limón</option>
                        <option value="Alajuela">Centro Académico de Alajuela</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Professor-specific fields */}
                {userData.rol === "2" && (
                  <div className="space-y-6 border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900">Información de Profesor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        icon={FaUsers}
                        label="Cantidad de estudiantes asignados"
                        name="cantidad_estudiantes"
                        type="number"
                        value={userData.cantidad_estudiantes}
                        readOnly={true}
                      />
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Categoría
                        </label>
                        <Select
                          value={selectedCategoria}
                          onChange={e => setSelectedCategoria(e)}
                          options={categorias}
                          placeholder="Seleccione una categoría"
                          className="rounded-lg"
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              minHeight: '42px',
                              borderRadius: '0.5rem',
                              borderColor: state.isFocused ? '#2563EB' : '#D1D5DB',
                              boxShadow: state.isFocused ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
                              '&:hover': {
                                borderColor: '#2563EB'
                              }
                            }),
                            menu: (base) => ({
                              ...base,
                              borderRadius: '0.5rem',
                              overflow: 'hidden'
                            })
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Student-specific fields */}
                {userData.rol === "3" && (
                  <div className="space-y-6 border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900">Información de Estudiante</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        icon={FaIdCard}
                        label="Carnet"
                        name="carnet"
                        value={userData.carnet}
                        readOnly={true}
                      />

                      <InputField
                        icon={FaUser}
                        label="Asesor"
                        name="asesor"
                        value={userData.asesor || "Sin asignar"}
                        readOnly={true}
                      />

                      <InputField
                        icon={FaIdCard}
                        label="Estado"
                        name="estado"
                        value={userData.estado || "Sin estado"}
                        readOnly={true}
                      />

                      {/* Abandonar button */}
                      <div className="md:col-span-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (window.confirm(
                              "¿Está seguro/a que desea abandonar el proyecto? " +
                              "Esta acción cambiará su estado a 'retirado' y es permanente. " +
                              "No podrá revertir esta acción."
                            )) {
                              supabase
                                .from('Estudiante')
                                .update({ estado: 'retirado' })
                                .eq('estudiante_id', userData.estudiante_id)
                                .then(({ error }) => {
                                  if (error) {
                                    alert('Error al abandonar el proyecto: ' + error.message);
                                  } else {
                                    alert('Has abandonado el proyecto exitosamente.');
                                    setUserData({ ...userData, estado: 'retirado' });
                                  }
                                });
                            }
                          }}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          disabled={userData.estado === 'retirado'}
                        >
                          {userData.estado === 'retirado' ? 'Proyecto Abandonado' : 'Abandonar Proyecto'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
                <button
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`
                    w-full sm:w-auto px-6 py-2.5 
                    bg-azul text-white rounded-lg 
                    hover:bg-blue-700 
                    focus:outline-none focus:ring-2 focus:ring-azul focus:ring-offset-2 
                    transition-all duration-200
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default EditarPerfil;
