// Assignations.jsx
import React from 'react';

const Assignations = () => {
  return (
    <div
      className="
        flex flex-col
        sm:flex-row               /* horizontal on small screens and up */
        justify-center 
        items-center 
        gap-12                    /* roughly ~48px gap, similar to 50px */
        p-8                       /* spacing around the container */
      "
    >
      <div className="text-center">
        <i className="fas fa-user text-4xl text-gray-600" /> 
        <p className="mt-2 text-base">Asignar profesores</p>
      </div>
      <div className="text-center">
        <i className="fas fa-user text-4xl text-gray-600" /> 
        <p className="mt-2 text-base">Asignar lectores</p>
      </div>
    </div>
  );
};

export default Assignations;
