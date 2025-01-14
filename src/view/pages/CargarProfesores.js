/**
 * CargarDatos.jsx
 * Carga un Excel con datos de profesores (o usuarios) y los registra en la BD.
 */
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../model/Cliente';
import styles from '../styles/CargarProfesores.module.css';
import Header from '../components/HeaderCoordinador';
import sendMail from '../../controller/Email';
import { AiOutlineInfoCircle } from 'react-icons/ai';

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
        Carnet: row.Carnet,
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
      const dataToInsert = {
        nombre: row.Nombre,
        carnet: row.Carnet,
        correo: row.Correo,
        sede: row.Sede,
        telefono: row.Telefono
      };

      // Verificación si ya existe un profesor con ese 'carnet'
      const { data: existingProf, error: errorCheck } = await supabase
        .from('Profesor') // En tu nueva BD
        .select('carnet')
        .eq('carnet', dataToInsert.carnet);

      if (errorCheck) {
        alert('Error al verificar carnet: ' + errorCheck.message);
        continue;
      }
      if (existingProf && existingProf.length > 0) {
        alert(`El carnet ${dataToInsert.carnet} ya existe. No se insertará este registro.`);
        continue;
      }

      // Generar contraseña aleatoria
      const contraseña = generarContraseña();
      const mensaje = 
        "Hola, su contraseña generada es: " + contraseña + 
        " y su usuario es su correo electrónico: " + dataToInsert.correo + 
        ". Para acceder a la plataforma, ingrese a ... y use el correo y la contraseña.\n" +
        "No responda a este mensaje ya que es un correo automatizado.";

      // 1. Insertar en la tabla Usuario
      const { data: usuarioData, error: errorInsertUser } = await supabase
        .from('Usuario')
        .insert({
          correo: dataToInsert.correo,
          rol: 2,                       // 2 => Profesor
          contrasena: contraseña,
          sede: dataToInsert.sede
        })
        .select('id')
        .single();

      if (errorInsertUser) {
        alert('Error al cargar datos en la tabla Usuario: ' + errorInsertUser.message);
        continue;
      }

      const usuarioId = usuarioData.id;

      // 2. Insertar en la tabla Profesor
      //    Cambiamos 'id' => 'id_usuario'
      const { error: errorInsertProf } = await supabase
        .from('Profesor')
        .insert({
          nombre: dataToInsert.nombre,
          carnet: dataToInsert.carnet,    // si tu BD lo maneja
          id_usuario: usuarioId,         // clave FK a Usuario
          // si tienes 'telefono' en Profesor, agrégalo:
          telefono: dataToInsert.telefono || ''
        });

      if (errorInsertProf) {
        alert('Error al cargar datos en la tabla Profesor: ' + errorInsertProf.message);
      } else {
        // Enviar correo si todo salió bien
        sendMail(dataToInsert.correo, "Credenciales", mensaje);
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
            El archivo Excel debe tener las columnas: Nombre, Carnet, Correo, Sede y Telefono. 
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
