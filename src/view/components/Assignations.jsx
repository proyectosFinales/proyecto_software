import React from 'react';
import { Users, UserPlus } from 'lucide-react';

const Assignations = () => {
  return (
    <div className="flex justify-center items-center gap-6 md:gap-12 p-4 md:p-6">
      <div className="flex flex-col items-center group cursor-pointer hover:opacity-80 transition-opacity">
        <div className="rounded-full bg-white p-4 shadow-md mb-2 md:mb-3">
          <Users 
            size={32} 
            className="text-gris_oscuro"
          />
        </div>
        <p className="text-sm md:text-base text-center text-gris_oscuro">
          Asignar profesores
        </p>
      </div>

      <div className="flex flex-col items-center group cursor-pointer hover:opacity-80 transition-opacity">
        <div className="rounded-full bg-white p-4 shadow-md mb-2 md:mb-3">
          <UserPlus 
            size={32} 
            className="text-gris_oscuro"
          />
        </div>
        <p className="text-sm md:text-base text-center text-gris_oscuro">
          Asignar lectores
        </p>
      </div>
    </div>
  );
};

export default Assignations;