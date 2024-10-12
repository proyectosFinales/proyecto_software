import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import '../styles/AnteproyectosEstudiante.css';
import { supabase } from '../../model/Cliente';

const AnteproyectosEstudiante = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anteproyectos, setAnteproyectos] = useState([]);

  const navigate = useNavigate(); // Hook para redireccionar

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    consultarAnteproyectos(); // Llamada a la función para consultar anteproyectos
  }, []);

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

  const handleCreateProject = () => {
    navigate('/formulario-estudiantes'); // Redirecciona a la página de creación de anteproyectos
  };

  async function consultarAnteproyectos() {
    try {
      const { data, error } = await supabase
        .from('anteproyectos')
        .select('*');

      if (error) {
        console.error('Error al consultar anteproyectos 1:', error);
        return;
      }

      setAnteproyectos(data);
    } catch (error) {
      console.error('Error al consultar anteproyectos 2:', error);
    }
  }

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
            <button className="create-project" onClick={handleCreateProject}>Crear anteproyecto</button>
            <table className="project-table">
              <thead>
                <tr>
                  <th>Anteproyectos creados</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {anteproyectos.map((anteproyecto) => (
                  <tr key={anteproyecto.id}>
                    <td>{anteproyecto.nombre}</td>
                    <td>
                        <div className="button-container">
                            <button onClick={() => handleEdit(anteproyecto.id)} className="btn edit">Editar</button>
                            <button onClick={() => handleDownload(anteproyecto.id)} className="btn download">Descargar</button>
                            <button onClick={() => handleDelete(anteproyecto.id)} className="btn delete">Eliminar</button>
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

export default AnteproyectosEstudiante;
