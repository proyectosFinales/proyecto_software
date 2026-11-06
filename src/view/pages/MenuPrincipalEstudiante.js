import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SettingsEstudiante from '../components/SettingsEstudiante';
import supabase from '../../model/supabase';
import { obtenerProyectoEstudiante } from '../../controller/calificacionesController';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MenuEstudiante = () => {
  const [isMenuOpenSettings, setIsMenuOpenSettings] = useState(false);
  const user = JSON.parse(sessionStorage.getItem('USER'));
  const est = JSON.parse(sessionStorage.getItem('STUDENT'));

  useEffect(() => {
    const checkIfAlreadyRated = async () => {
      try {
        // Buscar proyecto mas reciente
        const proyectoApto = await obtenerProyectoEstudiante(est.estudiante_id);
        console.log("[CalificacionAsesor] Proyecto más reciente seleccionado.");
        if (!proyectoApto) {
          console.log("[CalificacionAsesor] Sin proyecto válido => isAllowed=false");
          return;
        }

        // Valida que el proyecto debe tener profesor asesor asignado, por lo que sin asesor el insert falla.
        if (!proyectoApto.profesor_id) {
          console.log("[CalificacionAsesor] Proyecto sin profesor asignado => avisar al estudiante");
          toast.error("Aún no tienes un profesor asesor asignado. No es posible calificar.");
          return;
        }

        console.log("[MenuEstudiante] Verificando si estudiante ya calificó al prof en el semestre");
        const { data: calif, error } = await supabase
          .from('Calificacion')
          .select(`id,
                  proyecto_id,
                  profesor_id,
                  estudiante_id`)
          .eq('proyecto_id', proyectoApto.id)
          .eq('estudiante_id', est.estudiante_id)
          .single();
        // Validar
        sessionStorage.setItem("hasCalificado", "false"); //antes del posible error, por cualquier cosa
        if (error){
          console.error("[MenuEstudiante] Error buscando calificaciones del semestre:", error.details);
          return;
        };

        if (!calif || calif.length === 0) {
          console.log("[MenuEstudiante] Este estudiante NO ha registrado calificación aún para el semestre.");
          toast.info("¡Aún no has calificado a tu profesor asesor para este semestre!");

        } else {
          console.log("[MenuEstudiante] Este estudiante SÍ tiene calificación registrada…");
          sessionStorage.setItem("hasCalificado", "true");
        }

      } catch (err) {
        console.error("[MenuEstudiante] Error buscando calificaciones del semestre:", err);
      }
    };
    checkIfAlreadyRated();
  }, [user.id]);

  const menuItems = [
    { to: "/anteproyectosEstudiante", icon: "fas fa-folder", text: "Anteproyectos" },
    { to: "/citas-estudiante", icon: "fas fa-clock", text: "Citas" },
    { to: "/bitacoras", icon: "fas fa-folder-open", text: "Bitácoras" },
    { to: "/calificar-asesor", icon: "fas fa-star", text: "Calificar Profesor Asesor" },
    { to: "/cartasEstudiante", icon: "fa-solid fa-envelope", text: "Solicitar Carta" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="h-20 bg-white flex items-center justify-center relative px-4 border-b-2 border-black shadow-sm">
        <div className="flex flex-col items-start absolute left-5 gap-1">
          <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-semibold shadow-sm select-none">
            {user.nombre || 'Cargando...'}
          </span>
          <span className="bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs font-semibold shadow-sm select-none">
            Estudiante
          </span>
        </div>
        <h1 className="text-lg md:text-2xl font-bold text-gray-800">Inicio</h1>
        <div className="flex items-center absolute right-5 gap-3">
          <span className="bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs font-semibold shadow-sm select-none">
            {(() => {
              const fecha = new Date();
              const anoActual = fecha.getFullYear();
              const mes = fecha.getMonth() + 1;
              const semestreActual = mes <= 7 ? 1 : 2;
              return `Semestre ${semestreActual} - ${anoActual}`;
            })()}
          </span>
          <button
            onClick={() => setIsMenuOpenSettings(!isMenuOpenSettings)}
            className="text-xl"
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>
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
