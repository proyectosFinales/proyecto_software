import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../model/Cliente';
import styles from '../styles/CargarProfesores.module.css';
import Header from '../components/HeaderCoordinador';
import sendMail from '../../controller/Email';
import { AiOutlineInfoCircle } from 'react-icons/ai';

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
    const file = e.target.files[0]; // Obtenemos el archivo seleccionado
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
        Sede: row.Sede
      }));
  
      setExcelData(filteredData); // Guardamos los datos filtrados en el estado
    };
  
    reader.readAsBinaryString(file);
  };
  

  const subirDatos = async (e) => {
    e.preventDefault();
    const confirmAprobar = window.confirm("Los datos mostrados en el recuadro de abajo serán insertados en la base de datos y se enviará un correo a cada uno de los profesores con sus credenciales. \n¿Estás seguro de que deseas proceder?");

    if (!confirmAprobar) { return; }

    for (const row of excelData) {
        const dataToInsert = {
            nombre: row.Nombre,
            carnet: row.Carnet,
            correo: row.Correo,
            sede: row.Sede
        };

        // Verificación si ya existe el carnet
        const { data: existingUser, error: errorCheck } = await supabase
            .from('profesores')
            .select('carnet')
            .eq('carnet', dataToInsert.carnet);

        if (errorCheck) {
            alert('Error al verificar carnet:', errorCheck.message);
            continue;
        }

        if (existingUser && existingUser.length > 0) {
            console.log(`El carnet ${dataToInsert.carnet} ya existe. No se insertará este registro.`);
            continue;
        }

        const contraseña = generarContraseña();
        const mensaje = "Hola, su contraseña generada es: " + contraseña + 
        " y su usuario es su correo electrónico: " + dataToInsert.correo + ". Para acceder a la plataforma, "+
        "ingrese a https://proyectos.netlify.app/ y use el correo electrónico y la contraseña.\n"+
        "Para cualquier duda, escriba a bguzman@itcr.ac.cr y NO responda a este mensaje ya que es un correo automatizado.";

        // Insertar en la base de datos
        const { data: usuarioData, error: errorInsertUser } = await supabase
            .from('usuarios')
            .insert({
                correo: dataToInsert.correo,
                rol: '2',
                contraseña: contraseña,
                sede: dataToInsert.sede
            })
            .select('id') // Selecciona el ID del usuario insertado
            .single(); // Obtén solo el primer resultado (esperando un solo registro)

        if (errorInsertUser) {
            alert('Error al cargar datos en la tabla usuarios:', errorInsertUser.message);
            continue;
        }

        const usuarioId = usuarioData.id;

        
        const { error: errorInsertProf } = await supabase
          .from('profesores')
          .insert({
              nombre: dataToInsert.nombre,
              carnet: dataToInsert.carnet,
              id: usuarioId 
          });
        

        // Enviar correo si se insertó correctamente
        if (errorInsertProf) {
            alert('Error al cargar datos en la base de datos:', errorInsertProf.message);
        } else {
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
            <label htmlFor="file-upload">
            Seleccionar archivo
            </label>
        </button>
        <button className={styles.uploadButton} onClick={subirDatos}>
            <label>
            Cargar datos
            </label>
        </button>
        {infoVisible.formato && <p className={styles.infoText}>Seleccione una archivo excel que contenga las columnas: Nombre, Carnet, Correo y Sede.
          Puede contener más columnas pero solo se subiran los datos de las columnas solicitadas.</p>}
        <input
            type="file"
            id="file-upload"
            accept=".xlsx, .xls"
            className={{ display: 'none' }} // Escondemos el input real
            onChange={handleFileUpload}
        />

        {/* Tabla para mostrar los datos cargados */}
        <div className={styles.tableContainer}>
            <table className={styles.tabla_proyectos}>
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
