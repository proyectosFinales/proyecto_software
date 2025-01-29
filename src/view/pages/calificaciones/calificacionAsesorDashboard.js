import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  Star,
  Users,
  ThumbsUp,
  TrendingUp,
  Download,
  Search,
  Loader,
  Award,
  AlertTriangle
} from 'lucide-react';

import HeaderCoordinador from '../../components/HeaderCoordinador';
import Footer from '../../components/Footer';
import supabase from '../../../model/supabase';

/** Import aggregator/controller functions */
import {
  fetchAllCalificaciones,
  fetchDashboardStats,
  fetchSemesterRatingTrend,
  fetchCriteriaBreakdown,
  fetchPieData,
  fetchRecommendationDistribution,
  fetchStarRatingDistribution,
  fetchRecentComments
} from '../../../controller/calificacionesController';

const DetailedCalificacionesDashboard = () => {
  // -----------------------------------------
  // States for professor list / selection
  // -----------------------------------------
  const [professors, setProfessors] = useState([]);
  const [selectedProfessorId, setSelectedProfessorId] = useState(''); // empty => all

  // Loading indicator
  const [isLoading, setIsLoading] = useState(false);

  // Aggregated stats & chart data
  const [stats, setStats] = useState(null);
  const [semesterTrend, setSemesterTrend] = useState([]);
  const [criteriaBreakdown, setCriteriaBreakdown] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [recDist, setRecDist] = useState([]);
  const [starDist, setStarDist] = useState([]);
  const [recentComments, setRecentComments] = useState([]);

  // The raw calificaciones for the selected professor (or all if none selected)
  const [calificaciones, setCalificaciones] = useState([]);

  // Extra analysis: monthly criterion data, best/worst criterion
  const [monthlyCriterionData, setMonthlyCriterionData] = useState([]);
  const [bestCriterion, setBestCriterion] = useState(null);
  const [worstCriterion, setWorstCriterion] = useState(null);

  // Table search
  const [searchTerm, setSearchTerm] = useState('');

  // Add these utility functions
  const getColorForScore = (score) => {
    if (score >= 4.5) return '#22c55e'; // green-500
    if (score >= 4.0) return '#3b82f6'; // blue-500
    if (score >= 3.0) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const calculateConsistencyScore = (criteria) => {
    if (!criteria || criteria.length === 0) return 0;
    const values = criteria.map(c => c.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
    // Convert variance to a 0-100 score (lower variance = higher consistency)
    return Math.round(Math.max(0, 100 - (variance * 20)));
  };

  const calculateResponseRate = (stats) => {
    if (!stats) return 0;
    return Math.round((stats.totalReviews / (stats.totalReviews + 5)) * 100);
  };

  const calculateSatisfactionScore = (stats) => {
    if (!stats) return 0;
    return Math.round((stats.averageRating / 5) * 100);
  };

  // -----------------------------------------
  // 1) Load the list of all professors once
  // -----------------------------------------
  useEffect(() => {
    const loadProfessors = async () => {
      try {
        const { data, error } = await supabase
          .from('Profesor')
          .select(`
            profesor_id,
            id_usuario,
            Usuario (
              nombre
            )
          `);
        if (error) throw error;

        const mapped = (data || []).map((p) => ({
          profesor_id: p.profesor_id,
          name: p.Usuario?.nombre || `Profesor #${p.profesor_id.slice(0, 8)}`
        }));

        setProfessors(mapped);
      } catch (err) {
        console.error('Error loading professors:', err.message);
      }
    };
    loadProfessors();
  }, []);

  // -----------------------------------------
  // 2) Load aggregator data whenever professor changes
  //    (blank professor => 'All' stats & data)
  // -----------------------------------------
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // If no professor is selected => all
        const professorId = selectedProfessorId || undefined;

        // 1) Basic stats
        const s = await fetchDashboardStats({ professorId });
        setStats(s);

        // 2) Trend by semester
        const trend = await fetchSemesterRatingTrend({ professorId });
        setSemesterTrend(trend);

        // 3) Criteria breakdown
        const crit = await fetchCriteriaBreakdown({ professorId });
        setCriteriaBreakdown(crit);

        // 4) Pie data (1 => yes, else => no)
        const pie = await fetchPieData({ professorId });
        setPieData(pie);

        // 5) Distribution of recomendacion (1..5)
        const rDist = await fetchRecommendationDistribution({ professorId });
        setRecDist(rDist);

        // 6) Distribution of star_rating (1..5)
        const sDist = await fetchStarRatingDistribution({ professorId });
        setStarDist(sDist);

        // 7) Recent comments
        const comments = await fetchRecentComments({ professorId });
        setRecentComments(comments);

        // 8) All calificaciones (raw data)
        const allCals = await fetchAllCalificaciones({ professorId });
        setCalificaciones(allCals || []);

        // 9) Additional analysis
        processMonthlyCriterionTrends(allCals || []);
        processBestWorstCriterion(crit);
      } catch (err) {
        console.error('Error loading data:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedProfessorId]);

  // -----------------------------------------
  // Helper: group calificaciones by (YYYY-MM),
  // then compute average for each criterion
  // -----------------------------------------
  const processMonthlyCriterionTrends = (cals) => {
    if (!cals || cals.length === 0) {
      setMonthlyCriterionData([]);
      return;
    }

    // { 'YYYY-MM': array of calificaciones }
    const monthlyMap = {};
    cals.forEach((cal) => {
      if (!cal.fecha_calificacion) return;
      const dateObj = new Date(cal.fecha_calificacion);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;

      if (!monthlyMap[key]) monthlyMap[key] = [];
      monthlyMap[key].push(cal);
    });

    // Summaries for each month
    const results = Object.keys(monthlyMap).sort().map((monthKey) => {
      const arr = monthlyMap[monthKey];
      const count = arr.length;
      if (count === 0) {
        return { month: monthKey };
      }

      let sumAgilidad = 0, sumEmpatia = 0, sumRespeto = 0,
          sumComun = 0, sumAclara = 0, sumResp = 0,
          sumCorr = 0, sumExp = 0, sumRetro = 0;

      arr.forEach((cal) => {
        sumAgilidad += cal.score_agilidad || 0;
        sumEmpatia += cal.score_empatia || 0;
        sumRespeto += cal.score_respeto || 0;
        sumComun += cal.score_comunicacion || 0;
        sumAclara += cal.score_aclaracion || 0;
        sumResp += cal.score_respuestas || 0;
        sumCorr += cal.score_correccion || 0;
        sumExp += cal.score_explicacion || 0;
        sumRetro += cal.score_retroalimentacion || 0;
      });

      return {
        month: monthKey,
        agilidad: +(sumAgilidad / count).toFixed(2),
        empatia: +(sumEmpatia / count).toFixed(2),
        respeto: +(sumRespeto / count).toFixed(2),
        comunicacion: +(sumComun / count).toFixed(2),
        aclaracion: +(sumAclara / count).toFixed(2),
        respuestas: +(sumResp / count).toFixed(2),
        correccion: +(sumCorr / count).toFixed(2),
        explicacion: +(sumExp / count).toFixed(2),
        retro: +(sumRetro / count).toFixed(2)
      };
    });

    setMonthlyCriterionData(results);
  };

  // -----------------------------------------
  // Helper: find best/worst criterion from
  // the bar chart data (criteriaBreakdown)
  // -----------------------------------------
  const processBestWorstCriterion = (criteriaData) => {
    if (!criteriaData || criteriaData.length === 0) {
      setBestCriterion(null);
      setWorstCriterion(null);
      return;
    }
    // e.g. { name: 'Agilidad', value: 4.2 }
    let best = criteriaData[0];
    let worst = criteriaData[0];

    criteriaData.forEach((c) => {
      if (c.value > best.value) best = c;
      if (c.value < worst.value) worst = c;
    });

    setBestCriterion(best);
    setWorstCriterion(worst);
  };

  // -----------------------------------------
  // Filter calificaciones by search
  // -----------------------------------------
  const filteredCalificaciones = calificaciones.filter((cal) => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    const profName = cal.Profesor?.Usuario?.nombre?.toLowerCase() || '';
    const comments = cal.comentarios?.toLowerCase() || '';
    return profName.includes(lower) || comments.includes(lower);
  });

  // -----------------------------------------
  // Export CSV for the filtered entries
  // -----------------------------------------
  const handleExportCSV = () => {
    const headers = [
      'Profesor',
      'Score Agilidad',
      'Score Empatía',
      'Score Respeto',
      'Score Comunicación',
      'Score Aclaración',
      'Score Respuestas',
      'Score Corrección',
      'Score Explicación',
      'Score Retroalimentación',
      'Recomendación',
      'Estrellas',
      'Comentarios',
      'Fecha'
    ];

    const rows = filteredCalificaciones.map((cal) => {
      const profName = cal.Profesor?.Usuario?.nombre || 'Desconocido';
      const agi = cal.score_agilidad || 0;
      const emp = cal.score_empatia || 0;
      const rsp = cal.score_respeto || 0;
      const com = cal.score_comunicacion || 0;
      const acl = cal.score_aclaracion || 0;
      const res = cal.score_respuestas || 0;
      const cor = cal.score_correccion || 0;
      const exp = cal.score_explicacion || 0;
      const ret = cal.score_retroalimentacion || 0;
      const rec = cal.recomendacion || 0;
      const star = cal.star_rating || 0;
      const cmt = cal.comentarios
        ? `"${cal.comentarios.replace(/"/g, '""')}"`
        : '';
      const date = cal.fecha_calificacion
        ? new Date(cal.fecha_calificacion).toLocaleDateString()
        : 'N/A';

      return [
        profName,
        agi,
        emp,
        rsp,
        com,
        acl,
        res,
        cor,
        exp,
        ret,
        rec,
        star,
        cmt,
        date
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'calificaciones_dashboard.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // -----------------------------------------
  // Recharts styles
  // -----------------------------------------
  const axisStyle = { fontSize: 12, fill: '#4B5563' };
  const legendStyle = { fontSize: 12 };
  const tooltipStyle = { fontSize: 12 };

  // Render a stats card
  const renderStatsCard = (title, value, icon, trend = null) => (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-sm 
                    hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`mt-1 text-sm ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs anterior
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );

  // Update the insights card render
  const renderInsights = (bestCriterion, worstCriterion) => (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-sm space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        Insights
      </h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-green-800">Punto Más Fuerte</h3>
          </div>
          <p className="mt-2 text-green-700">
            {bestCriterion.name}
            <span className="ml-2 font-semibold">
              ({bestCriterion.value.toFixed(1)}/5)
            </span>
          </p>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-medium text-amber-800">Área de Mejora</h3>
          </div>
          <p className="mt-2 text-amber-700">
            {worstCriterion.name}
            <span className="ml-2 font-semibold">
              ({worstCriterion.value.toFixed(1)}/5)
            </span>
          </p>
        </div>
      </div>
    </div>
  );

  // Figure out the professor's name if one is selected
  const selectedProfessor = professors.find(
    (p) => p.profesor_id === selectedProfessorId
  );
  const profName = selectedProfessor?.name || '';

  // -----------------------------------------
  // UI Rendering
  // -----------------------------------------
  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderCoordinador title="Dashboard de Calificaciones" />

      <main className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        {/* Title + Professor Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {selectedProfessorId === ''
              ? 'Dashboard General'
              : `Dashboard: ${profName}`}
          </h1>

          <div className="w-full sm:w-auto max-w-md">
            <select
              className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm
                       focus:border-blue-500 focus:ring-blue-500 
                       bg-white transition-colors duration-200"
              value={selectedProfessorId}
              onChange={(e) => setSelectedProfessorId(e.target.value)}
            >
              <option value="">(Todos los Profesores)</option>
              {professors.map((p) => (
                <option key={p.profesor_id} value={p.profesor_id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-3 text-gray-600">
              <Loader className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-lg">Cargando datos...</span>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderStatsCard(
                "Calificación Promedio",
                stats.averageRating.toFixed(1),
                <Star className="w-6 h-6 text-blue-500" />,
                5.2
              )}
              {renderStatsCard(
                "Total Evaluaciones",
                stats.totalReviews,
                <Users className="w-6 h-6 text-blue-500" />
              )}
              {renderStatsCard(
                "Recomendación",
                stats.recommendationScore.toFixed(1),
                <ThumbsUp className="w-6 h-6 text-blue-500" />,
                -2.1
              )}
              {renderStatsCard(
                "Progreso Semestre",
                `${stats.semesterProgress.percentage}%`,
                <TrendingUp className="w-6 h-6 text-blue-500" />
              )}
            </div>

            {/* Insights */}
            {bestCriterion && worstCriterion && renderInsights(bestCriterion, worstCriterion)}

            {/* Advanced Analytics Section */}
            <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance Overview Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  Resumen de Desempeño
                </h3>
                <div className="space-y-4">
                  {criteriaBreakdown.map((criterion, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700">{criterion.name}</span>
                        <span className="font-semibold text-gray-900">{criterion.value.toFixed(1)}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(criterion.value / 5) * 100}%`,
                            backgroundColor: getColorForScore(criterion.value)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar Chart for Skills */}
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Gráfico de Habilidades
                </h3>
                {criteriaBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart outerRadius={90} data={criteriaBreakdown}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} />
                      <Radar
                        name="Puntuación"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={legendStyle} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-gray-500">No hay datos disponibles.</p>
                )}
              </div>

              {/* Key Statistics */}
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-500" />
                  Estadísticas Clave
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Promedio General</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {(criteriaBreakdown.reduce((acc, curr) => acc + curr.value, 0) / 
                        criteriaBreakdown.length).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">Criterios Destacados</p>
                    <p className="text-2xl font-bold text-green-700">
                      {criteriaBreakdown.filter(c => c.value >= 4).length}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-sm text-amber-600 font-medium">Criterios a Mejorar</p>
                    <p className="text-2xl font-bold text-amber-700">
                      {criteriaBreakdown.filter(c => c.value < 3).length}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 font-medium">Consistencia</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {calculateConsistencyScore(criteriaBreakdown)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations Summary */}
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-blue-500" />
                  Resumen de Recomendaciones
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Recomendaciones Positivas</p>
                      <p className="text-2xl font-bold text-green-700">
                        {pieData.find(d => d.name === "Recomienda")?.value || 0}
                      </p>
                    </div>
                    <ThumbsUp className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Tasa de Respuesta</p>
                      <p className="text-xl font-bold text-blue-700">
                        {calculateResponseRate(stats)}%
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Satisfacción</p>
                      <p className="text-xl font-bold text-purple-700">
                        {calculateSatisfactionScore(stats)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend by Semester */}
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Tendencia por Semestre (Star Rating)
                </h3>
                {semesterTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={semesterTrend}
                      margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semester" tick={axisStyle} />
                      <YAxis domain={[0, 5]} tick={axisStyle} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={legendStyle} />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Rating"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-gray-500">No hay datos de tendencia.</p>
                )}
              </div>

              {/* Criteria Breakdown */}
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Desglose por Criterio
                </h3>
                {criteriaBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={criteriaBreakdown}
                      layout="vertical"
                      margin={{ top: 20, right: 20, left: 80, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 5]} tick={axisStyle} />
                      <YAxis dataKey="name" type="category" tick={axisStyle} width={100} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={legendStyle} />
                      <Bar dataKey="value" fill="#3b82f6" name="Promedio" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-gray-500">No hay datos de criterios.</p>
                )}
              </div>

              {/* Pie (Sí/No) */}
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Recomienda (Sí / No)
                </h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        <Cell fill="#22c55e" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={legendStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-gray-500">No hay datos (Sí/No).</p>
                )}
              </div>

              {/* Recommendation Distribution */}
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Distribución de Recomendaciones (1..5)
                </h3>
                {recDist.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={recDist}
                        dataKey="count"
                        nameKey="score"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `Rec ${entry.score}: ${entry.count}`}
                      >
                        {recDist.map((entry, i) => (
                          <Cell key={i} fill={entry.color || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={legendStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-gray-500">No hay distribución de recomendación.</p>
                )}
              </div>

              {/* Star Rating Distribution */}
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Distribución de Calificaciones (Estrellas)
                </h3>
                {starDist.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={starDist}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="star" tick={axisStyle} />
                      <YAxis tick={axisStyle} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={legendStyle} />
                      <Bar dataKey="count" fill="#f97316" name="# Evaluaciones" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-gray-500">No hay datos de estrellas.</p>
                )}
              </div>

              {/* Recent Comments */}
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow col-span-1 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Comentarios Recientes
                </h3>
                {recentComments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentComments.map((comment, idx) => (
                      <div key={idx} className="border-l-4 border-blue-500 pl-4">
                        <p className="text-sm text-gray-600">"{comment.text}"</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {comment.semesterName} · {comment.date}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay comentarios recientes.</p>
                )}
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Detalle de Calificaciones
                </h3>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg
                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white
                             rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Exportar CSV
                  </button>
                </div>
              </div>

              {/* Replace the table placeholder with: */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agilidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empatía</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respeto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comunicación</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aclaración</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respuestas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Corrección</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Explicación</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retroalimentación</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recom.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estrellas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentarios</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCalificaciones.map((cal) => {
                      const profName = cal.Profesor?.Usuario?.nombre || 'Desconocido';
                      const date = cal.fecha_calificacion
                        ? new Date(cal.fecha_calificacion).toLocaleDateString()
                        : 'N/A';

                      return (
                        <tr key={cal.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{profName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cal.score_agilidad ?? 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cal.score_empatia ?? 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cal.score_respeto ?? 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cal.score_comunicacion ?? 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cal.score_aclaracion ?? 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cal.score_respuestas ?? 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cal.score_correccion ?? 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cal.score_explicacion ?? 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cal.score_retroalimentacion ?? 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cal.recomendacion ?? 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cal.star_rating ?? 0}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {cal.comentarios
                              ? cal.comentarios.slice(0, 100)
                              : 'Sin comentarios'}
                            {cal.comentarios && cal.comentarios.length > 100 ? '...' : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DetailedCalificacionesDashboard;

                