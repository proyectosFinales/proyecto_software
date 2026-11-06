// src/view/pages/calificaciones/calificacionAsesor.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
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
  Loader
} from 'lucide-react';
import HeaderEstudiante from '../../components/HeaderEstudiante';
import Footer from '../../components/Footer';
import Modal from '../../components/modal.jsx';
import { calificarProfesor } from '../../../controller/calificacionesController';
import supabase from '../../../model/supabase'; // Para verificar si ya calificó
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfessorEvaluationForm = () => {
  const modalConf = useRef({});

  /**
   * 1) El ID del usuario guardado en la sesión (rol=3 => Estudiante).
   */
  const user = JSON.parse(sessionStorage.getItem('USER'));
  const est = JSON.parse(sessionStorage.getItem('STUDENT'));
  const navigate = useNavigate();

  /**
   * 2) Estados para habilitar/deshabilitar calificación
   */
  const calificacion = sessionStorage.getItem('hasCalificado');
  const [isAllowed, setIsAllowed] = useState(null);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

  /**
   * Estado para el aviso de "proyecto sin profesor asignado".
   * Se usa con el componente Modal (referencia imperativa) y toast.error.
   */
  const [sinProfesorAsignado, setSinProfesorAsignado] = useState(false);

  /**
   * 3) Datos del formulario (criterios + recomendación + rating + comentarios).
   */
  const [formData, setFormData] = useState({
    serviceRatings: {
      agilidad: 0,
      empatia: 0,
      respeto: 0,
      comunicacion: 0,
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
   * 4) Lista de criterios (en tu ejemplo acortado a 5).
   */
  const criteria = [
    { id: 'agilidad', label: 'Agilidad en la atención de consultas', icon: Clock },
    { id: 'empatia', label: 'Demuestra Empatía', icon: Heart },
    { id: 'respeto', label: 'Demuestra Respeto', icon: Shield },
    { id: 'comunicacion', label: 'Utiliza los canales de Comunicación Oficiales', icon: MessageCircle },
    { id: 'aclaracion', label: 'Aclara las dudas planteadas', icon: HelpCircle },
    { id: 'respuestas', label: 'Dirige las respuestas a las preguntas de una manera clara', icon: CheckCircle2 },
    { id: 'correccion', label: 'Corrige de forma justificada', icon: BookOpen },
    { id: 'explicacion', label: 'Explica claramente en qué consisten sus observaciones', icon: BrainCircuit },
    { id: 'retroalimentacion', label: 'Entrega retroalimentación a tiempo', icon: MessageSquare }
  ];

  /**
   * 5) Manejar cambio en los "criterios"
   */
  const handleServiceRatingChange = (criterionID, value) => {
    setFormData((prev) => ({
      ...prev,
      serviceRatings: {
        ...prev.serviceRatings,
        [criterionID]: value
      }
    }));
  };

  /**
   * 6) Componente auxiliar para rating con estrellas
   */
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

  useEffect(() => {
    const verificarPermisos = async () => {
      setIsCheckingPermissions(true);
      console.log("[CalificacionAsesor] Iniciando verificacion de permisos");

      try {
        if (calificacion === "true") {
          console.log("[CalificacionAsesor] Estudiante ya calificó => set isAllowed(false), setAlreadyRated(true)");
          setIsAllowed(false);
          setAlreadyRated(true);
          return;
        }
        console.log("[CalificacionAsesor] Estudiante no ha calificado => setIsAllowed(true).");
        setIsAllowed(true);

      } catch (err) {
        console.error("[CalificacionAsesor] Error en verificarPermisos:", err);
        setIsAllowed(false);

      } finally {
        setIsCheckingPermissions(false);
      }
    };

    verificarPermisos();
  }, [user.id]);

  /**
   * 8) handleSubmit => llama a calificarProfesor(...) si isAllowed, 
   *    luego ya no podrá calificar => forcibly set isAllowed(false).
   */
  async function handleModal(e){
    e.preventDefault();
    modalConf.open();
  }

  const handleSubmit = async () => {
    console.log("[CalificacionAsesor] handleSubmit => isAllowed?", isAllowed);
    
    if (!isAllowed) {
      console.warn("[CalificacionAsesor] No está permitido calificar. Exiting...");
      toast.error("No está permitido calificar en este momento.");
      return;
    }

    try {
      setIsSubmitting(true); // Start loading
      console.log("[CalificacionAsesor] Enviando calificación con formData:", formData);
      
      // Show "uploading" toast
      toast.info("Subiendo su calificación...");
      
      await calificarProfesor(formData, user.id);
      
      // Success! Show completion toast
      toast.success("¡Calificación enviada con éxito!");
      
      console.log("[CalificacionAsesor] Calificación insertada => setIsAllowed(false), go to /menuEstudiante.");
      setIsAllowed(false);
      setAlreadyRated(true);
      navigate("/menuEstudiante");

    } catch (error) {
      console.error(`[CalificacionAsesor] Error al calificarProfesor: ${error.message}`);
      if (error.code=== '23514'){
        toast.info("Debe llenar todo el formulario.");
      }else{
        toast.error("Error enviando la calificación.");
      }
      modalConf.close();

    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  /**
   * 9) Si el usuario NO está permitido => mostramos mensaje según la causa:
   *    "alreadyRated" (ya calificó), "sinProfesorAsignado" (proyecto sin asesor)
   *    o falta de proyecto/estudiante. En el caso de "sin asesor" además se
   *    monta el Modal y se muestra el toast de error.
   */
  if (isCheckingPermissions) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderEstudiante title="Calificar Profesor Asesor" />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader className="w-12 h-12 text-blue-500 animate-spin" />
              <h2 className="text-xl font-semibold text-gray-700">
                Verificando permisos...
              </h2>
              <p className="text-gray-500">
                Por favor espere mientras verificamos su información.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isAllowed === false) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderEstudiante title="Calificar Profesor Asesor" />

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            {alreadyRated ? (
              <>
                <h2 className="text-blue-600 font-semibold text-xl mb-2">
                  Ya has calificado a tu profesor(a).
                </h2>
                <p className="text-gray-700">
                  Solo se permite una calificación por Proyecto.
                </p>
              </>
            ) : sinProfesorAsignado ? (
              <>
                <h2 className="text-red-600 font-semibold text-xl mb-2">
                  Aún no tienes un profesor asesor asignado.
                </h2>
                <p className="text-gray-700">
                  No es posible calificar hasta que la coordinación te asigne un
                  profesor asesor para tu proyecto.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-red-600 font-semibold text-xl mb-2">
                  Lo sentimos, no cumples los requisitos para calificar.
                </h2>
                <p className="text-gray-700">
                  Debes tener un proyecto asociado para poder calificar a tu
                  profesor asesor.
                </p>
              </>
            )}

            <button
              onClick={() => navigate("/menuEstudiante")}
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
   * 10) Si isAllowed => renderizamos el formulario
   */
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderEstudiante title="Calificar Profesor Asesor" />

      <Modal modalRef={modalConf} title={<h5>Calificar Profesor Asesor</h5>} onAccept={() => handleSubmit()}>
        <p>¿Está seguro que desea enviar esta calificación?</p>
        <p>Una vez enviada, no podrá modificarla.</p>
      </Modal>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleModal} className="bg-white rounded-lg shadow-md p-6">
          {/* Service Ratings Section */}
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Evaluación de los Criterios
            </h2>

            {criteria.map((crit) => (
              <div key={crit.id} className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  {React.createElement(crit.icon, {
                    className: "w-5 h-5 mr-2 text-blue-500"
                  })}
                  {crit.label}
                </label>
                <RatingStars
                  value={formData.serviceRatings[crit.id]}
                  onChange={(val) => handleServiceRatingChange(crit.id, val)}
                />
              </div>
            ))}
          </div>

          {/* Recommendation Score (ej. 1..5 or 0..10) */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ¿Recomendaría a este profesor?
            </h2>
            <div className="flex gap-4">
              <RatingStars
                value={formData.recommendationScore}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    recommendationScore: val
                  }))
                }
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Califica cuán probable es que recomiendes al profesor (1-5).
            </p>
          </div>

          {/* Overall Rating (starRating) */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Calificación General
            </h2>
            <RatingStars
              value={formData.starRating}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  starRating: val
                }))
              }
            />
          </div>

          {/* Additional Comments */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Comentarios Adicionales (Opcional)
            </h2>
            <textarea
              value={formData.additionalComments}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  additionalComments: e.target.value
                }))
              }
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Escriba sus comentarios aquí..."
            />
          </div>

          {/* Updated Submit Button with loading state */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                flex items-center px-6 py-3 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-colors
                ${isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Evaluación
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default ProfessorEvaluationForm;
