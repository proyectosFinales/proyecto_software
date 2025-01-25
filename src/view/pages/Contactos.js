/**
 * Empresas.jsx
 * Muestra las empresas actualmente registradas en el sistema.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/AnteproyectosCoordinador.module.css';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import styles2 from '../styles/table.module.css';

const Empresas = () => {
  const [contactos, setContactos] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const getQueryParam = (param) => {
    const params = new URLSearchParams(location.search);
    return params.get(param);
  };

  useEffect(() => {
    const id = getQueryParam('id');
    if (id) {
      consultarContactos(id);
    }
  }, [location]);

  async function crearContacto() {
    const id = getQueryParam('id')
    navigate(`/crearContacto?id=${id}`);
  }

  async function consultarContactos(id) {
    try {
      const { data, error } = await supabase
        .from('ContactoEmpresa')
        .select(`
          id,
          nombre,
          empresa_id,
          departamento,
          correo,
          telefono,
          AnteproyectoContacto:anteproyectocontacto_contacto_id_fkey (
            id
          ),
          RecursosHumanos:AnteproyectoContacto_rrhh_id_fkey (
            id
          )
        `)
        .eq("empresa_id",id);
      if (error) {
        alert('No se pudieron obtener los contactos. ' + error.message);
        return;
      }
      setContactos(data || []);
    } catch (error) {
      alert('Error al consultar contactos: ' + error);
    }
  }

  function editarContacto(id) {
    navigate(`/editarContacto?id=${id}`);
  }

  async function eliminarContacto(id,count) {
      const confirmarEnvio = window.confirm(
        "¿Está seguro que desea eliminar este contacto?"
      );
      if (!confirmarEnvio) return;
  
      if (count !== 0) {
        alert("No se puede eliminar un contacto afiliado a algún anteproyecto.");
        return;
      }
      try {
        const { error } = await supabase
          .from('ContactoEmpresa')
          .delete()
          .eq('id', id);
        if (error) {
          alert('Error al eliminar contacto: ' + error.message);
          return;
        }
  
        setContactos((prev) => prev.filter((ap) => ap.id !== id));
        alert(`El contacto fue borrado exitosamente.`);
      } catch (error) {
        alert('Error al eliminar contacto:' + error);
      }
    }

  return (
    <div className={styles.anteproyectos_coordinador_contenedor}>
      <Header title="Contactos" />
      <div>
        <main className={styles.lista_anteproyectos_coordinador}>
          <button
            className={styles.generar_reporte}
            onClick={() => crearContacto()}
          >
            Crear Contacto
          </button>
          <div className={styles.contenedor_tabla}>
            <table className={styles2.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Puesto</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Proyectos asesorados</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {contactos.map((contacto) => (
                  <tr key={contacto.id}>
                    <td>{contacto.nombre}</td>
                    <td>{contacto.departamento}</td>
                    <td>{contacto.correo}</td>
                    <td>{contacto.telefono}</td>
                    <td>{(contacto.AnteproyectoContacto.length)+(contacto.RecursosHumanos.length)}</td>
                    <td>
                      <div className={styles.contenedor_botones_anteproyectos_coordinador}>
                        <button
                          onClick={() => editarContacto(contacto.id,contacto.empresa_id)}
                          className={`${styles.btn} ${styles.revisar}`}
                        >
                          Editar
                        </button>
                        
                        <button
                          onClick={() =>
                            eliminarContacto(contacto.id,((contacto.AnteproyectoContacto.length)+(contacto.RecursosHumanos.length)))
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
