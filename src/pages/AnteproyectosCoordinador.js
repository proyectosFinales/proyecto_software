import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import '../styles/AnteproyectosCoordinador.css';

const AnteproyectosCoordinador = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anteproyectos, setAnteproyectos] = useState([
    { id: 1, name: "Deutch Center for management Deutch Center for management Deutch Center for management", studentName: "Ana Victoria Castro"},
    { id: 2, name: "Otro anteproyecto", studentName: "Otro estudiante" }
  ]);

  const navigate = useNavigate(); // Hook para redireccionar

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleRevisar = (id) => {
    navigate('/formulario-coordinador')
    // Lógica para editar
  };

  const handleReporte = (id) => {
    console.log(`Descargando anteproyecto con id ${id}`);
    // Lógica para descargar
  };

  const handleCreateProject = () => {
    navigate('/formulario-estudiantes'); // Redirecciona a la página de creación de anteproyectos
  };

  return (
    <div className="app-container">
      <header>
        <div className="header">
          <button className="menu-icon" onClick={toggleMenu}>
            &#9776;
          </button>
          <h1>Anteproyectos</h1>
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
            <button className="create-project" onClick={handleCreateProject}>Generar reporte de anteproyectos</button>
            <table className="project-table">
              <thead>
                <tr>
                  <th>Estudiantes</th>
                  <th>Propuesta de proyecto</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {anteproyectos.map((proyecto) => (
                  <tr key={proyecto.id}>
                    <td>{proyecto.studentName}</td>
                    <td>{proyecto.name}</td>
                    <td>
                        <div className="button-container">
                            <button onClick={() => handleRevisar(proyecto.id)} className="btn revisar">Revisar</button>
                            <button onClick={() => handleReporte(proyecto.id)} className="btn reporte">Reporte</button>
                        </div>
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

export default AnteproyectosCoordinador;
