/**
 * CargarDatos.jsx
 * Carga un Excel con datos de profesores (o usuarios) y los registra en la BD.
 */
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import supabase from '../../model/supabase';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import sendMail from '../../controller/Email';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { generarContraseña, sendMailToNewUser, registroProfesor } from '../../controller/Signup';

/**
 * Nota: Ajusta si en tu BD no manejas 'carnet' en la tabla 'Profesor'.
 *       Igual para la columna 'telefono'. 
 */
const CargarProfesores = () => {
  console.log('CargarProfesores component mounted');

  const [excelData, setExcelData] = useState([]);
  const [infoVisible, setInfoVisible] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('CargarProfesores: useEffect running');
    try {
      // Initial setup
      setIsLoading(false);
    } catch (error) {
      console.error('CargarProfesores: Error in useEffect:', error);
      setIsLoading(false);
    }
    return () => {
      console.log('CargarProfesores: Component unmounting');
    };
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const toggleInfo = (field) => {
    setInfoVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      // Con la primera fila como encabezados
      const headers = data[0];
      const rows = data.slice(1);
      const jsonData = rows.map((row) => {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index] || '';
        });
        return rowData;
      });

      setExcelData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    try {
      // For each row in excelData, register a professor
      for (const row of excelData) {
        const fullName = row['Nombre'] || '';
        const carnet = row['Carnet'] || '';
        const telefono = row['Telefono'] || '';
        const email = row['Email'] || '';

        // Generate random password
        const password = generarContraseña();

        // Create the professor in DB
        await registroProfesor(fullName, carnet, telefono, email, password, 'Cartago');

        // Send email with the credentials
        sendMailToNewUser(email, password);
      }

      alert('Profesores registrados correctamente.');
    } catch (error) {
      console.error('Error al registrarlos en la BD: ', error);
      alert('Error al registrar los datos: ' + error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {console.log('CargarProfesores: Rendering JSX')}
      <Header title="Cargar Profesores" />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Info Section */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <h2 className="text-xl font-bold mr-2">Formato del Excel</h2>
              <AiOutlineInfoCircle 
                className="text-blue-500 cursor-pointer"
                onClick={() => toggleInfo('format')}
              />
            </div>
            {infoVisible.format && (
              <div className="text-gray-600 bg-blue-50 p-4 rounded-lg">
                <p>El archivo Excel debe contener las siguientes columnas:</p>
                <ul className="list-disc ml-5 mt-2">
                  <li>Nombre (nombre completo del profesor)</li>
                  <li>Email (correo electrónico institucional)</li>
                  <li>Telefono (número de teléfono)</li>
                  <li>Carnet (identificación del profesor)</li>
                </ul>
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFile}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100 text-gray-600"
            />
            <button
              onClick={handleUpload}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg
                       hover:bg-blue-700 transition-colors duration-200"
            >
              Cargar Profesores
            </button>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            {excelData.length > 0 && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(excelData[0]).map((key) => (
                      <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {excelData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((cell, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CargarProfesores;
