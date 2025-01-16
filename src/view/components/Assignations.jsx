import React from 'react';

const Assignations = () => {
  return (
    <div 
      className="
        flex 
        justify-center 
        items-center 
        gap-[50px]   /* If you want exactly 50px; or use gap-12 for ~48px */
        p-4          /* some padding if needed */
        flex-wrap    /* optional: wrap on small screens */
      "
    >
      <div className="text-center">
        {/* Icono de asignar profesores */}
        <i className="fas fa-user text-[48px] text-gray-600"></i>
        <p className="mt-2 text-base">Asignar profesores</p>
      </div>

      <div className="text-center">
        {/* Icono de asignar lectores */}
        <i className="fas fa-user text-[48px] text-gray-600"></i>
        <p className="mt-2 text-base">Asignar lectores</p>
      </div>
    </div>
  );
};

export default Assignations;
