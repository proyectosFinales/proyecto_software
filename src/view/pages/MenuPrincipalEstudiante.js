import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SettingsEstudiante from '../components/SettingsEstudiante';
import supabase from '../../model/supabase';
import { successToast } from '../components/toast';

const MenuEstudiante = () => {
  const [hasCalificado, setHasCalificado] = useState(false);
  const [isMenuOpenSettings, setIsMenuOpenSettings] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const usuarioId = sessionStorage.getItem('token');

  useEffect(() => {
    const fetchNombreUsuario = async () => {
      try {
        const { data, error } = await supabase
          .from('Usuario')
          .select('nombre')
          .eq('id', usuarioId)
          .single();
        if (error) throw error;
        if (data) {
          setNombreUsuario(data.nombre);
        }
      } catch (error) {
        console.error('Error al obtener nombre de usuario:', error);
      }
    };
    fetchNombreUsuario();
  }, [usuarioId]);

  useEffect(() => {
    const checkIfAlreadyRated = async () => {
      try {
        const { data: estudianteRow, error: estError } = await supabase
          .from('Estudiante')
          .select('estudiante_id')
          .eq('id_usuario', usuarioId)
          .single();

        if (estError) throw estError;
        if (!estudianteRow) {
          console.log("[MenuEstudiante] No se encontró Estudiante para este usuario");
          setHasCalificado(false);
          return;
        }

        const estudianteID = estudianteRow.estudiante_id;
        const activeSemesterId = 1;
        console.log("[MenuEstudiante] Verificando si estudiante ya calificó al prof en el semestre:", activeSemesterId);

        const { data: califs, error } = await supabase
          .from('Calificacion')
          .select('*')
          .eq('estudiante_id', estudianteID)
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
      <header className="h-20 bg-white flex items-center justify-center relative px-4 border-b-2 border-black shadow-sm">
        <div className="flex flex-col items-start absolute left-5 gap-1">
          <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-semibold shadow-sm select-none">
            {nombreUsuario || 'Cargando...'}
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
