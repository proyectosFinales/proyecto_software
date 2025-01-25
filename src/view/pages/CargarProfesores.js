/**
 * CargarDatos.jsx
 * Carga un Excel con datos de profesores (o usuarios) y los registra en la BD.
 */
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import supabase from '../../model/supabase';
import styles from '../styles/CargarProfesores.module.css';
import Header from '../components/HeaderCoordinador';
import sendMail from '../../controller/Email';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { generarContraseña, sendMailToNewUser, registroProfesor } from '../../controller/Signup';

/**
 * Nota: Ajusta si en tu BD no manejas 'carnet' en la tabla 'Profesor'.
 *       Igual para la columna 'telefono'. 
 */
const CargarDatos = () => {
  const [excelData, setExcelData] = useState([]);
  const [infoVisible, setInfoVisible] = useState({});

  const toggleInfo = (field) => {
    setInfoVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Función para procesar el archivo de Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });

      // Leer la primera hoja del archivo
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convertir la hoja de cálculo en un arreglo de objetos
      const sheetData = XLSX.utils.sheet_to_json(worksheet);

      // Filtrar solo las columnas que necesitamos
      const filteredData = sheetData.map(row => ({
        Nombre: row.Nombre,
        Correo: row.Correo,
        Sede: row.Sede,
        Telefono: row.Telefono
      }));

      setExcelData(filteredData);
    };

    reader.readAsBinaryString(file);
  };

  const subirDatos = async (e) => {
    e.preventDefault();
    const confirmAprobar = window.confirm(
      "Los datos mostrados abajo serán insertados en la base de datos y se enviará un correo a cada profesor con sus credenciales.\n¿Deseas continuar?"
    );
    if (!confirmAprobar) return;

    for (const row of excelData) {
      try {
        const contrasena = generarContraseña();
        await registroProfesor(
          row.Nombre,
          row.Correo,
          contrasena,
          row.Sede,
          row.Telefono // usaremos "numero" como teléfono
        );
        sendMailToNewUser(row.Correo, contrasena);
      } catch(error) {
        alert(`Error al insertar el profesor ${row.Correo}\n${error.message}`);
      }
    }
  };

  return (
    <div className={styles.container}>
      <Header title="Carga de datos"/>
      <div className={styles.datos_cargados}>
        <AiOutlineInfoCircle
          className={styles.infoIcon}
          onClick={() => toggleInfo('formato')}
          title="contexto_info"
        />
        <button className={styles.selectButton}>
          <label htmlFor="file-upload">Seleccionar archivo</label>
        </button>
        <button className={styles.uploadButton} onClick={subirDatos}>
          <label>Cargar datos</label>
        </button>
        {infoVisible.formato && (
          <p className={styles.infoText}>
            El archivo Excel debe tener las columnas: Nombre, Correo, Sede y Telefono. 
            Puede contener más columnas, pero solo se subirán esos datos solicitados.
          </p>
        )}

        <input
          type="file"
          id="file-upload"
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        {/* Tabla para mostrar los datos cargados */}
        <div className={styles.tableContainer}>
          <table className={styles.tabla_proyectos}>
            <thead>
              <tr>
                {excelData.length > 0 &&
                  Object.keys(excelData[0]).map((key) => <th key={key}>{key}</th>)}
              </tr>
            </thead>
            <tbody>
              {excelData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CargarDatos;
