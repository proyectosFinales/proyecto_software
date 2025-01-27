// src/view/pages/calificaciones/calificacionAsesor.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Send,
  HelpCircle,
  Clock,
  Heart,
  Shield,
  MessageCircle,
  CheckCircle2,
  BookOpen,
  BrainCircuit,
  ArrowLeft
} from 'lucide-react';
import HeaderEstudiante from '../../components/HeaderEstudiante';
import Footer from '../../components/Footer';
import { calificarProfesor } from '../../../controller/calificacionesController';
import { successToast, errorToast } from '../../components/toast';
import supabase from '../../../model/supabase'; // <-- to fetch Estudiante & proyecto states

const ProfessorEvaluationForm = () => {
  /**
   * 1) Tomamos el ID del estudiante guardado en la sesión.
   *    Asumimos que 'token' es el mismo que 'estudiante_id'.
   */
  const estudianteID = sessionStorage.getItem('token');

  /**
   * 2) useNavigate para redireccionar luego de calificar
   */
  const navigate = useNavigate();

  /**
   * 3) formData con todos los campos del formulario (9 criterios + recomendacion + starRating + comentarios).
   */
  const [formData, setFormData] = useState({
    serviceRatings: {
      aclaracion: 0,
      respuestas: 0,
      correccion: 0,
      explicacion: 0,
      retroalimentacion: 0
    },
    recommendationScore: 0,
    starRating: 0,
    additionalComments: ''
  });

  /**
   * 4) Lista de criterios para iterar en el UI (cada uno con id, label, icon).
   */
  const criteria = [
    { id: 'aclaracion', label: 'Aclara las dudas planteadas', icon: HelpCircle },
    { id: 'respuestas', label: 'Dirige las respuestas a las preguntas de una manera clara', icon: CheckCircle2 },
    { id: 'correccion', label: 'Corrige de forma justificada', icon: BookOpen },
    { id: 'explicacion', label: 'Explica claramente en que consisten sus observaciones', icon: BrainCircuit },
    { id: 'retroalimentacion', label: 'Entrega retroalimentación a tiempo', icon: MessageSquare }
  ];

  /**
   * 5) Manejador de cambios de "radio" en cada criterio
   */
  const handleServiceRatingChange = (aspect, value) => {
    setFormData(prev => ({
      ...prev,
      serviceRatings: {
        ...prev.serviceRatings,
        [aspect]: value
      }
    }));
  };

  /**
   * 6) Manejador de "submit" (cuando el usuario presiona "Enviar Evaluación")
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await calificarProfesor(formData, estudianteID, 1);
      successToast('¡Calificación enviada con éxito!');
      navigate('/menuEstudiante');
    } catch (error) {
      errorToast(error.message);
    }
  };

  const RatingStars = ({ value, onChange, count = 5 }) => (
    <div className="flex gap-1">
      {[...Array(count)].map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className={`text-2xl transition-colors ${
            i < value ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          <Star className={`w-6 h-6 ${i < value ? 'fill-current' : ''}`} />
        </button>
      ))}
    </div>
  );

  // Track if user is allowed or not
  const [isAllowed, setIsAllowed] = useState(true);

  // new effect to verify student's status
  useEffect(() => {
    const checkStatus = async () => {
      console.log("[CalificacionAsesor] 🔍 Iniciando verificación para estudiante:", estudianteID);
      try {
        // Enhanced query with more details
        const { data: estudianteData, error: estError } = await supabase
          .from('Estudiante')
          .select(`
            id_usuario,
            estado,
            carnet,
            Usuario:Usuario!Estudiante_id_usuario_fkey (
              nombre,
              correo,
              telefono,
              sede
            ),
            Anteproyecto:Anteproyecto!Anteproyecto_estudiante_id_fkey (
              id,
              estado,
              titulo,
              fecha_creacion,
              empresa,
              profesor:Profesor (
                id,
                Usuario:Usuario (
                  nombre,
                  correo
                ),
                cantidad_estudiantes,
                departamento
              ),
              Calificacion:Calificacion (
                id,
                fecha_calificacion,
                score_aclaracion,
                score_respuestas,
                score_correccion,
                score_explicacion,
                score_retroalimentacion,
                recomendacion,
                star_rating,
                comentarios
              )
            )
          `)
          .eq('id_usuario', estudianteID)
          .single();

        if (estError) {
          console.error("[CalificacionAsesor] ❌ Error DB:", estError);
          throw estError;
        }

        // Enhanced logging with more details
        console.log("[CalificacionAsesor] 📋 Datos completos:", {
          estudiante: {
            id: estudianteData?.id_usuario,
            carnet: estudianteData?.carnet,
            estado: estudianteData?.estado,
            nombre: estudianteData?.Usuario?.nombre,
            correo: estudianteData?.Usuario?.correo,
            telefono: estudianteData?.Usuario?.telefono,
            sede: estudianteData?.Usuario?.sede
          },
          anteproyecto: estudianteData?.Anteproyecto ? {
            id: estudianteData?.Anteproyecto?.id,
            titulo: estudianteData?.Anteproyecto?.titulo,
            estado: estudianteData?.Anteproyecto?.estado,
            fecha_creacion: estudianteData?.Anteproyecto?.fecha_creacion,
            empresa: estudianteData?.Anteproyecto?.empresa,
            profesor: estudianteData?.Anteproyecto?.profesor ? {
              id: estudianteData?.Anteproyecto?.profesor?.id,
              nombre: estudianteData?.Anteproyecto?.profesor?.Usuario?.nombre,
              correo: estudianteData?.Anteproyecto?.profesor?.Usuario?.correo,
              departamento: estudianteData?.Anteproyecto?.profesor?.departamento,
              cantidad_estudiantes: estudianteData?.Anteproyecto?.profesor?.cantidad_estudiantes
            } : "Sin profesor asignado"
          } : "Sin anteproyecto",
          calificacionesExistentes: estudianteData?.Anteproyecto?.Calificacion || "Sin calificaciones previas"
        });

        if (!estudianteData) {
          console.log("[CalificacionAsesor] ⚠️ No se encontró estudianteData");
          setIsAllowed(false);
          return;
        }

        const estadoEst = (estudianteData.estado || "").toLowerCase();
        const estadoProyecto = (estudianteData.Anteproyecto?.estado || "").toLowerCase();
        
        console.log("[CalificacionAsesor] 📊 Estados actuales:", {
          estudiante: estadoEst,
          proyecto: estadoProyecto
        });

        const isEstudianteOk = (estadoEst === 'aprobado' || estadoEst === 'reprobado');
        const isProyectoOk = (estadoProyecto === 'aprobado' || estadoProyecto === 'reprobado');

        console.log("[CalificacionAsesor] ✓ Verificación de estados:", {
          estudianteAptoParaCalificar: isEstudianteOk,
          proyectoAptoParaCalificar: isProyectoOk,
          razonNoApto: !isEstudianteOk ? "Estado estudiante no es aprobado/reprobado" :
                      !isProyectoOk ? "Estado proyecto no es aprobado/reprobado" :
                      "Ambos estados son correctos"
        });

        if (!isEstudianteOk || !isProyectoOk) {
          console.log("[CalificacionAsesor] Estudiante/proyecto no apto; no se redirige, solo setIsAllowed(false).");
          setIsAllowed(false);
        } else {
          console.log("[CalificacionAsesor] El Estudiante sí puede calificar. setIsAllowed(true).");
          setIsAllowed(true);
        }
      } catch (error) {
        console.error("[CalificacionAsesor] Error al verificar estado:", error);
        // Also mark isAllowed false if an error occurs
        setIsAllowed(false);
      }
    };
    checkStatus();
  }, [estudianteID]);

  // Then in the UI, if !isAllowed -> show a message or a "disabled" form
  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderEstudiante title="Calificar Profesor Asesor" />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <h2 className="text-red-600 font-semibold text-xl mb-2">Tu estado no te permite calificar.</h2>
            <p className="text-gray-700">
              Solo se puede calificar si tu estado y el de tu Proyecto son 
              "Aprobado" o "Reprobado". Contacta a tu profesor asesor si tienes dudas.
            </p>
            <button
              onClick={() => navigate('/menuEstudiante')}
              className="mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Volver al Menú
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /**
   * Render completo de la página
   */
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderEstudiante title="Calificar Profesor Asesor" />

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Service Ratings Section */}
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Evaluación del Servicio
            </h2>

            {Object.entries(formData.serviceRatings).map(([aspect, value]) => (
              <div key={aspect} className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <span className="capitalize">{aspect}</span>
                </label>
                <RatingStars
                  value={value}
                  onChange={(val) => handleServiceRatingChange(aspect, val)}
                />
              </div>
            ))}
          </div>

          {/* Recommendation Score */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ¿Recomendaría a este profesor?
            </h2>
            <div className="flex gap-4">
              <RatingStars
                value={formData.recommendationScore}
                onChange={(val) => setFormData(prev => ({
                  ...prev,
                  recommendationScore: val
                }))}
              />
            </div>
          </div>

          {/* Overall Rating */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Calificación General
            </h2>
            <RatingStars
              value={formData.starRating}
              onChange={(val) => setFormData(prev => ({
                ...prev,
                starRating: val
              }))}
            />
          </div>

          {/* Comments */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Comentarios Adicionales
            </h2>
            <textarea
              value={formData.additionalComments}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                additionalComments: e.target.value
              }))}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Escriba sus comentarios aquí..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       transition-colors"
            >
              <Send className="w-5 h-5 mr-2" />
              Enviar Evaluación
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default ProfessorEvaluationForm;
