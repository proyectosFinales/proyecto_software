/**
 * AnteproyectosEstudiante.jsx
 * Muestra los anteproyectos creados por el estudiante logueado (sessionStorage).
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AnteproyectosEstudiante.module.css';
import { supabase } from '../../model/Cliente';
import Footer from '../components/Footer';
import HeaderEstudiante from '../components/HeaderEstudiante';
import { descargarAnteproyecto } from '../../controller/DescargarPDF';
import styles2 from '../styles/table.module.css';

const CartasEstudiante = () => {
  const [cartas, setCartas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    consultarAnteproyectos();
  }, []);

  async function consultarInfoEstudiante() {
    try {
      const userToken = sessionStorage.getItem('token');
      const { data, error } = await supabase
        .from('Usuario')
        .select(`
          Estudiante:Estudiante!Estudiante_id_usuario_fkey (
            estudiante_id,
            carnet
          )
        `)
        .eq('id', userToken)
        .single();
      if (error) throw error;
      if (!data) {
        return;
      }
      return data.Estudiante[0].estudiante_id;
    } catch (error) {
      alert('Error al buscar estudiante' + error);
    }
  }

  async function crearCarta() {
    try {
      const studentID = await consultarInfoEstudiante();
      const { data, error } = await supabase
        .from('SolicitudCarta')
        .select(`
          id_solicitud
        `)
        .eq('id_estudiante', studentID);
      if (error) {
        alert('No se pudieron obtener las cartas. ' + error.message);
        return;
      }
      if(data.length != 0){
        alert("Ya tiene una carta solicitada");
      }
      else{
        navigate('/formularioCarta');
      }
    } catch (error) {
      alert('Error al consultar cartas: ' + error);
    }
  }

  async function consultarAnteproyectos() {
    try {
      const studentID = await consultarInfoEstudiante();
      const { data, error } = await supabase
        .from('SolicitudCarta')
        .select(`
          id_solicitud,
          id_estudiante,
          nombre_receptor,
          puesto_receptor,
          empresa,
          genero_emisor,
          genero_receptor,
          apellidos_receptor,
          cedula,
          idioma
        `)
        .eq('id_estudiante', studentID);
      if (error) {
        alert('No se pudieron obtener las cartas. ' + error.message);
        return;
      }
      setCartas(data || []);
    } catch (error) {
      alert('Error al consultar anteproyectos: ' + error);
    }
  }

  function editarAnteproyecto(id) {
    navigate(`/editarFormulario?id=${id}`);
  }

  // Función para eliminar anteproyectos (solo si Pendiente o Reprobado)
  async function eliminarCarta(id) {
    const confirmarEnvio = window.confirm(
      "¿Está seguro que desea eliminar esta carta?"
    );
    if (!confirmarEnvio) return;

    try {
      const { error } = await supabase
        .from('SolicitudCarta')
        .delete()
        .eq('id_solicitud', id);
      if (error) {
        alert('Error al eliminar carta: ' + error.message);
        return;
      }

      setCartas((prev) => prev.filter((ap) => ap.id !== id));
      console.log(`La carta fue eliminada exitosamente.`);
    } catch (error) {
      alert('Error al eliminar carta:' + error);
    }
  }

  return (
    <div className={styles.contenedor_anteproyectos_estudiante}>
      <HeaderEstudiante title="Solicitud de cartas para empresa" />
      <div>
        <main className={styles.lista_anteproyectos_estudiante}>
          <button
            className={styles.crear_anteproyecto}
            onClick={() => crearCarta()}
          >
            Solicitar Carta
          </button>
          <div className={styles.contenedor_tabla}>
            <table className={styles2.table}>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Receptor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartas.map((carta) => (
                  <tr key={carta.id_solicitud}>
                    <td>{carta.empresa}</td>
                    <td>{carta.nombre_receptor} {carta.apellidos_receptor}</td>
                    <td>
                      <div className={styles.carta}>
                        <button
                          onClick={() => descargarAnteproyecto(carta)}
                          className={`${styles.btn} ${styles.descargar}`}
                        >
                          Descargar
                        </button>
                        <button
                          onClick={() =>
                            eliminarCarta(carta.id_solicitud)
                          }
                          className={`${styles.btn} ${styles.eliminar}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CartasEstudiante;
