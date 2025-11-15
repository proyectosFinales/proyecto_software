// ==================== CriterioTecnico.js ====================
// Componente (formulario) para generar la Carta de Criterio Técnico (REQ-49)

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import supabase from '../../../model/supabase';
import { generateCriterioTecnicoPDF } from '../../PDFblueprints/CriterioTecnicoPDF';
import styles from '../../styles/FormularioCoordinador.module.css';
import HeaderProfesor from '../../components/HeaderProfesor';
import Footer from '../../components/Footer';

const CriterioTecnico = () => {
  const [proyecto, setProyecto] = useState(null);
  const [anteproyecto, setAnteproyecto] = useState(null);
  const [estudiante, setEstudiante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // --- Estados del Formulario ---
  const [criterioTecnico, setCriterioTecnico] = useState('');
  const [tribunal1, setTribunal1] = useState('');
  const [tribunal2, setTribunal2] = useState('');

  const getQueryParam = (param) => {
    return new URLSearchParams(location.search).get(param);
  };

  // 1. Cargar datos básicos del proyecto
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const proyectoId = getQueryParam('id');
      if (!proyectoId) {
        setLoading(false);
        setMensaje('Error: No se proporcionó un ID de proyecto.');
        return;
      }

      const { data: projData, error } = await supabase
        .from('Proyecto')
        .select(`
          id,
          profesor_id,
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
      setLoading(false);
    };

    fetchData();
  }, [location]);

  // 2. Función para guardar el registro del acta (incluyendo el criterio)
  const handleGuardarActa = async (datosPDF) => {
    try {
      const { data, error } = await supabase
        .from('Acta')
        .insert([
          {
            estudiante_id: estudiante?.estudiante_id,
            profesor_id: proyecto?.profesor_id, // ID del profesor que lo genera
            titulo: 'Carta de Criterio Técnico',
            datos: datosPDF, // Guardamos TODO el JSON, incluido el criterio
            machote: 'CriterioTecnico', // Identificador de la plantilla
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

    if (!criterioTecnico || !tribunal1 || !tribunal2) {
        setMensaje('Error: Debe completar todos los campos del tribunal y el criterio.');
        return;
    }

    const datosPDF = {
      studentName: estudiante?.Usuario?.nombre || 'N/A',
      studentCarnet: estudiante?.carnet || 'N/A',
      projectName: anteproyecto?.tipo || 'Proyecto sin título',
      criterioTecnico: criterioTecnico, // Dato del formulario
      tribunal1: tribunal1,           // Dato del formulario
      tribunal2: tribunal2,           // Dato del formulario
    };

    // Guardar el registro en la base de datos
    const guardado = await handleGuardarActa(datosPDF);

    if (guardado) {
      // Generar el PDF
      generateCriterioTecnicoPDF(datosPDF);
      setMensaje('PDF generado y registro guardado exitosamente.');
      setTimeout(() => navigate('/actas'), 2000); // Regresar al menú de actas
    } else {
      setMensaje('Error: No se pudo guardar el registro del acta.');
    }
  };

  if (loading) return <div className="p-8">Cargando datos del proyecto...</div>;
  if (mensaje && !loading && !criterioTecnico) return <div className="p-8">{mensaje}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <HeaderProfesor title="Generar Carta de Criterio Técnico" />
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-6">
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-4">Datos del Criterio Técnico (REQ-49)</h2>
          
          <p className="mb-4">Este formulario genera el documento oficial del tribunal evaluador. (Usado para 'dar de baja a un estudiante' según mejoras)</p>

          {/* Datos informativos */}
          <div className={styles.formGroup}>
            <label>Estudiante</label>
            <div>{estudiante?.Usuario?.nombre}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Proyecto</label>
            <div>{anteproyecto?.tipo}</div>
          </div>
          
          <hr style={{ margin: '20px 0' }} />

          {/* Campos del formulario */}
          <div className={styles.formGroup}>
            <label htmlFor="tribunal1">Nombre Tribunal 1 (Profesor)</label>
            <input
              type="text"
              id="tribunal1"
              value={tribunal1}
              onChange={(e) => setTribunal1(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="tribunal2">Nombre Tribunal 2 (Profesor)</label>
            <input
              type="text"
              id="tribunal2"
              value={tribunal2}
              onChange={(e) => setTribunal2(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="criterio">Criterio Técnico (Justificación)</label>
            <textarea
              id="criterio"
              rows="8"
              value={criterioTecnico}
              onChange={(e) => setCriterioTecnico(e.target.value)}
              placeholder="Escriba aquí la justificación detallada del tribunal evaluador..."
              required
            ></textarea>
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
            Guardar Criterio y Generar PDF
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

export default CriterioTecnico;