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
          comentario,
          Estudiante:estudiante_id (
            carnet,
            id_usuario,
            Usuario:id_usuario (
              nombre,
              correo,
              telefono,
              sede
            )
          ),
          Empresa:empresa_id (
            nombre,
            tipo,
            provincia,
            canton,
            distrito
          ),
          AnteproyectoContacto:anteproyectocontacto_anteproyecto_id_fkey (
            ContactoEmpresa:contacto_id(
              nombre,
              correo,
              departamento,
              telefono
            ),
            RRHH:rrhh_id(
              nombre,
              correo,
              telefono
            )
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
    <div className="flex flex-col min-h-screen bg-white">
      <Header title="Anteproyectos" />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6">
        {/* Search bar */}
        <input
          type="text"
          className="w-full border border-gray-300 rounded py-2 px-4 mb-4"
          placeholder="Buscar anteproyectos..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* Table container */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left border-b border-gray-300">Nombre</th>
                <th className="px-3 py-2 text-left border-b border-gray-300">Estado</th>
                <th className="px-3 py-2 text-left border-b border-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnteproyectos.map((anteproyecto) => (
                <tr key={anteproyecto.id} className="border-b border-gray-200">
                  <td className="px-3 py-2">{anteproyecto.Estudiante.Usuario.nombre}</td>
                  <td className="px-3 py-2">{anteproyecto.estado}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => navigate('/formulario-coordinador?id=' + anteproyecto.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Revisar
                      </button>
                      <button
                        onClick={() => descargarAnteproyecto(anteproyecto)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Descargar
                      </button>
                      {(anteproyecto.estado !== "Pendiente" && anteproyecto.estado !== "Correccion") && (
                      <button
                        onClick={() => {cambiarEstado(anteproyecto)}}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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
