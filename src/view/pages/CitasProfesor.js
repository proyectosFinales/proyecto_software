/**
 * CitasProfesor.jsx
 * Muestra las citas relacionadas con un profesor (sea como tutor o lector).
 */
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Footer from '../components/Footer';
import Header from '../components/HeaderProfesor';
import supabase from '../../model/supabase';
import { errorToast } from '../components/toast';

const CitasProfesor = () => {
  const profesorUserID = sessionStorage.getItem('token');
  const [citas, setCitas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        setIsLoading(true);
        console.log('Buscando citas para profesor ID:', profesorUserID);

        // 1. Obtener el profesor_id real desde la tabla Profesor
        const { data: profesor, error: profError } = await supabase
          .from('Profesor')
          .select('profesor_id')
          .eq('id_usuario', profesorUserID)
          .single();

        if (profError) {
          console.error('Error buscando profesor:', profError);
          throw profError;
        }

        console.log('Información del profesor encontrada:', profesor);
        const realProfesorId = profesor?.profesor_id;

        // 2. Buscar todas las citas donde el profesor participa
        const { data: citasData, error: citasError } = await supabase
          .from('Cita')
          .select(`
            cita_id,
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
            ),
            Proyecto:proyecto_id (
              id,
              estudiante_id,
              Estudiante:estudiante_id (
                estudiante_id,
                Usuario:id_usuario (
                  nombre
                )
              )
            )
          `)
          .or(`tutor.eq.${realProfesorId},lector1.eq.${realProfesorId},lector2.eq.${realProfesorId}`);

        if (citasError) {
          console.error('Error buscando citas:', citasError);
          throw citasError;
        }

        console.log('Citas encontradas:', citasData);

        // 3. Procesar y ordenar las citas
        const citasProcesadas = citasData
          .map(cita => ({
            id: cita.cita_id,
            fecha: cita.Disponibilidad?.dia,
            horaInicio: cita.Disponibilidad?.hora_inicio,
            horaFin: cita.Disponibilidad?.hora_fin,
            estudianteNombre: cita.Proyecto?.Estudiante?.Usuario?.nombre,
            tutorNombre: cita.tutor?.Usuario?.nombre,
            lector1Nombre: cita.lector1?.Usuario?.nombre,
            lector2Nombre: cita.lector2?.Usuario?.nombre,
            rol: cita.tutor?.profesor_id === realProfesorId ? 'Tutor' :
                 cita.lector1?.profesor_id === realProfesorId ? 'Lector 1' : 'Lector 2'
          }))
          .sort((a, b) => {
            // Ordenar por fecha y hora
            const dateA = new Date(a.fecha + 'T' + a.horaInicio);
            const dateB = new Date(b.fecha + 'T' + b.horaInicio);
            return dateA - dateB;
          });

        console.log('Citas procesadas:', citasProcesadas);
        setCitas(citasProcesadas);

      } catch (error) {
        console.error('Error completo:', error);
        errorToast('Error al cargar las citas: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCitas();
  }, [profesorUserID]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header title="Mis Defensas" />
        <div className="flex-grow flex justify-center items-center">
          <div className="loading-spinner"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header title="Mis Defensas" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {citas.length > 0 ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Defensas Programadas
                </h2>
                
                <div className="space-y-6">
                  {citas.map((cita) => (
                    <div 
                      key={cita.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Fecha y Hora */}
                      <div className="flex flex-wrap items-start gap-6 mb-4">
                        <div className="flex items-center">
                          <i className="far fa-calendar-alt text-blue-600 text-xl mr-3"></i>
                          <div>
                            <p className="text-sm text-gray-500">Fecha</p>
                            <p className="font-medium">
                              {format(new Date(cita.fecha), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <i className="far fa-clock text-green-600 text-xl mr-3"></i>
                          <div>
                            <p className="text-sm text-gray-500">Hora</p>
                            <p className="font-medium">
                              {cita.horaInicio?.slice(0, 5)} - {cita.horaFin?.slice(0, 5)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <i className="fas fa-user-graduate text-purple-600 text-xl mr-3"></i>
                          <div>
                            <p className="text-sm text-gray-500">Estudiante</p>
                            <p className="font-medium">{cita.estudianteNombre || 'No asignado'}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <i className="fas fa-user-tie text-indigo-600 text-xl mr-3"></i>
                          <div>
                            <p className="text-sm text-gray-500">Su rol</p>
                            <p className="font-medium">{cita.rol}</p>
                          </div>
                        </div>
                      </div>

                      {/* Tribunal */}
                      <div className="bg-gray-50 rounded p-3">
                        <h4 className="font-medium text-gray-700 mb-2">Tribunal Completo</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Tutor</p>
                            <p className="font-medium">{cita.tutorNombre}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Lector 1</p>
                            <p className="font-medium">{cita.lector1Nombre}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Lector 2</p>
                            <p className="font-medium">{cita.lector2Nombre}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <i className="far fa-calendar-times text-gray-400 text-5xl mb-4"></i>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No hay defensas programadas
              </h2>
              <p className="text-gray-600">
                Actualmente no tiene defensas asignadas como tutor o lector.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CitasProfesor;
