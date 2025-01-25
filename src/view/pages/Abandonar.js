/**
 * DarseDeBaja.jsx
 * Permite que un Estudiante cambie su anteproyecto/proyecto a estado "Retirado".
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderEstudiante';

const DarseDeBaja = () => {
  const navigate = useNavigate();

  async function abandonarProyecto(e) {
    e.preventDefault();
    const confirmReprobar = window.confirm(
      "¿Está seguro/a que quiere DARSE DE BAJA del anteproyecto/proyecto?"
    );
    if(!confirmReprobar) return;

    try {
      const { error } = await supabase
        .from('Anteproyecto')               // Cambia 'anteproyectos' -> 'Anteproyecto'
        .update({ estado: "Retirado" })     // Asegúrate de que "Retirado" existe en tu enum
        .eq('estudiante_id', sessionStorage.getItem('token')) // Cambia 'idEstudiante' -> 'estudiante_id'
        .eq('semestre_id', 1);             // si usas 'semestre_id'; ajusta si no usas semestre
      if (error) {
        alert('Error al retirar anteproyecto/proyecto: ' + error.message);
        return;
      }

      alert('Anteproyecto/proyecto retirado exitosamente');
      navigate('/menuEstudiante');
    } catch (error) {
      alert('Error al retirar anteproyecto/proyecto: ' + error);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex flex-col items-center justify-center flex-grow p-6">
        <div className="bg-gray-200 p-6 rounded-md max-w-2xl text-justify mb-6 shadow">
          <h3 className="text-2xl font-bold mb-2 text-center">¿Estás seguro?</h3>
          <p className="mb-4">
            Esta acción dará de baja tu anteproyecto/proyecto. 
            Asegúrate de leer y comprender todas las implicaciones.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={abandonarProyecto}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
          >
            Darse de baja
          </button>
          <button
            onClick={() => navigate('/menuEstudiante')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            Volver
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DarseDeBaja;
