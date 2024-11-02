import jsPDF from 'jspdf';

export function descargarAnteproyecto(anteproyecto) {
  const doc = new jsPDF();

  // Obtener la fecha actual
  const fechaActual = new Date();

  // Formatear la fecha en formato corto (DD/MM/AAAA)
  const dia = fechaActual.getDate();
  const mes = fechaActual.getMonth() + 1; // Los meses empiezan en 0
  const año = fechaActual.getFullYear();
  const fechaFormateada = `${dia}/${mes}/${año}`;

  // Título
  doc.setFontSize(18);
  doc.text('Información del Anteproyecto', 20, 20);

  let yPosition = 40;
  const lineSpacing = 10;

  const pageWidth = doc.internal.pageSize.getWidth(); 
  const textWidth = pageWidth - 40; // Ancho disponible (20 de margen a cada lado)
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(10);
  doc.text(`${fechaFormateada}`, textWidth, 20);

  // Función para añadir texto de manera dinámica, manejando el espacio vertical
  function addText(label, value) {
    const labelText = `${label} `;
    const text = value;
    
    const labelWidth = doc.getTextWidth(labelText);
    const textDividido = doc.splitTextToSize(text, textWidth); // Dividir el texto para ajustarse al ancho
    let requiredHeight = textDividido.length * lineSpacing; // Calcular altura necesaria para este texto

    if(textDividido.length > 1){
      requiredHeight = (textDividido.length * 5) + 5; 
    }

    // Verificar si hay espacio suficiente en la página actual
    if (yPosition + requiredHeight > pageHeight - 20) { // Deja un margen de 20 px al final de la página
      doc.addPage(); // Agregar nueva página
      yPosition = 20; // Reiniciar la posición Y en la nueva página
    }

    // Añadir texto con la etiqueta en negrita
    doc.setFont("Helvetica", "bold");
    doc.text(labelText, 20, yPosition);

    // Imprimir el texto en la posición actual
    doc.setFont("Helvetica", "normal");
    doc.text(textDividido, 20, yPosition + 10);
    yPosition += requiredHeight + 10; 
  }

  // Información del anteproyecto
  doc.setFontSize(12);
  addText("Nombre del estudiante:", anteproyecto.estudiantes.nombre);
  addText("Carnet:", anteproyecto.estudiantes.carnet);
  addText("Teléfono:", anteproyecto.estudiantes.telefono);
  addText("Correo:", anteproyecto.estudiantes.correo);
  addText("Sede:", anteproyecto.sede);
  addText("Nombre de la Empresa:", anteproyecto.nombreEmpresa);
  addText("Tipo de Empresa:", anteproyecto.tipoEmpresa);
  addText("Actividad de la empresa:", anteproyecto.actividadEmpresa);
  addText("Ubicación de la empresa (distrito):", anteproyecto.distritoEmpresa);
  addText("Ubicación de la empresa (cantón):", anteproyecto.cantonEmpresa);
  addText("Ubicación de la empresa (provincia):", anteproyecto.provinciaEmpresa);
  addText("Nombre del asesor industrial:", anteproyecto.nombreAsesor);
  addText("Puesto que desempeña el asesor industrial en la empresa:", anteproyecto.puestoAsesor);
  addText("Teléfono del contacto:", anteproyecto.telefonoContacto);
  addText("Correo del contacto:", anteproyecto.correoContacto);
  addText("Nombre del contacto de recursos humanos:", anteproyecto.nombreHR);
  addText("Teléfono del contacto de recursos humanos:", anteproyecto.telefonoHR);
  addText("Correo del contacto de recursos humanos:", anteproyecto.correoHR);
  addText("Contexto:", anteproyecto.contexto);
  addText("Justificación del trabajo:", anteproyecto.justificacion);
  addText("Síntomas principales (a lo sumo 3):", anteproyecto.sintomas);
  addText("Efectos o impactos para la empresa:", anteproyecto.impacto);
  addText("Nombre del departamento a realizar el proyecto:", anteproyecto.nombreDepartamento);
  addText("Tipo de proyecto:", anteproyecto.tipoProyecto);
  addText("Estado del proyecto:", anteproyecto.estado); 

  // Descarga del PDF
  doc.save(`Anteproyecto_${anteproyecto.nombreEmpresa}.pdf`);
}

