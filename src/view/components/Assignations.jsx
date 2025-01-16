import React from 'react';
import { Laptop, FileText } from 'lucide-react';

const MenuAsignaciones = () => {
  const buttonClasses = `
    w-full
    max-w-sm
    aspect-auto
    md:aspect-square
    flex
    flex-col
    items-center
    justify-center
    p-4
    md:p-8
    rounded-lg
    bg-white/10
    hover:bg-white/30
    hover:-translate-y-2
    hover:shadow-lg
    active:translate-y-0
    active:shadow-md
    transition-all
    duration-300
    ease-in-out
    transform
    cursor-pointer
    group
  `;

  // Increase icon size here
  const iconClasses = `
    text-azul
    w-32
    h-32
    md:w-64
    md:h-64
    mb-4
    md:mb-8
    group-hover:scale-110
    transition-transform
    duration-300
    ease-in-out
  `;

  const textClasses = `
    text-xl
    md:text-3xl
    text-azul
    text-center
    font-semibold
    group-hover:scale-105
    transition-transform
    duration-300
    ease-in-out
  `;

  return (
    <div className="min-h-screen bg-gris_claro">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-gris_claro shadow-md">
        <button className="text-azul hover:scale-110 transition-transform duration-200">
          <div className="space-y-1">
            <div className="w-6 h-0.5 bg-azul"></div>
            <div className="w-6 h-0.5 bg-azul"></div>
            <div className="w-6 h-0.5 bg-azul"></div>
          </div>
        </button>
        <h1 className="text-2xl font-bold text-azul">Menú de asignaciones</h1>
        <div className="w-6"></div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 w-full max-w-6xl mx-auto">
          {/* Automatic Assignment Button */}
          <button
            className={buttonClasses}
            onClick={() => console.log('Automatic assignment clicked')}
          >
            <Laptop className={iconClasses} />
            <span className={textClasses}>Asignación automática</span>
          </button>

          {/* Manual Assignment Button */}
          <button
            className={buttonClasses}
            onClick={() => console.log('Manual assignment clicked')}
          >
            <FileText className={iconClasses} />
            <span className={textClasses}>Asignación manual y Reporte</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default MenuAsignaciones;
