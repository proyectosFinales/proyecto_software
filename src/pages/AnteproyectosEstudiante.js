import React, { useState } from 'react';
import '../styles/AnteproyectosEstudiante.css';

const AnteproyectosEstudiante = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anteproyectos, setAnteproyectos] = useState([
    { id: 1, name: "Deutch Center for management" },
    { id: 2, name: "Otro anteproyecto" }
  ]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEdit = (id) => {
    console.log(`Editando anteproyecto con id ${id}`);
    // Lógica para editar
  };

  const handleDownload = (id) => {
    console.log(`Descargando anteproyecto con id ${id}`);
    // Lógica para descargar
  };

  const handleDelete = (id) => {
    setAnteproyectos(anteproyectos.filter(proyecto => proyecto.id !== id));
    console.log(`Eliminando anteproyecto con id ${id}`);
  };

  return (
    <div className="app-container">
      <header>
        <div className="header">
          <button className="menu-icon" onClick={toggleMenu}>
            &#9776;
          </button>
          <h1>Anteproyectos</h1>
          <button className="settings-icon">&#9881;</button>
        </div>
      </header>
      
      <div className="content">
        {/* Menú lateral */}
        {isMenuOpen && (
          <nav className="sidebar">
            <ul>
              <li>Inicio</li>
              <li>Anteproyectos</li>
              <li>Proyectos</li>
              <li>Asignaciones</li>
              <li>Cargar datos</li>
              <li>Citas</li>
              <li>Gestionar perfiles</li>
              <li>Modificar Información</li>
            </ul>
          </nav>
        )}
        
        <main>
          <div className="project-list">
            <button className="create-project">Crear anteproyecto</button>
            <table className="project-table">
              <thead>
                <tr>
                  <th>Anteproyectos creados</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {anteproyectos.map((proyecto) => (
                  <tr key={proyecto.id}>
                    <td>{proyecto.name}</td>
                    <td>
                      <button onClick={() => handleEdit(proyecto.id)} className="btn edit">Editar</button>
                      <button onClick={() => handleDownload(proyecto.id)} className="btn download">Descargar</button>
                      <button onClick={() => handleDelete(proyecto.id)} className="btn delete">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      
      <footer>
        <p>Instituto Tecnológico de Costa Rica 2024</p>
      </footer>
    </div>
  );
};

export default AnteproyectosEstudiante;
