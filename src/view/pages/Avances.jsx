import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/HeaderProfesor';
import Footer from '../components/Footer';
import '../styles/Calendario.css';

const Avances = () => { 
  const { proyectoId } = useParams();
  const [avances, setAvances] = useState([{id: 1, numero: 1, estado: 'pendiente'}, {id: 2, numero: 2, estado: 'aprobado'}]);
  const [selectedEstado, setSelectedEstado] = useState('aprobado');

  const handleEstadoChange = async (avanceId, nuevoEstado) => {
    /*try {
      const { error } = await supabase
        .from('Avance')
        .update({ estado: nuevoEstado })
        .eq('id', avanceId);

      if (error) {
        console.error('Error updating Avance:', error);
        return;
      }

      setAvances(avances.map(avance => 
        avance.id === avanceId ? { ...avance, estado: nuevoEstado } : avance
      ));
    } catch (error) {
      console.error('Error:', error);
    }*/
  };

  const handleAgregarAvance = async () => {
    /*try {
      const { data: profesorData, error: profesorError } = await supabase
        .from('Profesor')
        .select('profesor_id')
        .eq('user_id', userId)
        .single();

      if (profesorError) {
        console.error('Error fetching Profesor:', profesorError);
        return;
      }

      const profesorId = profesorData.profesor_id;

      const { data: nuevoAvanceData, error: nuevoAvanceError } = await supabase
        .from('Avance')
        .insert({
          descripcion: nuevoAvance,
          estado: selectedEstado,
          profesor_id: profesorId,
          estudiante_id: null // Asegúrate de asignar el estudiante_id correcto
        })
        .single();

      if (nuevoAvanceError) {
        console.error('Error adding Avance:', nuevoAvanceError);
        return;
      }

      setAvances([...avances, nuevoAvanceData]);
      setNuevoAvance('');
      setSelectedEstado('aprobado');
    } catch (error) {
      console.error('Error:', error);
    }*/
  };

  return (
    <div className='flex flex-col min-h-screen'>
      <Header title="Avances de Estudiantes" />
      <div className="flex-grow container mx-auto p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Número</th>
                <th className="px-4 py-2 border-b">Estado</th>
                <th className="px-4 py-2 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {avances.map((avance, index) => (
                <tr key={avance.id} className="odd:bg-gray-100 even:bg-white">
                  <td className="px-4 py-2 border-b">{index + 1}</td>
                  <td className="px-4 py-2 border-b">{avance.estado}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                      onClick={() => handleEstadoChange(avance.id, 'aprobado')}
                    >
                      Aprobar
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleEstadoChange(avance.id, 'reprobado')}
                    >
                      Reprobar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Agregar Nuevo Avance</h3>
          <div className="mb-4">
            <select
              name="estado"
              className="w-full p-2 border border-gray-300 rounded"
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
            >
              <option value="aprobado">Aprobado</option>
              <option value="reprobado">Reprobado</option>
            </select>
          </div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleAgregarAvance}
          >
            Agregar Avance
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Avances;