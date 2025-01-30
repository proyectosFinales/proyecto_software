import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import HeaderEstudiante from '../components/HeaderEstudiante';
import { PDFDownloadLink } from "@react-pdf/renderer";
import Carta from '../PDFblueprints/Carta';
import Letter from '../PDFblueprints/Letter';

const CartasEstudiante = () => {
  const [cartas, setCartas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    consultarCartas();
  }, []);

  async function consultarInfoEstudiante() {
    try {
      const userToken = sessionStorage.getItem('token');
      const { data, error } = await supabase
        .from('Usuario')
        .select(`
          Estudiante:Estudiante!Estudiante_id_usuario_fkey (
            estudiante_id,
            carnet
          )
        `)
        .eq('id', userToken)
        .single();
      if (error) throw error;
      if (!data) {
        return;
      }
      return data.Estudiante[0].estudiante_id;
    } catch (error) {
      alert('Error al buscar estudiante' + error);
    }
  }

  async function crearCarta() {
    try {
      const studentID = await consultarInfoEstudiante();
      const { data, error } = await supabase
        .from('SolicitudCarta')
        .select(`
          id_solicitud
        `)
        .eq('estudiante_id', studentID);
      if (error) {
        alert('No se pudieron obtener las cartas. ' + error.message);
        return;
      }
      if(data.length != 0){
        alert("Ya tiene una carta solicitada");
      }
      else{
        navigate('/formularioCarta');
      }
    } catch (error) {
      alert('Error al consultar cartas: ' + error);
    }
  }

  async function consultarCartas() {
    try {
      const studentID = await consultarInfoEstudiante();
      const { data, error } = await supabase
        .from('SolicitudCarta')
        .select(`
          id_solicitud,
          estudiante_id,
          nombre_receptor,
          puesto_receptor,
          empresa,
          genero_emisor,
          genero_receptor,
          apellidos_receptor,
          cedula,
          idioma,
          semestre,
          Estudiante:SolicitudCarta_estudiante_id_fkey1 (
            carnet,
            id_usuario,
            Usuario:id_usuario (
              nombre,
              correo,
              telefono,
              sede
            )
          )
        `)
        .eq('estudiante_id', studentID);
      if (error) {
        alert('No se pudieron obtener las cartas. ' + error.message);
        return;
      }
      setCartas(data || []);
    } catch (error) {
      alert('Error al consultar anteproyectos: ' + error);
    }
  }

  async function eliminarCarta(id) {
    const confirmarEnvio = window.confirm(
      "¿Está seguro que desea eliminar esta carta?"
    );
    if (!confirmarEnvio) return;

    try {
      const { error } = await supabase
        .from('SolicitudCarta')
        .delete()
        .eq('id_solicitud', id);
      if (error) {
        alert('Error al eliminar carta: ' + error.message);
        return;
      }

      setCartas((prev) => prev.filter((ap) => ap.id_solicitud !== id));
    } catch (error) {
      alert('Error al eliminar carta:' + error);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HeaderEstudiante title="Solicitud de cartas para empresa" />
        <main className="flex-grow p-6">
          <div className="max-w-7xl mx-auto bg-white p-4 rounded shadow">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mb-4"
              onClick={() => crearCarta()}
            >
              Solicitar Carta
            </button>
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-200 border-b">
                    <th className="p-3 border-r text-left">Empresa</th>
                    <th className="p-3 border-r text-left">Receptor</th>
                    <th className="p-3 border-r text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cartas.map((carta) => (
                    <tr key={carta.id_solicitud} className="border-b hover:bg-gray-50">
                      <td className="p-3 border-r">{carta.empresa}</td>
                      <td className="p-3 border-r">{carta.nombre_receptor} {carta.apellidos_receptor}</td>
                      <td className="p-3 flex space-x-2">
                          {(carta.idioma === "Español") && (
                          <PDFDownloadLink document={<Carta solicitud={carta}/>} fileName={`Carta a empresa ${carta.Estudiante.Usuario.nombre}.pdf`}>
                          {({loading}) => (loading ? <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Cargando Documento...</button> : <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                            Descargar
                          </button> )}
                          </PDFDownloadLink>
                          )}
                          {(carta.idioma === "Ingles") && (
                          <PDFDownloadLink document={<Letter solicitud={carta}/>} fileName={`Good standing letter ${carta.Estudiante.Usuario.nombre}.pdf`}>
                          {({loading}) => (loading ? <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Cargando Documento...</button> : <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                            Descargar
                          </button> )}
                          </PDFDownloadLink>
                          )}
                          <button
                            onClick={() =>
                              eliminarCarta(carta.id_solicitud)
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

export default CartasEstudiante;