export function descargarProyecto(anteproyecto) {
  const doc = new jsPDF();

  // Obtener la fecha actual
  const fechaActual = new Date();

  // Formatear la fecha en formato corto (DD/MM/AAAA)
  const dia = fechaActual.getDate();
  const mes = fechaActual.getMonth() + 1; // Los meses empiezan en 0
  const año = fechaActual.getFullYear();
  const fechaFormateada = `${dia}/${mes}/${año}`;

  // Título
  doc.setFontSize(18);
  doc.text('Información del Anteproyecto', 20, 20);

  let yPosition = 40;
  const lineSpacing = 10;

  const pageWidth = doc.internal.pageSize.getWidth(); 
  const textWidth = pageWidth - 40; // Ancho disponible (20 de margen a cada lado)
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(10);
  doc.text(`${fechaFormateada}`, textWidth, 20);

  // Función para añadir texto de manera dinámica, manejando el espacio vertical
  function addText(label, value) {
    const labelText = `${label} `;
    const text = value;
    
    const labelWidth = doc.getTextWidth(labelText);
    const textDividido = doc.splitTextToSize(text, textWidth); // Dividir el texto para ajustarse al ancho
    let requiredHeight = textDividido.length * lineSpacing; // Calcular altura necesaria para este texto

    if(textDividido.length > 1){
      requiredHeight = (textDividido.length * 5) + 5; 
    }

    // Verificar si hay espacio suficiente en la página actual
    if (yPosition + requiredHeight > pageHeight - 20) { // Deja un margen de 20 px al final de la página
      doc.addPage(); // Agregar nueva página
      yPosition = 20; // Reiniciar la posición Y en la nueva página
    }

    // Añadir texto con la etiqueta en negrita
    doc.setFont("Helvetica", "bold");
    doc.text(labelText, 20, yPosition);

    // Imprimir el texto en la posición actual
    doc.setFont("Helvetica", "normal");
    doc.text(textDividido, 20, yPosition + 10);
    yPosition += requiredHeight + 10; 
  }

  // Información del anteproyecto
  doc.setFontSize(12);
  addText("Nombre del estudiante:", anteproyecto.estudiante.nombre);
  addText("Carnet:", anteproyecto.estudiante.carnet);
  addText("Teléfono:", anteproyecto.estudiante.telefono);
  addText("Correo:", anteproyecto.estudiante.correo);
  addText("Sede:", anteproyecto.sede);
  addText("Nombre de la Empresa:", anteproyecto.nombreEmpresa);
  addText("Tipo de Empresa:", anteproyecto.tipoEmpresa);
  addText("Actividad de la empresa:", anteproyecto.actividadEmpresa);
  addText("Ubicación de la empresa (distrito):", anteproyecto.distritoEmpresa);
  addText("Ubicación de la empresa (cantón):", anteproyecto.cantonEmpresa);
  addText("Ubicación de la empresa (provincia):", anteproyecto.provinciaEmpresa);
  addText("Nombre del asesor industrial:", anteproyecto.nombreAsesor);
  addText("Puesto que desempeña el asesor industrial en la empresa:", anteproyecto.puestoAsesor);
  addText("Teléfono del contacto:", anteproyecto.telefonoContacto);
  addText("Correo del contacto:", anteproyecto.correoContacto);
  addText("Nombre del contacto de recursos humanos:", anteproyecto.nombreHR);
  addText("Teléfono del contacto de recursos humanos:", anteproyecto.telefonoHR);
  addText("Correo del contacto de recursos humanos:", anteproyecto.correoHR);
  addText("Contexto:", anteproyecto.contexto);
  addText("Justificación del trabajo:", anteproyecto.justificacion);
  addText("Síntomas principales (a lo sumo 3):", anteproyecto.sintomas);
  addText("Efectos o impactos para la empresa:", anteproyecto.impacto);
  addText("Nombre del departamento a realizar el proyecto:", anteproyecto.nombreDepartamento);
  addText("Tipo de proyecto:", anteproyecto.tipoProyecto);
  addText("Estado del proyecto:", anteproyecto.estado); 

  // Descarga del PDF
  doc.save(`Anteproyecto_${anteproyecto.nombreEmpresa}.pdf`);
}

