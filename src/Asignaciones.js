import React from 'react';
import Header from './pages/components/Header';
import Assignations from './pages/components/Assignations';
import './Asignacion.css';

function Asignacion() {
  return (
    <div className="Asig">
      <Header />
      <main>
        <Assignations />
      </main>
      <footer>
        <p>Instituto Tecnológico de Costa Rica 2024</p>
      </footer>
    </div>
  );
}

export default Asignacion;
