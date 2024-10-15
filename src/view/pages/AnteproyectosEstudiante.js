import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AnteproyectosEstudiante.module.css'; // Cambiado a módulo CSS
import { supabase } from '../../model/Cliente';

const AnteproyectosEstudiante = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anteproyectos, setAnteproyectos] = useState([]);

  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    consultarAnteproyectos();
  }, []);

  async function consultarAnteproyectos() {
    try {
      const { data, error } = await supabase.from('anteproyectos').select('*');
      if (error) {
        console.error('Error al consultar anteproyectos:', error);
        return;
      }
      setAnteproyectos(data);
    } catch (error) {
      console.error('Error al consultar anteproyectos:', error);
    }
  }

  return (
    <div className={styles.contenedor_anteproyectos_estudiante}>
      <header>
        <div className={styles.header}>
          <button className={styles.menuIcon} onClick={toggleMenu}>
            &#9776;
          </button>
          <h1>Anteproyectos</h1>
        </div>
      </header>

      <div className={styles.contenedor_menu_lateral}>
        {isMenuOpen && (
          <nav className={styles.sidebar}>
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

        <main className={styles.lista_anteproyectos_estudiante}>
          <button className={styles.crear_anteproyecto} onClick={() => navigate('/formulario-estudiantes')}>
            Crear anteproyecto
          </button>
          <table className={styles.tabla_anteproyectos_estudiante}>
            <thead>
              <tr>
                <th>Anteproyectos creados</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {anteproyectos.map((anteproyecto) => (
                <tr key={anteproyecto.id}>
                  <td>{anteproyecto.nombreEmpresa}</td>
                  <td>
                    <div className={styles.contenedor_botones_anteproyectos_estudiante}>
                      <button onClick={() => console.log(`Editando ${anteproyecto.id}`)} className={styles.btn + ' ' + styles.editar}>
                        Editar
                      </button>
                      <button onClick={() => console.log(`Descargando ${anteproyecto.id}`)} className={styles.btn + ' ' + styles.descargar}>
                        Descargar
                      </button>
                      <button onClick={() => console.log(`Eliminando ${anteproyecto.id}`)} className={styles.btn + ' ' + styles.eliminar}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>

      <footer>
        <p>Instituto Tecnológico de Costa Rica 2024</p>
      </footer>
    </div>
  );
};

export default AnteproyectosEstudiante;
