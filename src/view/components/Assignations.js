import React from 'react';
import './Assignations.css'; // Añadir estilos específicos para la sección de asignaciones

const Assignations = () => {
  return (
    <div className="assignations">
      <div className="assign-icon">
        <i className="fas fa-user"></i> {/* Icono de asignar profesores */}
        <p>Asignar profesores</p>
      </div>
      <div className="assign-icon">
        <i className="fas fa-user"></i> {/* Icono de asignar lectores */}
        <p>Asignar lectores</p>
      </div>
    </div>
  );
};

export default Assignations;
