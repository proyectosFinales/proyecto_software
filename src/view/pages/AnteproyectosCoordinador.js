import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { descargarAnteproyecto } from '../../controller/DescargarPDF';
import { errorToast } from '../components/toast';
import * as XLSX from 'xlsx';

const AnteproyectosCoordinador = () => {
  const [anteproyectos, setAnteproyectos] = useState([]);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const handleRevisar = (id) => {
    navigate('/formulario-coordinador?id=' + id);
  };

  useEffect(() => {
    const fetchAnteproyectos = async () => {
      const { data, error } = await supabase
        .from('Anteproyecto')
        .select(`
          id,
          empresa_id,
          contexto,
          justificacion,
          sintomas,
          estado,
          impacto,
          tipo,
          comentario,
          estudiante_id,
          actividad,
          departamento,
          Estudiante!anteproyecto_estudiante_id_fkey (
            estudiante_id,
            carnet,
            id_usuario,
            Usuario!Estudiante_id_usuario_fkey (
              nombre,
              correo,
              telefono,
              sede
            )
          ),
          Empresa!anteproyecto_empresa_id_fkey (
            nombre,
            tipo,
            provincia,
            canton,
            distrito
          )
        `);
      console.log(data);
      if (error) {
        alert('No se pudieron obtener los anteproyectos. ' + error.message);
        return;
      }
      if (error) {
        errorToast('No se pudieron obtener los anteproyectos');
      } else {
        setAnteproyectos(data || []);
      }
    };
    fetchAnteproyectos();
  }, []);

  const handleGenerateReport = () => {
    if (anteproyectos.length === 0) {
      alert('No hay anteproyectos para generar el reporte');
      return;
    }

    const dataToExport = anteproyectos.map((proyecto) => ({
      ID: proyecto.id,
      'Nombre del Estudiante': proyecto.Estudiante?.nombre || 'N/A',
      'Estado del proyecto': proyecto.estado,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Anteproyectos');
    XLSX.writeFile(workbook, 'Reporte_Anteproyectos.xlsx');
  };

  const cambiarEstado = async (anteproyecto) => {
    try {
      const { error } = await supabase
        .from('Anteproyecto')
        .update({ estado: 'Pendiente' })
        .eq('id', anteproyecto.id);

      if (error) {
        alert('No se pudo cambiar el estado del anteproyecto. ' + error.message);
      } else {
        setAnteproyectos((prev) =>
          prev.map((item) =>
            item.id === anteproyecto.id
              ? { ...item, estado: 'Pendiente' }
              : item
          )
        );
        alert('Estado del anteproyecto cambiado exitosamente.');
      }
    } catch (err) {
      console.error('Error cambiando el estado:', err);
      alert('Ocurrió un error al intentar cambiar el estado.');
    }
  };

  const filteredAnteproyectos = anteproyectos.filter((anteproyecto) => {
    const lowerSearchText = searchText.toLowerCase();

    return Object.values(anteproyecto).some((value) => {
      if (typeof value === 'object' && value !== null) {
        // Si es un objeto, revisamos sus valores
        return Object.values(value).some((subValue) =>
          String(subValue).toLowerCase().includes(lowerSearchText)
        );
      }
      // Si no es un objeto, revisamos el valor directamente
      return String(value).toLowerCase().includes(lowerSearchText);
    });
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Anteproyectos" />
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto bg-white p-4 rounded shadow">
          {/* Search bar */}
          <input
            type="text"
            placeholder="Buscar anteproyecto..."
            className="border border-gray-300 rounded px-3 py-2 mb-4 w-full"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          {/* Table replaced old .lista_anteproyectos_coordinador styling */}
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200 border-b">
                <th className="p-2 border-r text-left">Nombre</th>
                <th className="p-2 border-r text-left">Empresa</th>
                <th className="p-2 border-r text-left">Estado</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnteproyectos.map((anteproyecto) => (
                <tr key={anteproyecto.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 border-r">{anteproyecto.Estudiante.Usuario.nombre}</td>
                  <td className="p-2 border-r">{anteproyecto.Empresa.nombre}</td>
                  <td className="p-2 border-r">{anteproyecto.estado}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleRevisar(anteproyecto.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                      >
                        Revisar
                      </button>
                      <button
                        onClick={() => descargarAnteproyecto(anteproyecto)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      >
                        Descargar
                      </button>
                      {(anteproyecto.estado !== "Pendiente" && anteproyecto.estado !== "Correccion") && (
                        <button
                          onClick={() => cambiarEstado(anteproyecto)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Pendiente
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AnteproyectosCoordinador;
