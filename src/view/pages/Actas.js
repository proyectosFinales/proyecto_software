import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import HeaderProfesor from '../components/HeaderProfesor';
import { PDFDownloadLink } from "@react-pdf/renderer";
import Defensa from '../PDFblueprints/Defensa';
import CosntanciaPDF from '../PDFblueprints/ConstanciaPDF';
import Entrega from '../PDFblueprints/Entrega';

import { generateInformePreliminarPDF } from '../PDFblueprints/InformePreliminarPDF';
import { generateCriterioTecnicoPDF } from '../PDFblueprints/CriterioTecnicoPDF';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../components/modal.jsx";

const Actas = () => {
  const [actas, setActas] = useState([]);
  const navigate = useNavigate();
  const modalConfirmacion = useRef({});
  const [selectedActa, setSelectedActa] = useState(null);

  useEffect(() => {
    consultarActas();
  }, []);

  async function consultarInfoProfesor() {
    try {
      const userToken = sessionStorage.getItem('token');
      const { data, error } = await supabase
        .from('Usuario')
        .select(`
          Profesor:Profesor!Profesor_id_usuario_fkey (
            profesor_id
          )
        `)
        .eq('id', userToken)
        .single();
      if (error) throw error;
      if (!data) {
        return;
      }
      return data.Profesor[0].profesor_id;
    } catch (error) {
      toast.error(`Error al buscar estudiante: ${error.message}`);
    }
  }

  async function crearCarta() {
    try {
      if(actas.length > 0) 
        toast.info(`Ya ha solicitado una carta de acta, para solicitar otra debe eliminar la actual.`);
      else
        navigate('/machotes');
    } catch (error) {
      toast.error(`Error al consultar cartas: ${error.message}`);
    }
  }

  async function consultarActas() {
    try {
      const profesorID = await consultarInfoProfesor();
      const { data, error } = await supabase
        .from('Acta')
        .select(`
          id,
          estudiante_id,
          profesor_id,
          titulo,
          datos,
          machote,
          semestre,
          Estudiante:acta_estudiante_id_fkey (
            carnet,
            id_usuario,
            Usuario:id_usuario (
              nombre,
              sede
            ),
            Anteproyecto:anteproyecto_estudiante_id_fkey (
              id,
              Empresa:anteproyecto_empresa_id_fkey(
                nombre
              )
            )
          ),
          Profesor:acta_profesor_id_fkey (
            id_usuario,
            Usuario:id_usuario (
              nombre,
              sede
            )
          )
        `)
        .eq('profesor_id', profesorID);
      if (error) {
        toast.error(`No se pudieron obtener las actas: ${error.message}`);
        return;
      }
      setActas(data || []);
    } catch (error) {
      toast.error(`Error al consultar actas: ${error.message}`);
    }
  }

  async function eliminarActa(id) {
    try {
      const { error } = await supabase
        .from('Acta')
        .delete()
        .eq('id', id);
      if (error) {
        toast.error(`Error al eliminar acta: ${error.message}`);
        return;
      }

      setActas((prev) => prev.filter((ap) => ap.id !== id));
      modalConfirmacion.close();
      toast.success("Se ha eliminado el acta con éxito.");
    } catch (error) {
      toast.error(`Error al eliminar acta: ${error.message}`);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Modal modalRef={modalConfirmacion} title={<h5>Eliminar Acta</h5>} onAccept={() => eliminarActa(selectedActa.id) }>
        <p>¿Está seguro que desea eliminar esta acta?</p>
      </Modal>
      <HeaderProfesor title="Solicitud de acta de defensa"/>
        <main className="flex-grow p-6">
          <div className="max-w-7xl mx-auto bg-white p-4 rounded shadow">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mb-4"
              onClick={() => crearCarta()}
            >
              Solicitar Acta
            </button>
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-200 border-b">
                    <th className="p-3 border-r text-left">Estudiante</th>
                    <th className="p-3 border-r text-left">Título</th>
                    <th className="p-3 border-r text-left">Plantilla</th>
                    <th className="p-3 border-r text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {actas.map((acta) => (
                    <tr key={acta.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 border-r">{acta.Estudiante.Usuario.nombre}</td>
                      <td className="p-3 border-r">{acta.titulo}</td>
                      <td className="p-3 border-r">{acta.machote}</td>
                      <td className="p-3 flex space-x-2">
                          {(acta.machote === "Acta de defensa pública") && (
                          <PDFDownloadLink document={<Defensa solicitud={acta}/>} fileName={`Acta de defensa pública ${acta.Estudiante.Usuario.nombre}.pdf`}>
                          {({loading}) => (loading ? <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Cargando Documento...</button> : <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                            Descargar
                          </button> )}
                          </PDFDownloadLink>
                          )}
                          {(acta.machote === "Acta de entrega de informe final") && (
                          <PDFDownloadLink document={<Entrega solicitud={acta}/>} fileName={`Acta de entrega de informe final ${acta.Estudiante.Usuario.nombre}.pdf`}>
                          {({loading}) => (loading ? <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Cargando Documento...</button> : <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                            Descargar
                          </button> )}
                          </PDFDownloadLink>
                          )}
                          {(acta.machote === "Constancia de defensa pública") && (
                          <PDFDownloadLink document={<CosntanciaPDF solicitud={acta}/>} fileName={`Constancia de defensa pública ${acta.Estudiante.Usuario.nombre}.pdf`}>
                          {({loading}) => (loading ? <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Cargando Documento...</button> : <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                            Descargar
                          </button> )}
                          </PDFDownloadLink>
                          )}
                          
                          {(acta.machote === "InformePreliminar") && (
                        <PDFDownloadLink 
                          document={<button onClick={() => generateInformePreliminarPDF(acta.datos)} />} // Usamos la función del blueprint
                          fileName={`Carta_Informe_Preliminar_${acta.Estudiante.Usuario.nombre}.pdf`}
                        >
                          {({loading}) => (loading ? <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Cargando Documento...</button> : <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                            Descargar (Preliminar)
                          </button> )}
                        </PDFDownloadLink>
                        )}

                        {(acta.machote === "CriterioTecnico") && (
                        <PDFDownloadLink 
                          document={<button onClick={() => generateCriterioTecnicoPDF(acta.datos)} />} // Usamos la función del blueprint
                          fileName={`Carta_Criterio_Tecnico_${acta.Estudiante.Usuario.nombre}.pdf`}
                        >
                          {({loading}) => (loading ? <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Cargando Documento...</button> : <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                            Descargar (C. Técnico)
                          </button> )}
                        </PDFDownloadLink>
                      )}

                          <button
                            onClick={() =>
                              //eliminarActa(acta.id)
                              {modalConfirmacion.open(); setSelectedActa(acta);}
                            }
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                          >
                            Eliminar
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </main>
      <Footer />
    </div>
  );
};

export default Actas;
