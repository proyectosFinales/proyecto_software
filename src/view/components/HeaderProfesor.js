/*HeaderProfesor.js*/
import React, { useState, useEffect } from 'react';
import SidebarProfesor from './SidebarProfesor';
import SettingsProfesor from './SettingsProfesor';
import supabase from '../../model/supabase';

const HeaderProfesor = ({title}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuOpenSettings, setIsMenuOpenSettings] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');

  useEffect(() => {
    const fetchNombreUsuario = async () => {
      try {
        const userToken = sessionStorage.getItem('token');
        const { data, error } = await supabase
          .from('Usuario')
          .select('nombre')
          .eq('id', userToken)
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
  }, []);

  return (
    <div>
      <header className="h-20 bg-gray-300 text-black p-4 shadow-md flex items-center justify-center relative border-b border-black">
        <div className="flex items-center absolute left-5 gap-3">
          <button
            className="text-xl md:text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            &#9776;
          </button>
          <div className="flex flex-col gap-1">
            <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-semibold shadow-sm select-none">
              {nombreUsuario || 'Cargando...'}
            </span>
            <span className="bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs font-semibold shadow-sm select-none">
              Profesor
            </span>
          </div>
        </div>
        <h1 className="text-lg md:text-2xl font-bold">{title}</h1>
        <div className="flex items-center absolute right-5 gap-3">
          {/* Semestre y año actual */}
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
            className="text-xl"
            onClick={() => setIsMenuOpenSettings(!isMenuOpenSettings)}
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </header>
      <div>
        <SidebarProfesor show={isMenuOpen} setShow={setIsMenuOpen} />
        <SettingsProfesor show={isMenuOpenSettings} setShow={setIsMenuOpenSettings} />
      </div>
    </div>
  );
};

export default HeaderProfesor;