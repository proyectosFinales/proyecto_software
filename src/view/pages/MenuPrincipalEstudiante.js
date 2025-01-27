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
        console.log("[MenuEstudiante] 1) Buscar Estudiante por userId:", usuarioId);
        const { data: estudianteRow, error: estError } = await supabase
          .from('Estudiante')
          .select('estudiante_id, estado')
          .eq('id_usuario', usuarioId)
          .single();

        if (estError) throw estError;
        if (!estudianteRow) {
          console.log("[MenuEstudiante] No se encontró Estudiante para este usuario");
          setIsAllowedToRate(false);
          return;
        }

        const estudianteID = estudianteRow.estudiante_id;
        const estadoEst = (estudianteRow.estado || "").toLowerCase();
        console.log("[MenuEstudiante] Estudiante:", estudianteID, "estado:", estadoEst);

        // 2) Buscar Proyectos que tengan este estudiante_id
        console.log("[MenuEstudiante] 2) Buscar Proyectos para estudiante:", estudianteID);
        const { data: proyectos, error: prError } = await supabase
          .from('Proyecto')
          .select('id, estado')
          .eq('estudiante_id', estudianteID);

        if (prError) throw prError;
        console.log("[MenuEstudiante] Proyectos del estudiante:", proyectos);

        // Revisa si alguno de esos proyectos está "aprobado" o "reprobado"
        const anyProyectoOk = proyectos.some(proy => {
          const state = (proy.estado || "").toLowerCase();
          return (state === "aprobado" || state === "reprobado");
        });

        const isEstudianteOk = (estadoEst === 'aprobado' || estadoEst === 'reprobado');
        console.log("[MenuEstudiante] isEstudianteOk?", isEstudianteOk, "anyProyectoOk?", anyProyectoOk);

        if (isEstudianteOk && anyProyectoOk) {
          console.log("[MenuEstudiante] Estudiante y al menos un Proyecto apto => Allowed to Rate");
          setIsAllowedToRate(true);
        } else {
          console.log("[MenuEstudiante] Estudiante/Proyecto no apto => setIsAllowedToRate(false)");
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
