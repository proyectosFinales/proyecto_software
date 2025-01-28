/**
 * file: src/view/pages/calificaciones/DetailedCalificacionesDashboard.jsx
 *
 * A single-filter-panel dashboard that updates charts, stats, and table
 * whenever the user changes "Semestre," "Profesor," or the search term.
 */

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  Download,
  Search,
  Loader
} from 'lucide-react';

import HeaderCoordinador from '../../components/HeaderCoordinador';
import Footer from '../../components/Footer';
import supabase from '../../../model/supabase';

// Import aggregator functions from your controller
import {
  fetchAllCalificaciones,
  fetchDashboardStats,
  fetchSemesterRatingTrend,
  fetchCriteriaBreakdown,
  fetchPieData,
  fetchRecommendationDistribution,
  fetchRecentComments,
  fetchProfessorRanking,
  fetchStarRatingDistribution
} from '../../../controller/calificacionesController';

const DetailedCalificacionesDashboard = () => {
  // ----------------- FILTER & STATE -----------------
  const [isLoading, setIsLoading] = useState(true);

  // Basic filters
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [professors, setProfessors] = useState([]);
  const [selectedProfessorId, setSelectedProfessorId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Data for stats cards
  const [statsData, setStatsData] = useState({
    averageRating: 0,
    totalReviews: 0,
    recommendationScore: 0,
    responseRate: 0,
    semesterProgress: { current: 0, total: 0, percentage: 0 }
  });

  // For "comparison vs. last semester," placeholders or real data
  const [prevSemesterComparison, setPrevSemesterComparison] = useState({
    averageRatingDiff: 0.0,
    recommendationDiff: 0.0
  });

  // Charts / aggregator data
  const [semesterTrend, setSemesterTrend] = useState([]);
  const [criteriaBreakdown, setCriteriaBreakdown] = useState([]);
  const [recommendationDist, setRecommendationDist] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [starDist, setStarDist] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [professorRanking, setProfessorRanking] = useState([]);

  // Full calificaciones table
  const [califications, setCalifications] = useState([]);

  // ----------------- LOAD FILTER OPTIONS ON MOUNT -----------------
  useEffect(() => {
    const fetchInitialFilters = async () => {
      try {
        // 1) Semestres
        const { data: semData, error: semErr } = await supabase
          .from('Semestre')
          .select('semestre_id, nombre, activo');
        if (semErr) throw semErr;
        setSemesters(semData || []);

        // 2) Profesores
        const { data: profData, error: profErr } = await supabase
          .from('Profesor')
          .select(`
            profesor_id,
            id_usuario,
            Usuario: id_usuario ( nombre )
          `);
        if (profErr) throw profErr;

        const mappedProfs = (profData || []).map((p) => ({
          profesor_id: p.profesor_id,
          name: p.Usuario?.nombre || `Profesor #${p.profesor_id.slice(0, 8)}`
        }));
        setProfessors(mappedProfs);
      } catch (err) {
        console.error("[Dashboard] Error loading filter data:", err);
      }
    };
    fetchInitialFilters();
  }, []);

  // ----------------- REFRESH DATA WHEN FILTERS CHANGE -----------------
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Convert "all" => undefined for aggregator calls
      const semesterId = selectedSemester !== 'all' ? parseInt(selectedSemester) : undefined;
      const professorId = selectedProfessorId !== 'all' ? selectedProfessorId : undefined;

      try {
        // 1) Dashboard stats
        const stats = await fetchDashboardStats({ semesterId, professorId });
        setStatsData(stats);

        // 2) Semester Trend
        const trend = await fetchSemesterRatingTrend({ professorId });
        setSemesterTrend(trend);

        // 3) Criteria Breakdown
        const crit = await fetchCriteriaBreakdown({ semesterId, professorId });
        setCriteriaBreakdown(crit);

        // 4) Pie data (simple yes/no) + distribution data
        const pData = await fetchPieData({ semesterId, professorId });
        setPieData(pData || []);

        const recDist = await fetchRecommendationDistribution({ semesterId, professorId });
        setRecommendationDist(recDist);

        // 5) Star Rating Distribution
        const stDist = await fetchStarRatingDistribution({ semesterId, professorId });
        setStarDist(stDist);

        // 6) Recent Comments
        const comm = await fetchRecentComments({ semesterId, professorId });
        setRecentComments(comm);

        // 7) Professor Ranking
        const ranking = await fetchProfessorRanking({ semesterId });
        setProfessorRanking(ranking);

        // 8) Detailed Table
        const allCals = await fetchAllCalificaciones({ professorId, semesterId });
        setCalifications(allCals || []);

        // 9) Optional: fetch stats for previous semester
        if (semesterId) {
          const prevStats = await fetchDashboardStats({
            semesterId: semesterId - 1,
            professorId
          });
          setPrevSemesterComparison({
            averageRatingDiff: stats.averageRating - prevStats.averageRating,
            recommendationDiff: stats.recommendationScore - prevStats.recommendationScore
          });
        } else {
          setPrevSemesterComparison({ averageRatingDiff: 0.0, recommendationDiff: 0.0 });
        }

      } catch (err) {
        console.error("[Dashboard] Error loading aggregator data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedSemester, selectedProfessorId]);

  // ----------------- FILTERING / SEARCH FOR TABLE -----------------
  const filteredCalifications = califications.filter((cal) => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    const profName = cal.Profesor?.Usuario?.nombre?.toLowerCase() || '';
    const comments = cal.comentarios?.toLowerCase() || '';
    return profName.includes(lower) || comments.includes(lower);
  });

  // ----------------- EXPORT FUNCTIONALITY -----------------
  const handleExport = () => {
    const headers = ["Profesor", "Estrellas", "Recomendacion", "Comentarios", "Fecha"];
    const rows = filteredCalifications.map((cal) => {
      const profName = cal.Profesor?.Usuario?.nombre || "Desconocido";
      const stars = cal.star_rating || 0;
      const rec = cal.recomendacion || 0;
      const comments = cal.comentarios
        ? `"${cal.comentarios.replace(/"/g, '""')}"`
        : "";
      const date = cal.fecha_calificacion
        ? new Date(cal.fecha_calificacion).toLocaleDateString()
        : "N/A";
      return [profName, stars, rec, comments, date].join(",");
    });

    const csvContent = [
      headers.join(","), 
      ...rows
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "calificaciones_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ----------------- RENDER FILTERS -----------------
  const renderFilters = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* SEMESTRE */}
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700">Semestre</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                       focus:border-blue-500 focus:ring-blue-500"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="all">(Todos)</option>
            {semesters.map((sem) => (
              <option key={sem.semestre_id} value={sem.semestre_id}>
                {sem.nombre || `Semestre #${sem.semestre_id}`}
              </option>
            ))}
          </select>
        </div>

        {/* PROFESOR */}
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700">Profesor</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                       focus:border-blue-500 focus:ring-blue-500"
            value={selectedProfessorId}
            onChange={(e) => setSelectedProfessorId(e.target.value)}
          >
            <option value="all">(Todos)</option>
            {professors.map((p) => (
              <option key={p.profesor_id} value={p.profesor_id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700">Búsqueda</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              className="block w-full rounded-md border-gray-300
                         focus:border-blue-500 focus:ring-blue-500"
              placeholder="Buscar en comentarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* EXPORT BUTTON */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-center">
          <button
            className="flex items-center px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>
    );
  };

  // ----------------- STATS CARDS -----------------
  const renderStatsCards = () => {
    const {
      averageRating,
      totalReviews,
      recommendationScore,
      responseRate,
      semesterProgress
    } = statsData;

    const { averageRatingDiff, recommendationDiff } = prevSemesterComparison;
    const avgDiffSign = averageRatingDiff >= 0 ? "↑" : "↓";
    const recDiffSign = recommendationDiff >= 0 ? "↑" : "↓";

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 1) Calificación Promedio */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Calificación Promedio</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {averageRating.toFixed(1)}
          </p>
          <div
            className="mt-2 text-sm"
            style={{ color: averageRatingDiff >= 0 ? "green" : "red" }}
          >
            {`${avgDiffSign} ${Math.abs(averageRatingDiff).toFixed(2)} vs. semestre anterior`}
          </div>
        </div>

        {/* 2) Total de Evaluaciones */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total de Evaluaciones</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {totalReviews}
          </p>
          <div className="mt-2 flex items-center text-sm text-blue-600">
            <span>Tasa de respuesta: {responseRate}% (placeholder)</span>
          </div>
        </div>

        {/* 3) Puntaje de Recomendación */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Puntaje de Recomendación</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {recommendationScore.toFixed(1)}
          </p>
          <div
            className="mt-2 text-sm"
            style={{ color: recommendationDiff >= 0 ? "green" : "red" }}
          >
            {`${recDiffSign} ${Math.abs(recommendationDiff).toFixed(2)} vs. semestre anterior`}
          </div>
        </div>

        {/* 4) Progreso del Semestre */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Progreso del Semestre</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {semesterProgress.percentage}%
          </p>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <span>{semesterProgress.current} de {semesterProgress.total} evaluaciones</span>
          </div>
        </div>
      </div>
    );
  };

  // ----------------- CHARTS -----------------
  // 1) Semester Trend
  const renderSemesterTrend = () => {
    if (!semesterTrend || semesterTrend.length === 0) {
      return <p className="text-sm text-gray-500">No hay datos para la tendencia por semestre.</p>;
    }
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={semesterTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semester" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="rating" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // 2) Criteria Breakdown
  const renderCriteriaBreakdown = () => {
    if (!criteriaBreakdown || criteriaBreakdown.length === 0) {
      return <p className="text-sm text-gray-500">No hay datos para desglose de criterios.</p>;
    }
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={criteriaBreakdown} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 5]} />
          <YAxis dataKey="name" type="category" width={100} />
          <Tooltip />
          <Bar dataKey="value" fill="#3b82f6" name="Promedio" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // 3) Simple Pie of "recomendacion=1 => 'Sí'"
  const renderPieYesNo = () => {
    if (!pieData || pieData.length === 0) {
      return <p className="text-sm text-gray-500">No hay datos para el gráfico de pastel (Sí/No).</p>;
    }
    // pieData: [ { name: 'Recomienda', value: X }, { name: 'No recomienda', value: Y } ]
    const COLORS = ["#22c55e", "#ef4444"];
    return (
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
            {pieData.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // 4) Distribution of "recomendacion" across 1..5
  const renderRecommendationDistribution = () => {
    if (!recommendationDist || recommendationDist.length === 0) {
      return <p className="text-sm text-gray-500">No hay datos para distribución de recomendaciones 1..5.</p>;
    }
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={recommendationDist}
            dataKey="count"
            nameKey="score"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={(entry) => `Score ${entry.score}: ${entry.count}`}
          >
            {recommendationDist.map((entry, i) => (
              <Cell key={i} fill={entry.color || "#8884d8"} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // 5) Star Rating Distribution (1..5)
  const renderStarDistributionChart = () => {
    if (!starDist || starDist.length === 0) {
      return <p className="text-sm text-gray-500">No hay datos de distribución de estrellas.</p>;
    }
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={starDist}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="star" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#f97316" name="# Evaluaciones" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // 6) Recent Comments
  const renderRecentComments = () => {
    if (!recentComments || recentComments.length === 0) {
      return <p className="text-sm text-gray-500">No hay comentarios recientes.</p>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recentComments.map((comment, idx) => (
          <div key={idx} className="border-l-4 border-blue-500 pl-4">
            <p className="text-sm text-gray-600">"{comment.text}"</p>
            <p className="text-xs text-gray-400 mt-1">
              {comment.semesterName} &middot; {comment.date}
            </p>
          </div>
        ))}
      </div>
    );
  };

  // 7) Professor Ranking
  const renderProfessorRanking = () => {
    if (!professorRanking || professorRanking.length === 0) {
      return <p className="text-sm text-gray-500">No hay datos de ranking de profesores.</p>;
    }
    return (
      <div className="overflow-auto">
        <table className="min-w-full bg-white text-sm rounded shadow">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-2 text-left">Profesor</th>
              <th className="p-2 text-left">Promedio Estrellas</th>
              <th className="p-2 text-left">Calificaciones</th>
            </tr>
          </thead>
          <tbody>
            {professorRanking.map((prof) => (
              <tr key={prof.profesor_id} className="border-b hover:bg-gray-50">
                <td className="p-2">{prof.nombreProfesor}</td>
                <td className="p-2">{prof.avgStar}</td>
                <td className="p-2">{prof.totalCals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ----------------- DETAILED TABLE -----------------
  const renderDetailTable = () => {
    if (isLoading) {
      return (
        <div className="text-center py-4">
          <Loader className="w-6 h-6 text-blue-500 inline-block animate-spin" />
          <span className="ml-2 text-gray-500">Cargando calificaciones...</span>
        </div>
      );
    }
    if (filteredCalifications.length === 0) {
      return <p className="text-gray-500">No se encontraron calificaciones con los filtros y búsqueda actuales.</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm rounded shadow">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-2 text-left">Profesor</th>
              <th className="p-2 text-left">Estrellas</th>
              <th className="p-2 text-left">Recomendación</th>
              <th className="p-2 text-left">Comentarios</th>
              <th className="p-2 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filteredCalifications.map((cal) => {
              const profName = cal.Profesor?.Usuario?.nombre || 'Desconocido';
              const date = cal.fecha_calificacion
                ? new Date(cal.fecha_calificacion).toLocaleDateString()
                : 'N/A';

              return (
                <tr key={cal.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{profName}</td>
                  <td className="p-2">{cal.star_rating || 0}</td>
                  <td className="p-2">{cal.recomendacion || 0}</td>
                  <td className="p-2">
                    {cal.comentarios
                      ? cal.comentarios.slice(0, 80)
                      : 'Sin comentarios'}
                    {cal.comentarios && cal.comentarios.length > 80 ? '...' : ''}
                  </td>
                  <td className="p-2">{date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ----------------- RENDER MAIN -----------------
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderCoordinador title="Calificaciones - Vista Detallada" />

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* PAGE HEADER & FILTERS */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Calificaciones - Vista Detallada
          </h1>
          {renderFilters()}

          {/* STATS CARDS */}
          {renderStatsCards()}

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1) TENDENCIA POR SEMESTRE (Line) */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tendencia por Semestre</h3>
              {renderSemesterTrend()}
            </div>

            {/* 2) DESGLOSE POR CRITERIO (Bar) */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Desglose por Criterio</h3>
              {renderCriteriaBreakdown()}
            </div>

            {/* 3) GRAFICO DE PASTEL (SÍ/NO) */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Distribución (Sí / No recomienda)
              </h3>
              {renderPieYesNo()}
            </div>

            {/* 4) DISTRIBUCIÓN DE RECOMENDACIÓN (1..5) */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Distribución de Recomendaciones (1..5)
              </h3>
              {renderRecommendationDistribution()}
            </div>

            {/* 5) DISTRIBUCIÓN DE CALIFICACIONES (ESTRELLAS) */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Distribución de Calificaciones (Estrellas)
              </h3>
              {renderStarDistributionChart()}
            </div>

            {/* 6) COMENTARIOS RECIENTES */}
            <div className="bg-white p-6 rounded-lg shadow col-span-1 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Comentarios Recientes
              </h3>
              {renderRecentComments()}
            </div>

            {/* 7) RANKING DE PROFESORES */}
            <div className="bg-white p-6 rounded-lg shadow col-span-1 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ranking de Profesores (Promedio de Estrellas)
              </h3>
              {renderProfessorRanking()}
            </div>
          </div>

          {/* DETALLE DE CALIFICACIONES */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Detalle de Calificaciones
            </h3>
            {renderDetailTable()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DetailedCalificacionesDashboard;