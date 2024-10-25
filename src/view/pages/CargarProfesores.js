import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../model/Cliente';
import styles from '../styles/CargarProfesores.module.css';
import Header from '../components/HeaderCoordinador';
import sendMail from '../../controller/Email.js';

const CargarDatos = () => {
  const [excelData, setExcelData] = useState([]);

  function generarContraseña(longitud = 12) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let contraseña = '';
    for (let i = 0; i < longitud; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      contraseña += caracteres.charAt(indiceAleatorio);
    }
    return contraseña;
  }

  // Función para procesar el archivo de Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0]; // Obtenemos el archivo seleccionado
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });

      // Solo leeremos la primera hoja del archivo
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convertir la hoja de cálculo en un arreglo de objetos
      const sheetData = XLSX.utils.sheet_to_json(worksheet);
      setExcelData(sheetData); // Guardamos los datos en el estado

      // Aquí puedes enviar los datos a tu base de datos (ejemplo con Supabase)
      sheetData.forEach(async (row) => {

        const dataToInsert={
            nombre: row.Nombre,
            carnet: row.Carnet,
            correo: row.Correo,
            sede: row.Sede
        };

        const contraseña = generarContraseña();
        const mensaje="Hola, tu contraseña generada es: " + contraseña + 
        " y su usuarios es su correo electrónico: " + dataToInsert.correo;

/*         const { data, error } = await supabase
            .from('usuarios')
            .insert( {
                correo: dataToInsert.correo,
                rol:'2',
                contraseña: contraseña,
                sede: dataToInsert.sede
            }); */

        sendMail(dataToInsert.correo, "Credenciales", mensaje);

       /*  if (error) {
          console.error('Error al cargar datos en la base de datos:', error);
        }
 */
      });
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className={styles.container}>
      <Header title="Carga de datos"/>
      <div className={styles.datos_cargados}>
        <button className={styles.uploadButton}>
            <label htmlFor="file-upload">
            Cargar datos
            </label>
        </button>
        <input
            type="file"
            id="file-upload"
            accept=".xlsx, .xls"
            className={{ display: 'none' }} // Escondemos el input real
            onChange={handleFileUpload}
        />

        {/* Tabla para mostrar los datos cargados */}
        <div className={styles.tableContainer}>
            <table className={styles.table}>
            <thead>
                <tr>
                {/* Aquí puedes generar los encabezados dinámicamente según tus datos */}
                {excelData.length > 0 && Object.keys(excelData[0]).map((key) => (
                    <th key={key}>{key}</th>
                ))}
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
