/**
 * CitasEstudiante.jsx
 * Vista para que un Estudiante vea la cita asignada a su anteproyecto/proyecto.
 */
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderEstudiante';
import { errorToast } from '../components/toast';

const CitasEstudiante = () => {
  const estudianteID = sessionStorage.getItem('token');
  const [cita, setCita] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCita = async () => {
      try {
        setIsLoading(true);
        console.log('Buscando citas para estudiante ID:', estudianteID);

        // Primero, verifiquemos que el estudiante existe y obtengamos su información
        const { data: estudiante, error: estError } = await supabase
          .from('Estudiante')
          .select('estudiante_id')
          .eq('id_usuario', estudianteID)
          .single();

        if (estError) {
          console.error('Error buscando estudiante:', estError);
          throw estError;
        }

        console.log('Información del estudiante encontrada:', estudiante);
        const realEstudianteId = estudiante?.estudiante_id;

        // Ahora buscar el proyecto del estudiante
        const { data: proyecto, error: proyError } = await supabase
          .from('Proyecto')
          .select('id')
          .eq('estudiante_id', realEstudianteId)
          .single();

        if (proyError) {
          console.error('Error buscando proyecto:', proyError);
          throw proyError;
        }

        console.log('Proyecto encontrado:', proyecto);

        // Finalmente buscar la cita usando el proyecto_id
        const { data: citasData, error: citaError } = await supabase
          .from('Cita')
          .select(`
            cita_id,
            estudiante_id,
            proyecto_id,
            disponibilidad_id,
            Disponibilidad:disponibilidad_id (
              dia,
              hora_inicio,
              hora_fin
            ),
            tutor:Profesor!Cita_tutor_fkey (
              profesor_id,
              Usuario:id_usuario (
                nombre
              )
            ),
            lector1:Profesor!cita_lector1_fkey (
              profesor_id,
              Usuario:id_usuario (
                nombre
              )
            ),
            lector2:Profesor!cita_lector2_fkey (
              profesor_id,
              Usuario:id_usuario (
                nombre
              )
            )
          `)
          .eq('proyecto_id', proyecto.id);

        console.log('Citas encontradas:', citasData);

        if (citaError) {
          console.error('Error buscando cita:', citaError);
          throw citaError;
        }
        
        if (citasData && citasData.length > 0) {
          const citaFound = citasData[0];
          console.log('Cita seleccionada:', citaFound);
          
          setCita({
            ...citaFound,
            fecha: citaFound.Disponibilidad?.dia,
            horaInicio: citaFound.Disponibilidad?.hora_inicio,
            horaFin: citaFound.Disponibilidad?.hora_fin,
            tutorNombre: citaFound.tutor?.Usuario?.nombre,
            lector1Nombre: citaFound.lector1?.Usuario?.nombre,
            lector2Nombre: citaFound.lector2?.Usuario?.nombre
          });
        } else {
          console.log('No se encontraron citas para el proyecto');
        }

      } catch (error) {
        console.error('Error completo:', error);
        errorToast('Error al cargar la información de la cita: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCita();
  }, [estudianteID]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="Mi Defensa" />
        <div className="flex-grow flex justify-center items-center">
          <div className="loading-spinner"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header title="Mi Defensa" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {cita ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Información de la Defensa
              </h2>
              
              <div className="space-y-6">
                {/* Fecha y Hora */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-4">
                    <i className="far fa-calendar-alt text-blue-600 text-xl mr-3"></i>
                    <div>
                      <h3 className="font-semibold text-gray-800">Fecha y Hora</h3>
                      <p className="text-gray-600">
                        {format(new Date(cita.fecha), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                      <p className="text-gray-600">
                        {cita.horaInicio?.slice(0, 5)} - {cita.horaFin?.slice(0, 5)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tribunal */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-4">Tribunal</h3>
                  
                  <div className="space-y-4">
                    {/* Tutor */}
                    <div className="flex items-center">
                      <i className="fas fa-chalkboard-teacher text-indigo-600 text-xl mr-3"></i>
                      <div>
                        <p className="text-sm text-gray-500">Profesor Tutor</p>
                        <p className="font-medium">{cita.tutorNombre}</p>
                      </div>
                    </div>

                    {/* Lectores */}
                    <div className="flex items-center">
                      <i className="fas fa-users text-green-600 text-xl mr-3"></i>
                      <div>
                        <p className="text-sm text-gray-500">Profesores Lectores</p>
                        <p className="font-medium">{cita.lector1Nombre}</p>
                        <p className="font-medium">{cita.lector2Nombre}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nota Importante */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <i className="fas fa-exclamation-circle text-yellow-600 text-xl mr-3 mt-1"></i>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Nota Importante</h3>
                      <p className="text-gray-600 text-sm">
                        Por favor, asegúrese de estar presente al menos 15 minutos antes de la hora programada.
                        Prepare su presentación y documentación necesaria con anticipación.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <i className="far fa-calendar-times text-gray-400 text-5xl mb-4"></i>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No hay defensa programada
              </h2>
              <p className="text-gray-600">
                Aún no se ha asignado una fecha para su defensa. 
                Por favor, esté pendiente de la asignación por parte del coordinador.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CitasEstudiante;
