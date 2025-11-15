// ==================== CartaPreliminar.js ====================
// Componente (formulario) para generar la Carta de Informe Preliminar (REQ-48)

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import supabase from '../../../model/supabase';
import Proyecto from '../../../controller/Proyecto'; // Para obtener datos
import { generateInformePreliminarPDF } from '../../PDFblueprints/InformePreliminarPDF';
import styles from '../../styles/FormularioCoordinador.module.css'; // Reutilizamos estilos
import HeaderProfesor from '../../components/HeaderProfesor';
import Footer from '../../components/Footer';

const CartaPreliminar = () => {
  const [proyecto, setProyecto] = useState(null);
  const [anteproyecto, setAnteproyecto] = useState(null);
  const [estudiante, setEstudiante] = useState(null);
  const [profesor, setProfesor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Obtenemos el ID del proyecto desde la URL (ej: /actas/carta-preliminar?id=...)
  const getQueryParam = (param) => {
    return new URLSearchParams(location.search).get(param);
  };

  // 1. Cargar los datos necesarios del proyecto
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const proyectoId = getQueryParam('id');
      if (!proyectoId) {
        setLoading(false);
        setMensaje('Error: No se proporcionó un ID de proyecto.');
        return;
      }

      // Consulta para obtener todos los datos necesarios
      const { data: projData, error } = await supabase
        .from('Proyecto')
        .select(`
          id,
          profesor_id,
          Profesor:profesor_id ( Usuario:id_usuario ( nombre ) ),
          Estudiante:estudiante_id ( carnet, Usuario:id_usuario ( nombre ) ),
          Anteproyecto:anteproyecto_id ( tipo )
        `)
        .eq('id', proyectoId)
        .single();

      if (error || !projData) {
        setMensaje('Error al cargar los datos del proyecto.');
        setLoading(false);
        return;
      }

      setProyecto(projData);
      setAnteproyecto(projData.Anteproyecto);
      setEstudiante(projData.Estudiante);
      setProfesor(projData.Profesor);
      setLoading(false);
    };

    fetchData();
  }, [location]);

  // 2. Función para guardar el registro del acta en la BD
  const handleGuardarActa = async (datosPDF) => {
    try {
      const { data, error } = await supabase
        .from('Acta')
        .insert([
          {
            estudiante_id: estudiante?.estudiante_id, // Asumiendo que se carga
            profesor_id: profesor?.profesor_id,
            titulo: 'Carta de Aprobación de Informe Preliminar',
            datos: datosPDF, // Guardamos los datos usados para generar el PDF
            machote: 'InformePreliminar', // Identificador de la plantilla
          },
        ]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al guardar el acta:', error);
      return false;
    }
  };

  // 3. Función principal del botón "Generar PDF"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Generando PDF...');

    const datosPDF = {
      studentName: estudiante?.Usuario?.nombre || 'N/A',
      studentCarnet: estudiante?.carnet || 'N/A',
      projectName: anteproyecto?.tipo || 'Proyecto sin título', // El ERS indica 'tipo'
      profesorName: profesor?.Usuario?.nombre || 'N/A',
    };

    // Guardar el registro en la base de datos
    const guardado = await handleGuardarActa(datosPDF);

    if (guardado) {
      // Generar el PDF
      generateInformePreliminarPDF(datosPDF);
      setMensaje('PDF generado y registro guardado exitosamente.');
      setTimeout(() => navigate('/actas'), 2000); // Regresar al menú de actas
    } else {
      setMensaje('Error: No se pudo guardar el registro del acta.');
    }
  };

  if (loading) return <div className="p-8">Cargando datos del proyecto...</div>;
  if (mensaje && !loading) return <div className="p-8">{mensaje}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <HeaderProfesor title="Generar Carta de Informe Preliminar" />
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-6">
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-4">Confirmar Generación de Carta</h2>
          
          <p className="mb-4">Se generará la carta de aprobación de informe preliminar para el siguiente proyecto:</p>

          <div className={styles.formGroup}>
            <label>Estudiante</label>
            <div>{estudiante?.Usuario?.nombre}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Proyecto</label>
            <div>{anteproyecto?.tipo}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Profesor Asesor</label>
            <div>{profesor?.Usuario?.nombre}</div>
          </div>

          <button 
            type="submit" 
            style={{
              backgroundColor: '#1d4ed8',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              marginTop: '1rem'
            }}
          >
            Generar PDF y Guardar Registro
          </button>
          
          {mensaje && (
            <div style={{ marginTop: '1rem', color: mensaje.includes('Error') ? 'red' : 'green', fontWeight: 'bold' }}>
              {mensaje}
            </div>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CartaPreliminar;