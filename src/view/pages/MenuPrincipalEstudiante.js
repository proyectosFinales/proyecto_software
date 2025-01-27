import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SettingsEstudiante from '../components/SettingsEstudiante';
import supabase from '../../model/supabase';
import { successToast, errorToast } from '../components/toast';

const MenuEstudiante = () => {
  const [isAllowedToRate, setIsAllowedToRate] = useState(false);
  const [hasCalificado, setHasCalificado] = useState(false);
  const [isMenuOpenSettings, setIsMenuOpenSettings] = useState(false);
  const usuarioId = sessionStorage.getItem('token');

  useEffect(() => {
    const checkUserState = async () => {
      try {
        console.log("[MenuEstudiante] Verificando estado para usuario:", usuarioId);
        
        // Enhanced query to get more details
        const { data: estData, error: estError } = await supabase
          .from('Estudiante')
          .select(`
            id_usuario,
            estado,
            carnet,
            Usuario:Usuario!Estudiante_id_usuario_fkey (
              nombre,
              correo,
              telefono,
              sede
            ),
            Anteproyecto:Anteproyecto!Anteproyecto_estudiante_id_fkey (
              id,
              estado,
              titulo,
              fecha_creacion,
              empresa,
              profesor:Profesor (
                id,
                Usuario:Usuario (
                  nombre,
                  correo
                ),
                cantidad_estudiantes
              )
            )
          `)
          .eq('id_usuario', usuarioId)
          .single();

        if (estError) {
          console.error("[MenuEstudiante] Error DB:", estError);
          throw estError;
        }
        
        // Enhanced logging with more details
        console.log("[MenuEstudiante] 📋 Datos completos:", {
          estudiante: {
            id: estData?.id_usuario,
            carnet: estData?.carnet,
            estado: estData?.estado,
            nombre: estData?.Usuario?.nombre,
            correo: estData?.Usuario?.correo,
            telefono: estData?.Usuario?.telefono,
            sede: estData?.Usuario?.sede
          },
          anteproyecto: estData?.Anteproyecto ? {
            id: estData?.Anteproyecto?.id,
            titulo: estData?.Anteproyecto?.titulo,
            estado: estData?.Anteproyecto?.estado,
            fecha_creacion: estData?.Anteproyecto?.fecha_creacion,
            empresa: estData?.Anteproyecto?.empresa,
            profesor: estData?.Anteproyecto?.profesor ? {
              id: estData?.Anteproyecto?.profesor?.id,
              nombre: estData?.Anteproyecto?.profesor?.Usuario?.nombre,
              correo: estData?.Anteproyecto?.profesor?.Usuario?.correo,
              cantidad_estudiantes: estData?.Anteproyecto?.profesor?.cantidad_estudiantes
            } : "Sin profesor asignado"
          } : "Sin anteproyecto"
        });

        if (!estData) {
          console.log("[MenuEstudiante] ⚠️ No se encontró info de Estudiante.");
          setIsAllowedToRate(false);
          return;
        }

        const estadoEst = estData.estado?.toLowerCase();
        const estadoProyecto = estData.Anteproyecto?.estado?.toLowerCase();
        
        console.log("[MenuEstudiante] 📊 Estados actuales:", {
          estudiante: estadoEst,
          proyecto: estadoProyecto
        });

        const isEstudianteOk = (estadoEst === 'aprobado' || estadoEst === 'reprobado');
        const isProyectoOk = (estadoProyecto === 'aprobado' || estadoProyecto === 'reprobado');

        console.log("[MenuEstudiante] ✓ Verificación de estados:", {
          estudianteAptoParaCalificar: isEstudianteOk,
          proyectoAptoParaCalificar: isProyectoOk,
          razon: !isEstudianteOk ? "Estado estudiante no es aprobado/reprobado" :
                !isProyectoOk ? "Estado proyecto no es aprobado/reprobado" :
                "Ambos estados son correctos"
        });

        if (isEstudianteOk && isProyectoOk) {
          console.log("[MenuEstudiante] El estudiante y su proyecto están 'aprobado' o 'reprobado'. Revisa la calificación...");
          setIsAllowedToRate(true);
        } else {
          console.log("[MenuEstudiante] Ineligible para calificar. (Pero mostramos el botón igual).");
          setIsAllowedToRate(false);
        }
      } catch (err) {
        console.error("[MenuEstudiante] Error checking Estudiante:", err);
        setIsAllowedToRate(false);
      }
    };
    checkUserState();
  }, [usuarioId]);

  useEffect(() => {
    const checkIfAlreadyRated = async () => {
      try {
        const activeSemesterId = 1;
        console.log("[MenuEstudiante] Verificando si estudiante ya calificó al prof en el semestre:", activeSemesterId);

        const { data: califs, error } = await supabase
          .from('Calificacion')
          .select('*')
          .eq('estudiante_id', usuarioId)
          .eq('semestre_id', activeSemesterId);

        if (error) throw error;
        if (!califs || califs.length === 0) {
          console.log("[MenuEstudiante] Este estudiante NO ha registrado calificación aún para el semestre activo.");
          setHasCalificado(false);
          successToast("¡Aún no has calificado a tu profesor asesor para este semestre!");
        } else {
          console.log("[MenuEstudiante] Este estudiante SÍ tiene calificación registrada…", califs);
          setHasCalificado(true);
        }
      } catch (err) {
        console.error("[MenuEstudiante] Error buscando calificaciones del semestre:", err);
      }
    };
    checkIfAlreadyRated();
  }, [usuarioId]);

  const menuItems = [
    { to: "/anteproyectosEstudiante", icon: "fas fa-folder", text: "Anteproyectos" },
    { to: "/citas-estudiante", icon: "fas fa-clock", text: "Citas" },
    { to: "/bitacoras", icon: "fas fa-folder-open", text: "Bitácoras" },
    { to: "/calificar-asesor", icon: "fas fa-star", text: "Calificar Profesor Asesor" },
    { to: "/cartasEstudiante", icon: "fa-solid fa-envelope", text: "Solicitar Carta" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="h-20 bg-white flex justify-between items-center px-4 border-b-2 border-black shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Inicio</h1>
        <button
          onClick={() => setIsMenuOpenSettings(!isMenuOpenSettings)}
          className="text-xl"
        >
          <i className="fas fa-cog"></i>
        </button>
      </header>

      <SettingsEstudiante show={isMenuOpenSettings} setShow={setIsMenuOpenSettings} />

      <main className="flex-grow p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link 
              key={index}
              to={item.to} 
              className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <i className={`${item.icon} text-azul text-5xl mb-4`}></i>
              <p className="text-center text-gray-700 font-semibold text-lg">{item.text}</p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MenuEstudiante;
