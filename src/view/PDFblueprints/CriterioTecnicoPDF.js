// ==================== CriterioTecnicoPDF.js ====================
// Define la plantilla de jsPDF para la Carta de Criterio Técnico (REQ-49)

import { jsPDF } from 'jspdf';
import logoTec from '../PDFblueprints/logoTec.jpg'; // Se asume la ruta al logo
import Cambria from './Font/Cambria-Font-For-Windows.ttf';

/**
 * Genera un PDF para la Carta de Criterio Técnico del Tribunal.
 * @param {object} data - Datos del proyecto y del formulario.
 * @param {string} data.studentName - Nombre del estudiante.
 * @param {string} data.studentCarnet - Carné del estudiante.
 * @param {string} data.projectName - Título del proyecto.
 * @param {string} data.criterioTecnico - Justificación ingresada por el tribunal.
 * @param {string} data.tribunal1 - Nombre del miembro 1.
 * @param {string} data.tribunal2 - Nombre del miembro 2.
 */
export function generateCriterioTecnicoPDF(data) {
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
  }

  doc.addImage(logoTec, 'JPG', 15, 10, 30, 30);
  
  // --- Encabezado ---
  doc.setFontSize(14);
  doc.text("INSTITUTO TECNOLÓGICO DE COSTA RICA", 105, 20, { align: 'center' });
  doc.text("ESCUELA DE INGENIERÍA EN PRODUCCIÓN INDUSTRIAL", 105, 28, { align: 'center' });

  // --- Título del Documento ---
  doc.setFontSize(16);
  doc.setFont('Cambria', 'bold');
  doc.text("CARTA DE CRITERIO TÉCNICO", 105, 50, { align: 'center' });
  doc.text("TRIBUNAL EVALUADOR DE PROYECTO FINAL DE GRADUACIÓN", 105, 58, { align: 'center' });

  // --- Datos del Proyecto ---
  doc.setFontSize(12);
  doc.setFont('Cambria', 'normal');
  doc.text(`Estudiante:`, 20, 75);
  doc.setFont('Cambria', 'bold');
  doc.text(data.studentName || '(Nombre Estudiante)', 45, 75);
  
  doc.setFont('Cambria', 'normal');
  doc.text(`Carné:`, 120, 75);
  doc.setFont('Cambria', 'bold');
  doc.text(data.studentCarnet || '(Carné)', 135, 75);

  doc.setFont('Cambria', 'normal');
  doc.text(`Proyecto:`, 20, 85);
  doc.setFont('Cambria', 'bold');
  const projectTitleLines = doc.splitTextToSize(data.projectName || '(Título del Proyecto)', 150);
  doc.text(projectTitleLines, 45, 85);
  
  // --- Cuerpo del Documento (El Criterio) ---
  doc.setFontSize(12);
  doc.setFont('Cambria', 'bold');
  doc.text("CRITERIO TÉCNICO DEL TRIBUNAL EVALUADOR:", 20, 105);
  
  doc.setFont('Cambria', 'normal');
  const criterioText = data.criterioTecnico || '(El tribunal no incluyó un criterio técnico detallado en el formulario).';
  const criterioLines = doc.splitTextToSize(criterioText, 170); // 170mm de ancho
  doc.text(criterioLines, 20, 115); // (texto, x, y)

  // --- Fecha y Firmas ---
  const finalYPos = doc.autoTable ? doc.autoTable.previous.finalY : 180; // Posición después del texto del criterio
  doc.text(`San José, Costa Rica, ${dateStr}.`, 20, Math.max(finalYPos, 160) + 20);

  doc.text("En fe de lo anterior, firman los miembros del tribunal evaluador:", 20, Math.max(finalYPos, 160) + 30);

  doc.text("________________________", 20, Math.max(finalYPos, 160) + 50);
  doc.text(data.tribunal1 || '(Nombre Tribunal 1)', 20, Math.max(finalYPos, 160) + 55);

  doc.text("________________________", 105, Math.max(finalYPos, 160) + 50);
  doc.text(data.tribunal2 || '(Nombre Tribunal 2)', 105, Math.max(finalYPos, 160) + 55);

  // --- Guardar el PDF ---
  doc.save(`Criterio_Tecnico_${data.studentCarnet}.pdf`);
}