/**
 * pdfUtils.js
 * 
 * Funciones que generan y descargan archivos PDF
 * usando la librería jsPDF.
 */

import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

import autoTable from "jspdf-autotable";
import logoTec from '../view/PDFblueprints/logoTec.jpg';

/**
 * Genera un PDF con la información de un anteproyecto.
 * @param {Object} anteproyecto Objeto con la información necesaria.
 * Ejemplo esperado:
 * {
 *   nombreEmpresa: "Empresa XYZ",
 *   tipoEmpresa: "Manufactura",
 *   actividadEmpresa: "Producción de dispositivos",
 *   ...
 *   estudiante: {
 *     nombre: "Juan Pérez",
 *     carnet: "2019123456",
 *     telefono: "88888888",
 *     correo: "juan.perez@estudiantec.cr",
 *     sede: "Central Cartago"
 *   },
 *   ...
 * }
 */
export function descargarAnteproyecto(anteproyecto) {
  const doc = new jsPDF();

  // Obtener fecha actual
  const fechaActual = new Date();
  const dia = fechaActual.getDate();
  const mes = fechaActual.getMonth() + 1;
  const anio = fechaActual.getFullYear();
  const fechaFormateada = `${dia}/${mes}/${anio}`;

  // Título
  doc.setFontSize(18);
  doc.text('Información del Anteproyecto', 20, 20);

  // Posición inicial del texto
  let yPosition = 40;
  const lineSpacing = 10;

  // Ancho de la página y espacio disponible
  const pageWidth = doc.internal.pageSize.getWidth();
  const textWidth = pageWidth - 40; // Margen de 20px a cada lado
  const pageHeight = doc.internal.pageSize.getHeight();

  // Fecha en la esquina superior derecha
  doc.setFontSize(10);
  doc.text(`${fechaFormateada}`, textWidth, 10);

  /**
   * Añade texto dinámicamente, con salto de página si se supera el límite.
   * @param {string} label Etiqueta del campo
   * @param {string} value Contenido a imprimir
   */
  function addText(label, value) {
    if (value === undefined || value === null) {
      value = "No especificado";
    }
    
    const labelText = `${label} `;
    const textDividido = doc.splitTextToSize(value.toString() || "", textWidth);
    let requiredHeight = textDividido.length * lineSpacing;

    // Ajustar la altura para texto en varias líneas
    if (textDividido.length > 1) {
      requiredHeight = (textDividido.length * 5) + 5; 
    }

    // Verificar si hay espacio en la página actual
    if (yPosition + requiredHeight > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }

    // Etiqueta en negrita
    doc.setFont("Helvetica", "bold");
    doc.text(labelText, 20, yPosition);

    // Contenido en texto normal
    doc.setFont("Helvetica", "normal");
    doc.text(textDividido, 20, yPosition + 7);
    yPosition += requiredHeight + 10;
  }

  // Sección de datos del estudiante (si existe)
  doc.setFontSize(12);
  if (anteproyecto.Estudiante?.Usuario) {
    addText("Nombre del estudiante:", anteproyecto.Estudiante.Usuario.nombre);
    addText("Carnet:", anteproyecto.Estudiante.carnet);
    addText("Teléfono:", anteproyecto.Estudiante.Usuario.telefono);
    addText("Correo:", anteproyecto.Estudiante.Usuario.correo);
    addText("Sede:", anteproyecto.Estudiante.Usuario.sede);
  }

  // Sección de datos de la empresa
  if (anteproyecto.Empresa) {
    addText("Nombre de la Empresa:", anteproyecto.Empresa.nombre);
    addText("Tipo de Empresa:", anteproyecto.Empresa.tipo);
    addText("Actividad de la empresa:", anteproyecto.Empresa.actividad);
    addText("Ubicación de la empresa (distrito):", anteproyecto.Empresa.distrito);
    addText("Ubicación de la empresa (cantón):", anteproyecto.Empresa.canton);
    addText("Ubicación de la empresa (provincia):", anteproyecto.Empresa.provincia);
  }

  // Datos de contactos
  if (anteproyecto.AnteproyectoContacto?.[0]) {
    const contacto = anteproyecto.AnteproyectoContacto[0];
    if (contacto.ContactoEmpresa) {
      addText("Nombre del asesor industrial:", contacto.ContactoEmpresa.nombre);
      addText("Puesto que desempeña el asesor industrial:", contacto.ContactoEmpresa.departamento);
      addText("Teléfono del contacto:", contacto.ContactoEmpresa.telefono);
      addText("Correo del contacto:", contacto.ContactoEmpresa.correo);
    }
    if (contacto.RRHH) {
      addText("Nombre del contacto de recursos humanos:", contacto.RRHH.nombre);
      addText("Teléfono del contacto de recursos humanos:", contacto.RRHH.telefono);
      addText("Correo del contacto de recursos humanos:", contacto.RRHH.correo);
    }
  }

  // Datos de contenido del anteproyecto
  const correccionC = anteproyecto.Correcciones.find(c => c.seccion === 'Contexto');
  const correccionJ = anteproyecto.Correcciones.find(c => c.seccion === 'Justificacion');
  const correccionS = anteproyecto.Correcciones.find(c => c.seccion === 'Sintomas');
  const correccionI = anteproyecto.Correcciones.find(c => c.seccion === 'Impacto');
  addText("Contexto:", anteproyecto.contexto);
  doc.setTextColor(255, 0, 0);
  if (correccionC){
    addText("Correccion de contexto solicitada",correccionC.contenido);
  }
  doc.setTextColor(0, 0, 0);
  addText("Justificación del trabajo:", anteproyecto.justificacion);
  doc.setTextColor(255, 0, 0);
  if (correccionJ){
    addText("Correccion de justificación solicitada",correccionJ.contenido);
  }
  doc.setTextColor(0, 0, 0);
  addText("Síntomas principales:", anteproyecto.sintomas);
  doc.setTextColor(255, 0, 0);
  if (correccionS){
    addText("Correccion de síntomas solicitada",correccionS.contenido);
  }
  doc.setTextColor(0, 0, 0);
  addText("Efectos o impactos para la empresa:", anteproyecto.impacto);
  doc.setTextColor(255, 0, 0);
  if (correccionI){
    addText("Correccion efectos o impactos solicitada",correccionI.contenido);
  }
  doc.setTextColor(0, 0, 0);
  addText("Departamento para realizar el proyecto:", anteproyecto.departamento);
  addText("Tipo de proyecto:", anteproyecto.tipo);
  addText("Estado del proyecto:", anteproyecto.estado);
  addText("Categoría del proyecto:", anteproyecto.Categoria?.nombre || "Sin categoría");
  addText("Observaciones por el coordinador:", anteproyecto.comentario);

  // Descargar PDF (Nombre sugerido)
  const nombreArchivo = anteproyecto.Estudiante?.Usuario?.nombre || 'SinNombre';
  doc.save(`Anteproyecto_${nombreArchivo}.pdf`);
}

