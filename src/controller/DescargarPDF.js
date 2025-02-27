/**
 * pdfUtils.js
 * 
 * Funciones que generan y descargan archivos PDF
 * usando la librería jsPDF.
 */

import jsPDF from 'jspdf';

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
    doc.text(textDividido, 20, yPosition + 10);
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
  addText("Contexto:", anteproyecto.contexto);
  addText("Justificación del trabajo:", anteproyecto.justificacion);
  addText("Síntomas principales:", anteproyecto.sintomas);
  addText("Efectos o impactos para la empresa:", anteproyecto.impacto);
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
