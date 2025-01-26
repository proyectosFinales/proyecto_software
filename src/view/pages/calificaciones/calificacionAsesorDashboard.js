import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Filter, Download, Search } from 'lucide-react';
import HeaderCoordinador from '../../components/HeaderCoordinador';
import Footer from '../../components/Footer';

const ProfessorDashboard = () => {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  const sampleData = {
    semesterRatings: [
      { semester: '2022-1', rating: 4.5, students: 45 },
      { semester: '2022-2', rating: 4.2, students: 38 },
      { semester: '2023-1', rating: 4.7, students: 52 },
      { semester: '2023-2', rating: 4.3, students: 41 },
      { semester: '2024-1', rating: 4.6, students: 49 }
    ],
    criteriaBreakdown: [
      { name: 'Agilidad', value: 4.6 },
      { name: 'Empatía', value: 4.8 },
      { name: 'Respeto', value: 4.9 },
      { name: 'Comunicación', value: 4.5 },
      { name: 'Aclaración', value: 4.7 },
      { name: 'Respuestas', value: 4.6 },
      { name: 'Corrección', value: 4.4 },
      { name: 'Explicación', value: 4.7 },
      { name: 'Retroalimentación', value: 4.3 }
    ],
    recommendationDistribution: [
      { score: '9-10', percentage: 45, color: '#22c55e' },
      { score: '7-8', percentage: 30, color: '#3b82f6' },
      { score: '5-6', percentage: 15, color: '#f59e0b' },
      { score: '0-4', percentage: 10, color: '#ef4444' }
    ],
    semesterComparison: [
      { metric: 'Participación', '2023-2': 85, '2024-1': 92 },
      { metric: 'Satisfacción', '2023-2': 4.3, '2024-1': 4.6 },
      { metric: 'Recomendación', '2023-2': 8.2, '2024-1': 8.7 }
    ]
  };

  const statistics = {
    averageRating: 4.6,
    totalReviews: 269,
    recommendationScore: 8.7,
    responseRate: 92,
    semesterProgress: {
      current: 49,
      total: 52,
      percentage: 94
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderCoordinador title="Dashboard de Evaluaciones" />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Evaluaciones del Profesor</h1>
            <div className="flex space-x-4">
              <button className="flex items-center px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </button>
              <button className="flex items-center px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700">Año Académico</label>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="all">Todos los años</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700">Semestre</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="all">Todos los semestres</option>
                <option value="1">Primer Semestre</option>
                <option value="2">Segundo Semestre</option>
              </select>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700">Departamento</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">Todos los departamentos</option>
                <option value="cs">Ciencias de la Computación</option>
                <option value="math">Matemáticas</option>
                <option value="eng">Ingeniería</option>
              </select>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700">Búsqueda</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Buscar profesor..."
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Calificación Promedio</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{statistics.averageRating}</p>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <span>↑ 0.3 vs semestre anterior</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total de Evaluaciones</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{statistics.totalReviews}</p>
              <div className="mt-2 flex items-center text-sm text-blue-600">
                <span>Tasa de respuesta: {statistics.responseRate}%</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Puntaje de Recomendación</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{statistics.recommendationScore}</p>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <span>↑ 0.5 vs semestre anterior</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Progreso del Semestre</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{statistics.semesterProgress.percentage}%</p>
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <span>{statistics.semesterProgress.current} de {statistics.semesterProgress.total} evaluaciones</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Semester Ratings Trend */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tendencia por Semestre</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sampleData.semesterRatings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semester" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rating" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Criteria Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Desglose por Criterio</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sampleData.criteriaBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recommendation Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución de Recomendaciones</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sampleData.recommendationDistribution}
                    dataKey="percentage"
                    nameKey="score"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {sampleData.recommendationDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Semester Comparison */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Comparación Semestral</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sampleData.semesterComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="2023-2" fill="#9333ea" />
                  <Bar dataKey="2024-1" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Comments */}
            <div className="bg-white p-6 rounded-lg shadow col-span-1 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Comentarios del Semestre</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-600">
                    "Excelente profesor, muy claro en sus explicaciones y siempre disponible para resolver dudas."
                  </p>
                  <p className="text-xs text-gray-400 mt-1">2024-1</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-600">
                    "Demuestra gran dominio de la materia y hace las clases muy interesantes."
                  </p>
                  <p className="text-xs text-gray-400 mt-1">2024-1</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-600">
                    "Muy buena metodología de enseñanza y retroalimentación constante."
                  </p>
                  <p className="text-xs text-gray-400 mt-1">2024-1</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-600">
                    "Sus explicaciones son claras y fomenta la participación en clase."
                  </p>
                  <p className="text-xs text-gray-400 mt-1">2024-1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfessorDashboard;