/**
 * Genera un PDF con la información de un "proyecto".
 * Dependiendo de tu estructura, podría ser muy similar a 'descargarAnteproyecto'.
 * @param {Object} proyecto Objeto con información de Proyecto 
 *                          (puede ser igual o similar a anteproyecto).
 */
export function descargarProyecto(proyecto) {
  const doc = new jsPDF();

  // Obtener fecha actual
  const fechaActual = new Date();
  const dia = fechaActual.getDate();
  const mes = fechaActual.getMonth() + 1;
  const anio = fechaActual.getFullYear();
  const fechaFormateada = `${dia}/${mes}/${anio}`;

  // Título
  doc.setFontSize(18);
  doc.text('Información del Proyecto', 20, 20);

  let yPosition = 40;
  const lineSpacing = 10;

  const pageWidth = doc.internal.pageSize.getWidth();
  const textWidth = pageWidth - 40;
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(10);
  doc.text(`${fechaFormateada}`, textWidth, 20);

  function addText(label, value) {
    const labelText = `${label} `;
    const textDividido = doc.splitTextToSize(value || "", textWidth);
    let requiredHeight = textDividido.length * lineSpacing;

    if (textDividido.length > 1) {
      requiredHeight = (textDividido.length * 5) + 5;
    }

    if (yPosition + requiredHeight > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont("Helvetica", "bold");
    doc.text(labelText, 20, yPosition);

    doc.setFont("Helvetica", "normal");
    doc.text(textDividido, 20, yPosition + 10);
    yPosition += requiredHeight + 10;
  }

  // Datos del estudiante (si existe)
  doc.setFontSize(12);
  if (proyecto.estudiante) {
    addText("Nombre del estudiante:", proyecto.estudiante.nombre);
    addText("Carnet:", proyecto.estudiante.carnet);
    addText("Teléfono:", proyecto.estudiante.telefono);
    addText("Correo:", proyecto.estudiante.correo);
    addText("Sede:", proyecto.estudiante.sede);
  }

  // Datos de la empresa (si existe)
  addText("Nombre de la Empresa:", proyecto.nombreEmpresa);
  addText("Tipo de Empresa:", proyecto.tipoEmpresa);
  addText("Actividad de la empresa:", proyecto.actividadEmpresa);
  addText("Ubicación de la empresa (distrito):", proyecto.distritoEmpresa);
  addText("Ubicación de la empresa (cantón):", proyecto.cantonEmpresa);
  addText("Ubicación de la empresa (provincia):", proyecto.provinciaEmpresa);

  // Datos de contactos
  addText("Nombre del asesor industrial:", proyecto.nombreAsesor);
  addText("Puesto que desempeña el asesor industrial:", proyecto.puestoAsesor);
  addText("Teléfono del contacto:", proyecto.telefonoContacto);
  addText("Correo del contacto:", proyecto.correoContacto);

  // Datos específicos del proyecto
  addText("Contexto:", proyecto.contexto);
  addText("Justificación:", proyecto.justificacion);
  addText("Síntomas principales:", proyecto.sintomas);
  addText("Impacto:", proyecto.impacto);
  addText("Departamento:", proyecto.nombreDepartamento);
  addText("Tipo de proyecto:", proyecto.tipoProyecto);
  addText("Estado actual:", proyecto.estado);

  doc.save(`Proyecto_${proyecto.nombreEmpresa || 'SinNombre'}.pdf`);
}

/**
 * Genera un PDF con la información de las bitácoras.
 * @param {Object} bitacorasYentradas Objeto con la información necesaria.
 * * @param {boolean} isProfe para saber quien es el que esta creando el pdf.
 * Ejemplo esperado:
 * [
 *  {
 *    Estudiante: {nombreUsuario: {nombre: ...} }
 *    Profesor: {nombreUsuario: {nombre: ...} }
 *    entradas:
 *      [
 *        {
 *            id: ...,
 *            bitacora_id: ...,
 *            falta.................
 *        }
 *      ]
 *  }
 * ]
 */
export function descargarBitacoras(bitacorasYentradas, isProfe) {
  const doc = new jsPDF();

  // Obtener fecha actual
  const fechaActual = new Date();
  const dia = fechaActual.getDate();
  const mes = fechaActual.getMonth() + 1;
  const anio = fechaActual.getFullYear();
  const fechaFormateada = `${dia}/${mes}/${anio}`;

  // Título
  doc.setFontSize(18);
  doc.text('Bitácoras', 20, 20);

  // Posición inicial del texto
  let yPosition = 40;
  const lineSpacing = 10;

  // Ancho de la página y espacio disponible
  const pageWidth = doc.internal.pageSize.getWidth();
  const textWidth = pageWidth - 40; // Margen de 20px a cada lado
  const pageHeight = doc.internal.pageSize.getHeight();

  // Fecha en la esquina superior derecha
  doc.setFontSize(10);
  doc.text(`${fechaFormateada}`, textWidth, 10);

  /**
   * Añade texto dinámicamente, con salto de página si se supera el límite.
   * @param {string} label Etiqueta del campo
   * @param {string} value Contenido a imprimir
   */
  function addText(label, value) {
    if (value === undefined || value === null) {
      value = "No especificado";
    }
    
    const labelText = `${label} `;
    const textDividido = doc.splitTextToSize(value.toString() || "", textWidth);
    let requiredHeight = textDividido.length * lineSpacing;

    // Ajustar la altura para texto en varias líneas
    if (textDividido.length > 1) {
      requiredHeight = (textDividido.length * 5) + 5; 
    }

    // Verificar si hay espacio en la página actual
    if (yPosition + requiredHeight > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }

    // Etiqueta en negrita
    doc.setFont("Helvetica", "bold");
    doc.text(labelText, 20, yPosition);

    // Contenido en texto normal
    doc.setFont("Helvetica", "normal");
    doc.text(textDividido, 20, yPosition + 7);
    yPosition += requiredHeight + 10;
  }

  // Sección de datos del estudiante (si existe)
  doc.setFontSize(12);

  if (bitacorasYentradas.length === 0) {
    alert('No hay bitácoras para generar el reporte');
    return;
  }

  for (let index = 0; index < bitacorasYentradas.length; index++) {
    addText(`${index+1}. Fecha Creación Bitácora`, bitacorasYentradas[index].fecha_creacion);
    addText('Estudiante', bitacorasYentradas[index].Estudiante.nombreUsuario.nombre);
    addText('Profesor', bitacorasYentradas[index].Profesor.nombreUsuario.nombre);
    addText('Fecha Creación Entrada', bitacorasYentradas[index].entradas[0]?.fecha || 'Bitácora sin entradas');
    addText('Estatus Profesor', bitacorasYentradas[index].entradas[0]
                                ?
                                bitacorasYentradas[index].entradas[0].aprobada_prof === false ? 'Pendiente' : 'Aprobada'
                                : 'Bitácora sin entradas');
    addText('Estatus Estudiante', bitacorasYentradas[index].entradas[0]
                                  ?
                                  bitacorasYentradas[index].entradas[0].aprobada_est === false ? 'Pendiente' : 'Aprobada'
                                  : 'Bitácora sin entradas');
    addText('Estatus', bitacorasYentradas[index].entradas[0]
                      ?
                      bitacorasYentradas[index].entradas[0].aprobada_est === true && bitacorasYentradas[index].entradas[0].aprobada_prof === true ? 'Aprobada' : 'Pendiente'
                      : 'Bitácora sin entradas');
    addText('Fecha Ultima Actualización', bitacorasYentradas[index].entradas[0]?.fecha || 'Bitácora sin entradas');
    addText('Puntos Analizados', bitacorasYentradas[index].entradas[0]?.contenido ? JSON.parse(bitacorasYentradas[index].entradas[0].contenido || "Mal parseado")[0] : 'Bitácora sin entradas');
    addText('Asuntos Pendientes', bitacorasYentradas[index].entradas[0]?.contenido ? JSON.parse(bitacorasYentradas[index].entradas[0].contenido || "Mal parseado")[1] : 'Bitácora sin entradas');
    addText('Observaciones', bitacorasYentradas[index].entradas[0]?.contenido ? JSON.parse(bitacorasYentradas[index].entradas[0].contenido || "Mal parseado")[2] : 'Bitácora sin entradas');
    addText(' ', ' ');
  }

  // Descargar PDF (Nombre sugerido)
  if (isProfe) {
    const nombreUser = `${bitacorasYentradas[0].Profesor.nombreUsuario.nombre}`;
    doc.save(`Bitacoras_${nombreUser}.pdf`);
  } else {
    const nombreUser = `${bitacorasYentradas[0].Estudiante.nombreUsuario.nombre}`;
    doc.save(`Bitacoras_${nombreUser}.pdf`);
  }
  
}

/**
 * Crea un excel con la informacion de todos los perfiles en la base de datos.
 * @param {*} dataEstudiantes todos los perfiles de los estudiantes.
 * @returns NA.
 */
export function descargarPerfilesEstudiantes(dataEstudiantes) {
  if (dataEstudiantes.length === 0) {
    alert('No hay perfiles de estudiantes para mostrar.');
    return;
  }

  const dataToExport = dataEstudiantes.map((e, index) => ({
    '': index + 1,
    'Nombre estudiante': e.Usuario.nombre,
    'Carnet': e.carnet,
    'Correo': e.Usuario.correo,
    'Teléfono': e.Usuario.telefono,
    'Sede': e.Usuario.sede,
    'Provincia': e.Usuario?.provincia || 'No actualizada',
    'Cantón': e.Usuario?.canton || 'No actualizado',
    'Distrito': e.Usuario?.distrito || 'No actualizado',
    'Estado del estudiante': e.estado,
    'Situación laboral': e?.situacion_laboral || 'No actualizado',
    'Año ingreso': e?.anio_ingreso || 'No actualizado',
    'Profesor asesor': e.Profesor?.Usuario.nombre || 'No asignado',
    'Semestre': e.Semestre.nombre,
    'Fecha inicio': e.Semestre.fecha_inicio,
    'Fecha finalización': e.Semestre.fecha_fin,
  })); 
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  //Ajustar ancho de columnas
  const columnWidths = Object.keys(dataToExport[0]).map(key => {
    const maxLength = Math.max(
      key.length,
      ...dataToExport.map(row => (row[key] ? row[key].toString().length : 0))
    );
    return { wch: maxLength + 2 };
  });
  worksheet['!cols'] = columnWidths;
  //Datos restantes
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes');
  XLSX.writeFile(workbook, 'Reporte_Estudiantes.xlsx');
};

/**
 * Crea un excel con la informacion de todos los perfiles en la base de datos.
 * @param {*} dataProfesores todos los perfiles de los profesores.
 * @returns NA.
 */
export function descargarPerfilesProfesores(dataProfesores) {
  if (dataProfesores.length === 0) {
    alert('No hay perfiles de profesores para mostrar.');
    return;
  }

  const dataToExport = dataProfesores.map((p, index) => ({
    '': index + 1,
    'Nombre profesor': p.Usuario.nombre,
    'Correo': p.Usuario.correo,
    'Teléfono': p.Usuario.telefono,
    'Sede': p.Usuario.sede,
    'Provincia': p.Usuario?.provincia || 'No actualizada',
    'Cantón': p.Usuario?.canton || 'No actualizado',
    'Distrito': p.Usuario?.distrito || 'No actualizado',
    'Estudiantes a asignar': p.cantidad_estudiantes,
    'Faltan de asignar': p.estudiantes_libres,
  })); 
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  //Ajustar ancho de columnas
  const columnWidths = Object.keys(dataToExport[0]).map(key => {
    const maxLength = Math.max(
      key.length,
      ...dataToExport.map(row => (row[key] ? row[key].toString().length : 0))
    );
    return { wch: maxLength + 2 };
  });
  worksheet['!cols'] = columnWidths;
  //Datos restantes
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Profesores');
  XLSX.writeFile(workbook, 'Reporte_Profesores.xlsx');
};

// Función auxiliar para generar header y footer en los PDFs
const generarHeaderFooterPDF = (doc, titulo) => {
  // Header
  try {
    // Esta imagen es usada en otros blueprints de PDF
    doc.addImage(logoTec, 'JPG', 10, 10, 25, 26);
  } catch (e) {
    console.error("Error al cargar imagen logoTec.jpg", e);
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Instituto Tecnológico de Costa Rica", 40, 18);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Reporte: " + titulo, 40, 24);
  doc.setLineWidth(0.5);
  doc.line(10, 40, doc.internal.pageSize.width - 10, 40);

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(10);
  doc.text(
    "Página " + pageCount,
    doc.internal.pageSize.width / 2,
    doc.internal.pageSize.height - 10,
    { align: "center" }
  );
};

// Generar PDF para el dashboard de avances
export const generarPDFDashboardAvances = (datosGrafico, tituloReporte) => {
  const doc = new jsPDF();
  generarHeaderFooterPDF(doc, tituloReporte);

  // Columnas para la tabla del PDF
  const columnas = ["Estado", "Cantidad"];
  // Mapear los datos del grafico (ej. [{ name: 'Aprobado', value: 10 }])
  const filas = datosGrafico.map(item => [item.name, item.value]);

  autoTable(doc, {
    startY: 50,
    head: [columnas],
    body: filas,
  });

  doc.save(`Reporte_Avances_Proyectos.pdf`);
};

// Generar PDF para el dashboard de estado de estudiantes
export const generarPDFDashboardEstudiantes = (datosGrafico, tituloReporte) => {
  const doc = new jsPDF();
  generarHeaderFooterPDF(doc, tituloReporte);

  // Columnas para la tabla del PDF
  const columnas = ["Estado", "Cantidad"];
  // Mapear los datos del grafico
  const filas = datosGrafico.map(item => [item.name, item.value]);

  autoTable(doc, {
    startY: 50,
    head: [columnas],
    body: filas,
  });

  doc.save(`Reporte_Estado_Estudiantes.pdf`);
};

export const generarPDFDashboardCalificaciones = (datosGrafico, tituloReporte) => {
  const doc = new jsPDF();
  generarHeaderFooterPDF(doc, tituloReporte);

  // Columnas para la tabla del PDF
  const columnas = ["Profesor", "Calificación Promedio"];
  // Mapear los datos del grafico
  const filas = datosGrafico.map(item => [item.name, item.value.toFixed(2)]);

  autoTable(doc, {
    startY: 50,
    head: [columnas],
    body: filas,
  });

  doc.save(`Reporte_Calificaciones_Profesores.pdf`);
};

/**
 * Mete toda la informacion de las empresas enun pdf.
 * @param {*} dataEmpresas informacion recibida de la BD con info de la empresa.
 * @returns No retorna nada, solo descarga el pdf con la informacion de las empresas.
 */
export function descargarEmpresas(dataEmpresas) {
  if (dataEmpresas.length === 0) {
    alert('No hay empresas para mostrar.');
    return;
  }

  const dataToExport = dataEmpresas.map((e, index) => ({
    '': index + 1,
    'Empresa': e.nombre,
    'Tipo': e.tipo,
    'Actividad': e.actividad,
    'Provincia': e.provincia,
    'Cantón': e.canton,
    'Distrito': e.distrito,
    'Cantidad de contactos': e.ContactoEmpresa.length,
  })); 
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  //Si hay texto muy grande, al tratar de ajustar las columnas el padding es muy grande tambien
  //por eso en este caso no se hace.
  //Datos restantes
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Empresas');
  XLSX.writeFile(workbook, 'Reporte_Empresas.xlsx');
};

/**
 * Genera y descarga el PDF con el reporte de los eventos existentes en el calendario.
 * @param {*} dataCalendario la coleccion con la info de los eventos.
 */
export const generarPDFCalendario = (dataCalendario) => {
  const doc = new jsPDF();

  generarHeaderFooterPDF(doc, 'Eventos del Calendario');

  // Columnas para la tabla del PDF
  const columnas = ["Nombre", "Fecha Inicio", "Fecha Fin"];

  const toUTF8 = (str) => {
  if (!str) return "";
    return String(str).normalize("NFC");
  };

  // Mapear los datos del grafico
  const filas = dataCalendario.map(item => [toUTF8(item.nombre), toUTF8(item.fechaInicio), toUTF8(item.fechaFin)]);

  autoTable(doc, {
    startY: 50,
    head: [columnas],
    body: filas,
  });

  doc.save(`Reporte_Calendario.pdf`);
};