import React from 'react';
import Header from '../components/Header';
import MenuAsignaciones from '../components/Assignations';
import '../styles/Asignacion.css';

function Asignacion() {
  return (
    <div className="Asig">
      <Header />
      <main>
        <MenuAsignaciones />
      </main>
      <footer>
        <p>Instituto Tecnológico de Costa Rica 2024</p>
      </footer>
    </div>
  );
}

export default Asignacion;
