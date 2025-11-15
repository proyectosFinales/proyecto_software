// ==================== InformePreliminarPDF.js ====================
// Define la plantilla de jsPDF para la Carta de Informe Preliminar (REQ-48)

import { jsPDF } from 'jspdf';
import logoTec from '../PDFblueprints/logoTec.jpg'; // Se asume la ruta al logo
import Cambria from './Font/Cambria-Font-For-Windows.ttf';

/**
 * Genera un PDF para la Carta de Aprobación de Informe Preliminar.
 * @param {object} data - Datos del proyecto (estudiante, proyecto, profesor).
 * @param {string} data.studentName - Nombre del estudiante.
 * @param {string} data.studentCarnet - Carné del estudiante.
 * @param {string} data.projectName - Título del proyecto.
 * @param {string} data.profesorName - Nombre del profesor asesor.
 */
export function generateInformePreliminarPDF(data) {
  const doc = new jsPDF();
  const today = new Date();
  const dateStr = `${today.getDate()} de ${today.toLocaleString('es-ES', { month: 'long' })} de ${today.getFullYear()}`;

  // --- Configuración de Fuente y Logo ---
  try {
    doc.addFileToVFS('Cambria.ttf', Cambria);
    doc.addFont('Cambria.ttf', 'Cambria', 'normal');
    doc.setFont('Cambria');
  } catch (e) {
    console.error("Error al cargar la fuente:", e);
    // Continuar con la fuente por defecto si falla
  }
  
  doc.addImage(logoTec, 'JPG', 15, 10, 30, 30); // (imagen, formato, x, y, w, h)
  
  // --- Encabezado ---
  doc.setFontSize(14);
  doc.text("INSTITUTO TECNOLÓGICO DE COSTA RICA", 105, 20, { align: 'center' });
  doc.text("ESCUELA DE INGENIERÍA EN PRODUCCIÓN INDUSTRIAL", 105, 28, { align: 'center' });

  // --- Título del Documento ---
  doc.setFontSize(16);
  doc.setFont('Cambria', 'bold');
  doc.text("CARTA DE APROBACIÓN DE INFORME PRELIMINAR", 105, 50, { align: 'center' });

  // --- Cuerpo del Documento ---
  doc.setFontSize(12);
  doc.setFont('Cambria', 'normal');
  
  const bodyText = `Por medio de la presente, se hace constar que el (la) estudiante ${
    data.studentName || '(Nombre Estudiante)'
  }, carné ${
    data.studentCarnet || '(Carné)'
  }, ha completado y aprobado satisfactoriamente la etapa de Informe Preliminar de su Proyecto Final de Graduación.
  \n\nEl proyecto se titula:
  \n"${data.projectName || '(Título del Proyecto)'}"
  \n\nEste documento certifica que el estudiante ha cumplido con los requisitos de esta fase y puede continuar con el desarrollo de su proyecto.
  `;

  // Usar splitTextToSize para manejar el ajuste de línea
  const lines = doc.splitTextToSize(bodyText, 170); // 170mm de ancho
  doc.text(lines, 20, 70); // (texto, x, y)

  // --- Fecha y Firma ---
  doc.text(`San José, Costa Rica, ${dateStr}.`, 20, 140);

  doc.text("________________________", 20, 160);
  doc.setFont('Cambria', 'bold');
  doc.text(data.profesorName || '(Nombre Profesor)', 20, 165);
  doc.setFont('Cambria', 'normal');
  doc.text("Profesor Asesor", 20, 170);

  // --- Guardar el PDF ---
  doc.save(`Carta_Informe_Preliminar_${data.studentCarnet}.pdf`);
}