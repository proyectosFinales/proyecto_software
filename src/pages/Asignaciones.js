import React from 'react';
import Header from './components/Header';
import Assignations from './components/Assignations';
import '../styles/Asignacion.css';

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
