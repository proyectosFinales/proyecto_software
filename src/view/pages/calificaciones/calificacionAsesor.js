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
  ArrowLeft,
  Loader
} from 'lucide-react';
import HeaderEstudiante from '../../components/HeaderEstudiante';
import Footer from '../../components/Footer';
import { calificarProfesor } from '../../../controller/calificacionesController';
import { successToast, errorToast } from '../../components/toast';
import supabase from '../../../model/supabase'; // Para verificar si ya calificó

const ProfessorEvaluationForm = () => {
  /**
   * 1) El ID del usuario guardado en la sesión (rol=3 => Estudiante).
   */
  const usuarioId = sessionStorage.getItem('token');
  const navigate = useNavigate();

  /**
   * 2) Estados para habilitar/deshabilitar calificación
   */
  const [isAllowed, setIsAllowed] = useState(null);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

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

  /**
   * 7) useEffect para: 
   *    - encontrar Estudiante
   *    - revisar estado
   *    - encontrar Proyecto en este semestre => estado
   *    - ver si ya existe Calificacion => no permitir
   */
  useEffect(() => {
    const verificarPermisos = async () => {
      setIsCheckingPermissions(true);
      console.log("[CalificacionAsesor] --> Iniciando verificarPermisos()");
      console.log("[CalificacionAsesor] usuarioId:", usuarioId);
      try {
        // 1) Buscar Estudiante
        console.log("[CalificacionAsesor] Step 1) Buscar Estudiante por id_usuario");
        const { data: estRow, error: eError } = await supabase
          .from("Estudiante")
          .select("estudiante_id, estado")
          .eq("id_usuario", usuarioId)
          .single();

        if (eError) {
          console.error("[CalificacionAsesor] Error fetching Estudiante:", eError);
          throw eError;
        }
        if (!estRow) {
          console.log("[CalificacionAsesor] No se encontró Estudiante => isAllowed=false");
          setIsAllowed(false);
          return;
        }
        console.log("[CalificacionAsesor] Estudiante data:", estRow);
        const { estudiante_id, estado } = estRow;
        const estadoEstudiante = (estado || "").toLowerCase();
        const isEstudianteOk = (estadoEstudiante === "aprobado" || estadoEstudiante === "reprobado");
        console.log("[CalificacionAsesor] estadoEstudiante:", estadoEstudiante, " isEstudianteOk:", isEstudianteOk);

        // 2) Buscar TODOS los proyectos (sin filtrar semestre_id, same as MenuPrincipalEstudiante)
        console.log("[CalificacionAsesor] Buscando proyectos con .eq('estudiante_id', estudiante_id):", estudiante_id);
        const { data: proyectos, error: pError } = await supabase
          .from("Proyecto")
          .select("id, estado, profesor_id, semestre_id")
          .eq("estudiante_id", estudiante_id);

        if (pError) {
          console.error("[CalificacionAsesor] Error fetching Proyectos:", pError);
          throw pError;
        }
        console.log("[CalificacionAsesor] Proyectos encontrados:", proyectos);
        if (!proyectos || proyectos.length === 0) {
          console.log("[CalificacionAsesor] No hay proyectos => isAllowed=false");
          setIsAllowed(false);
          return;
        }

        // Buscar si al menos 1 proyecto está "aprobado" o "reprobado"
        const proyectoApto = proyectos.find((p) => {
          const st = (p.estado || "").toLowerCase();
          return st === "aprobado" || st === "reprobado";
        });

        if (!isEstudianteOk || !proyectoApto) {
          console.log("[CalificacionAsesor] Estudiante/proyecto no apto => isAllowed=false");
          setIsAllowed(false);
          return;
        }

        // 3) Ver si ya hay calificacion
        console.log("[CalificacionAsesor] Revisar Calificacion => proyecto:", proyectoApto.id, "estudiante:", estudiante_id);
        const { data: califRow, error: cError } = await supabase
          .from("Calificacion")
          .select("id")
          .eq("proyecto_id", proyectoApto.id)
          .eq("estudiante_id", estudiante_id)
          .maybeSingle();

        if (cError) {
          console.error("[CalificacionAsesor] Error buscando Calificacion:", cError);
          throw cError;
        }

        console.log("[CalificacionAsesor] Calificacion encontrada?:", califRow);
        if (califRow) {
          console.log("[CalificacionAsesor] Estudiante ya calificó => set isAllowed(false), setAlreadyRated(true)");
          setIsAllowed(false);
          setAlreadyRated(true);
          return;
        }

        console.log("[CalificacionAsesor] Todo OK => setIsAllowed(true).");
        setIsAllowed(true);
      } catch (err) {
        console.error("[CalificacionAsesor] Error en verificarPermisos:", err);
        setIsAllowed(false);
      } finally {
        setIsCheckingPermissions(false);
      }
    };

    verificarPermisos();
  }, [usuarioId]);

  /**
   * 8) handleSubmit => llama a calificarProfesor(...) si isAllowed, 
   *    luego ya no podrá calificar => forcibly set isAllowed(false).
   */
  const confirmSubmit = () => {
    return window.confirm(
      "¿Está seguro que desea enviar esta calificación?\n\n" +
      "Una vez enviada, no podrá modificarla."
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[CalificacionAsesor] handleSubmit => isAllowed?", isAllowed);
    
    if (!isAllowed) {
      console.warn("[CalificacionAsesor] No está permitido calificar. Exiting...");
      errorToast("No está permitido calificar en este momento.");
      return;
    }

    // Show confirmation dialog
    if (!confirmSubmit()) {
      return;
    }

    try {
      setIsSubmitting(true); // Start loading
      console.log("[CalificacionAsesor] Enviando calificación con formData:", formData);
      
      // Show "uploading" toast
      successToast("Subiendo su calificación...", { autoClose: false });
      
      await calificarProfesor(formData, usuarioId);
      
      // Success! Show completion toast
      successToast("¡Calificación enviada con éxito!", { autoClose: 3000 });
      
      console.log("[CalificacionAsesor] Calificación insertada => setIsAllowed(false), go to /menuEstudiante.");
      setIsAllowed(false);
      setAlreadyRated(true);
      navigate("/menuEstudiante");
    } catch (error) {
      console.error("[CalificacionAsesor] Error al calificarProfesor:", error);
      errorToast(error.message || "Error enviando la calificación.");
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  /**
   * 9) Si el usuario NO está permitido => mostramos mensaje,
   *    Si es por "alreadyRated", mensaje distinto.
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
            ) : (
              <>
                <h2 className="text-red-600 font-semibold text-xl mb-2">
                  Lo sentimos, no cumples los requisitos para calificar.
                </h2>
                <p className="text-gray-700">
                  Debes tener un proyecto con estado "Aprobado" o "Reprobado" y 
                  tu estado de Estudiante debe ser "Aprobado" o "Reprobado" 
                  para poder calificar.
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

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
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
              Comentarios Adicionales
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
