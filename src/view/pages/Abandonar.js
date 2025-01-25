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
    if (!confirmReprobar) return;

    try {
      const { error } = await supabase
        .from('Anteproyecto')
        .update({ estado: "Retirado" })
        .eq('estudiante_id', sessionStorage.getItem('token'))
        .eq('semestre_id', 1);

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
    <div className="flex flex-col min-h-screen bg-white">
      <Header title="Darse de baja" />
      <main className="flex-grow w-full max-w-3xl mx-auto p-4 space-y-6">
        <div className="bg-red-50 p-4 rounded shadow">
          <h3 className="text-xl font-bold mb-2">Advertencia</h3>
          <p className="mb-3">
            Al presionar el botón "Darse de baja" usted estará abandonando el proyecto de graduación
            de la escuela de producción industrial para el semestre actual. Esta acción no se puede
            deshacer y debe ser tomada con precaución. Al darse de baja su perfil NO será eliminado 
            y su anteproyecto/proyecto se conservarán en el sistema con el estado "Retirado". 
            La próxima vez que desee cursar el proyecto deberá crear uno nuevo.
          </p>
          <p>
            Si no está seguro de lo que está haciendo, no haga clic en el botón "Darse de baja" y abandone
            esta sección con el botón "Volver" o el menú lateral.
          </p>
        </div>
        <div className="flex justify-around">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={abandonarProyecto}
          >
            Darse de baja
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate('/menuEstudiante')}
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
