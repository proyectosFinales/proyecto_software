/**
 * Empresas.jsx
 * Muestra las empresas actualmente registradas en el sistema.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AnteproyectosCoordinador.module.css';
import { supabase } from '../../model/Cliente';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import styles2 from '../styles/table.module.css';

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    consultarEmpresas();
  }, []);

  async function crearEmpresa() {
    navigate('/formularioEmpresa');
  }

  async function consultarEmpresas() {
    try {
      const { data, error } = await supabase
        .from('Empresa')
        .select(`
          id,
          nombre,
          tipo,
          provincia,
          canton,
          distrito,
          ContactoEmpresa:contactoempresa_empresa_id_fkey (
            id         
          )
        `);
      if (error) {
        alert('No se pudieron obtener las empresas. ' + error.message);
        return;
      }
      setEmpresas(data || []);
    } catch (error) {
      alert('Error al consultar empresas: ' + error);
    }
  }

  function editarEmpresa(id) {
    navigate(`/editarEmpresa?id=${id}`);
  }

  function verContactos(id) {
    navigate(`/contactos?id=${id}`);
  }

  async function eliminarEmpresa(id,count) {
      const confirmarEnvio = window.confirm(
        "¿Está seguro que desea eliminar esta empresa?"
      );
      if (!confirmarEnvio) return;
  
      if (count !== 0) {
        alert("No se puede eliminar una empresa con contactos existentes.");
        return;
      }
  
      try {
        const { error } = await supabase
          .from('Empresa')
          .delete()
          .eq('id', id);
        if (error) {
          alert('Error al eliminar anteproyecto: ' + error.message);
          return;
        }
  
        setEmpresas((prev) => prev.filter((ap) => ap.id !== id));
        alert(`La empresa fue borrada exitosamente.`);
      } catch (error) {
        alert('Error al eliminar empresa:' + error);
      }
    }

  return (
    <div className={styles.anteproyectos_coordinador_contenedor}>
      <Header title="Empresas" />
      <div>
        <main className={styles.lista_anteproyectos_coordinador}>
          <button
            className={styles.generar_reporte}
            onClick={() => crearEmpresa()}
          >
            Crear empresa
          </button>
          <div className={styles.contenedor_tabla}>
            <table className={styles2.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Provincia</th>
                  <th>Cantón</th>
                  <th>Distrito</th>
                  <th>Cantidad de contactos</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((empresa) => (
                  <tr key={empresa.id}>
                    <td>{empresa.nombre}</td>
                    <td>{empresa.tipo}</td>
                    <td>{empresa.provincia}</td>
                    <td>{empresa.canton}</td>
                    <td>{empresa.distrito}</td>
                    <td>{empresa.ContactoEmpresa.length}</td>
                    <td>
                      <div className={styles.contenedor_botones_anteproyectos_coordinador}>
                        <button
                          onClick={() => verContactos(empresa.id)}
                          className={`${styles.btn} ${styles.revisar}`}
                        >
                          Contactos
                        </button>
                        <button
                          onClick={() => editarEmpresa(empresa.id)}
                          className={`${styles.btn} ${styles.revisar}`}
                        >
                          Editar
                        </button>
                        
                        <button
                          onClick={() =>
                            eliminarEmpresa(empresa.id,empresa.ContactoEmpresa.length)
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

export default Empresas;
