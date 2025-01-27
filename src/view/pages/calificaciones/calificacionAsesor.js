// src/view/pages/calificaciones/calificacionAsesor.js
import React, { useState } from 'react';
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

// Ajusta la ruta si tu controlador está en otra carpeta:
import { calificarProfesor } from '../../../controller/calificacionController'; 

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
    recommendationScore: 0,  // Valor de 0 a 10
    starRating: 0,           // Valor de 1 a 5
    additionalComments: ''
  });

  /**
   * 4) Lista de criterios para iterar en el UI (cada uno con id, label, icon).
   */
  const criteria = [
    { id: 'agilidad', label: 'Agilidad en la atención de consultas', icon: Clock },
    { id: 'empatia', label: 'Demuestra Empatía', icon: Heart },
    { id: 'respeto', label: 'Demuestra respeto', icon: Shield },
    { id: 'comunicacion', label: 'Utiliza los canales de Comunicación Oficiales', icon: MessageCircle },
    { id: 'aclaracion', label: 'Aclara las dudas planteadas', icon: HelpCircle },
    { id: 'respuestas', label: 'Dirige las respuestas a las preguntas de una manera clara', icon: CheckCircle2 },
    { id: 'correccion', label: 'Corrige de forma justificada', icon: BookOpen },
    { id: 'explicacion', label: 'Explica claramente en que consisten sus observaciones', icon: BrainCircuit },
    { id: 'retroalimentacion', label: 'Entrega retroalimentación a tiempo', icon: MessageSquare }
  ];

  /**
   * 5) Manejador de cambios de "radio" en cada criterio
   */
  const handleServiceRating = (criteriaId, value) => {
    setFormData(prev => ({
      ...prev,
      serviceRatings: {
        ...prev.serviceRatings,
        [criteriaId]: value
      }
    }));
  };

  /**
   * 6) Manejador de "submit" (cuando el usuario presiona "Enviar Evaluación")
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Llamamos a la función del controller para insertar la calificación,
      // asumiendo que el semestre actual es "1"; ajústalo si corresponde.
      await calificarProfesor(formData, estudianteID, 1);

      alert('Calificación guardada exitosamente');
      // Redirigimos a alguna parte, por ejemplo, menúEstudiante:
      navigate('/menuEstudiante');
    } catch (error) {
      alert('Error al enviar la calificación: ' + error.message);
      console.error(error);
    }
  };

  /**
   * Render completo de la página
   */
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderEstudiante title="Evaluación del Profesor" />

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 mb-16">
        {/* Botón de Volver */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sección de evaluación de criterios */}
            <div className="bg-white rounded-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
                Evaluación de Criterios
              </h2>
              <p className="text-gray-600 mb-4 italic">
                Utilizando una Escala del 1 al 5 donde 1 es "Totalmente en Desacuerdo" y 5 "Totalmente De acuerdo".
              </p>

              <div className="space-y-6">
                {criteria.map((criterion) => {
                  const Icon = criterion.icon;
                  return (
                    <div
                      key={criterion.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors"
                    >
                      <div className="flex items-center mb-4 sm:mb-0 sm:w-1/2">
                        <Icon className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                        <label className="text-gray-700">
                          {criterion.label}
                        </label>
                      </div>
                      <div className="flex justify-between sm:justify-end sm:w-1/2 space-x-4">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <label
                            key={value}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={criterion.id}
                              value={value}
                              onChange={() => handleServiceRating(criterion.id, value)}
                              className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {value}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sección de Probabilidad de Recomendación (0 a 10) */}
            <div className="bg-white rounded-lg pt-6">
              <div className="flex items-center mb-4">
                <ThumbsUp className="w-6 h-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-800">
                  Probabilidad de Recomendación
                </h2>
              </div>
              <p className="text-gray-600 mb-4 italic">
                ¿Qué probabilidades hay de que recomiende al profesor(a) a otros estudiantes?
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-between items-center">
                {[...Array(11)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      recommendationScore: i
                    }))}
                    className={`w-12 h-12 rounded-lg border transition-all duration-200 ${
                      formData.recommendationScore === i
                        ? 'bg-blue-600 text-white border-blue-600 transform scale-110'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>Nada probable</span>
                <span>Muy probable</span>
              </div>
            </div>

            {/* Sección de Estrellas (1 a 5) */}
            <div className="bg-white rounded-lg pt-6">
              <div className="flex items-center mb-4">
                <Star className="w-6 h-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-800">
                  Evaluación General
                </h2>
              </div>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      starRating: star
                    }))}
                    className="focus:outline-none transform transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= formData.starRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Sección de Comentarios Adicionales */}
            <div className="bg-white rounded-lg pt-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-800">
                  Comentarios Adicionales
                </h2>
              </div>
              <textarea
                value={formData.additionalComments}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  additionalComments: e.target.value
                }))}
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Escriba sus comentarios aquí..."
              />
            </div>

            {/* Botón de Enviar */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           transition-colors duration-200 transform hover:scale-105"
              >
                <Send className="w-5 h-5 mr-2" />
                Enviar Evaluación
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfessorEvaluationForm;
