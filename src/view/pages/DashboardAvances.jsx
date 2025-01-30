import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  Download,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Award
} from 'lucide-react';
import { fetchAvancesSinProyecto } from '../../controller/Avances';
import jsPDF from 'jspdf';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import SettingsCoordinador from '../components/SettingsCoordinador';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Profesor from '../../controller/profesor';
import Estudiante from '../../controller/estudiante';

const DashboardAvances = () => {
  const [avances, setAvances] = useState([]);
  const [filteredAvances, setFilteredAvances] = useState([]);
  const [searchedAvances, setSearchedAvances] = useState([]);
  const [paginatedAvances, setPaginatedAvances] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [selectedEstudiante, setSelectedEstudiante] = useState('');
  const [selectedProfesor, setSelectedProfesor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        const data = await Profesor.obtenerTodos();
        setProfesores([{ value: '', label: 'Todos los profesores' }, ...data.map(prof => ({
          value: prof.profesor_id,
          label: prof.nombre
        }))]);
      } catch (error) {
        console.error('Error fetching profesores:', error.message);
      }
    };

    const fetchEstudiantes = async () => {
      try {
        const data = await Estudiante.obtenerTodos();
        setEstudiantes([{ value: '', label: 'Todos los estudiantes' }, ...data.map(est => ({
          value: est.estudiante_id,
          label: est.Usuario.nombre
        }))]);
      } catch (error) {
        console.error('Error fetching estudiantes:', error.message);
      }
    };

    fetchProfesores();
    fetchEstudiantes();
    fetchAvancesSinProyecto().then(data => {
      setAvances(data)
    })
    .catch(error => console.error('Error fetching avances:', error.message));
  }, []);

  useEffect(() => {
    const filteredAvances = avances.filter(avance => {
      const matchesEstudiante = selectedEstudiante ? avance.Proyecto?.estudiante_id === selectedEstudiante : true;
      const matchesProfesor = selectedProfesor ? avance.Proyecto?.profesor_id === selectedProfesor : true;
      return matchesEstudiante && matchesProfesor;
    });

    const totalAvances = filteredAvances.length;
    const aprobados = filteredAvances.filter(a => a.estado === 'Aprobado').length;
    const pendientes = filteredAvances.filter(a => a.estado === 'Pendiente').length;
    const reprobados = filteredAvances.filter(a => a.estado === 'Reprobado').length;
    const atrasados = filteredAvances.filter(a => a.estado === 'Atrasado').length;

    setStats({
      totalAvances,
      aprobados,
      pendientes,
      reprobados,
      atrasados,
      tasaAprobacion: totalAvances ? (aprobados / totalAvances * 100).toFixed(1) : 0,
      tasaPendientes: totalAvances ? (pendientes / totalAvances * 100).toFixed(1) : 0,
      tasaReprobados: totalAvances ? (reprobados / totalAvances * 100).toFixed(1) : 0,
      tasaAtrasados: totalAvances ? (atrasados / totalAvances * 100).toFixed(1) : 0
    });

    setFilteredAvances(filteredAvances);
  }, [avances, selectedEstudiante, selectedProfesor]);

  useEffect(() => {
    const results = avances.filter(avance => {
      return avance.Proyecto?.Estudiante?.Usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        avance.Proyecto?.Estudiante?.carnet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        avance.Proyecto?.Profesor?.Usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    });

    setSearchedAvances(results);
  }, [searchTerm, filteredAvances]);

  useEffect(() => {
    setPaginatedAvances(searchedAvances.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ));
  }, [searchedAvances, currentPage]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Número', 'Estudiante', 'Carnet', 'Profesor', 'Estado', 'Fecha']],
      body: searchedAvances.map(avance => [
        avance.num_avance,
        avance.Proyecto?.Estudiante?.Usuario?.nombre || 'N/A',
        avance.Proyecto?.Estudiante?.carnet || 'N/A',
        avance.Proyecto?.Profesor?.Usuario?.nombre || 'N/A',
        avance.estado,
        new Date(avance.fecha_avance).toLocaleDateString()
      ])
    });
    doc.save('reporte_avances.pdf');
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(searchedAvances.map(avance => ({
      Número: avance.num_avance,
      Estudiante: avance.Proyecto?.Estudiante?.Usuario?.nombre || 'N/A',
      Carnet: avance.Proyecto?.Estudiante?.carnet || 'N/A',
      Profesor: avance.Proyecto?.Profesor?.Usuario?.nombre || 'N/A',
      Estado: avance.estado,
      Fecha: new Date(avance.fecha_avance).toLocaleDateString()
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Avances');
    XLSX.writeFile(workbook, 'reporte_avances.xlsx');
  };

  const getColorForEstado = (estado) => {
    switch (estado) {
      case 'Aprobado': return '#22c55e';
      case 'Pendiente': return '#f59e0b';
      case 'Reprobado': return '#ef4444';
      case 'Atrasado': return '#f87171';
      default: return '#3b82f6';
    }
  };

  const renderStatsCard = (title, value, icon, trend = null) => (
    <div className="hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 bg-white rounded-lg p-6">
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Avances de estudiantes" />
      <SettingsCoordinador show={isMenuOpen} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Filtros y Controles */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedEstudiante}
              onChange={(e) => setSelectedEstudiante(e.target.value)}
              className="px-4 py-2 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              {estudiantes.map(est => (
                <option key={est.value} value={est.value}>{est.label}</option>
              ))}
            </select>

            <select
              value={selectedProfesor}
              onChange={(e) => setSelectedProfesor(e.target.value)}
              className="px-4 py-2 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              {profesores.map(prof => (
                <option key={prof.value} value={prof.value}>{prof.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Download className="w-5 h-5" /> PDF
            </button>
            <button
              onClick={handleDownloadExcel}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Download className="w-5 h-5" /> Excel
            </button>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderStatsCard(
              "Total Avances",
              stats.totalAvances,
              <Users className="w-6 h-6 text-blue-500" />
            )}
            {renderStatsCard(
              "Tasa de Aprobación",
              `${stats.tasaAprobacion}%`,
              <CheckCircle className="w-6 h-6 text-green-500" />,
            )}
            {renderStatsCard(
              "Avances Pendientes",
              stats.pendientes,
              <Clock className="w-6 h-6 text-amber-500" />
            )}
            {renderStatsCard(
              "Tasa de Reprobación",
              `${stats.tasaReprobados}%`,
              <AlertTriangle className="w-6 h-6 text-red-500" />,
            )}
          </div>
        )}
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Estados de Avances</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Aprobados', value: stats?.aprobados || 0 },
                  { name: 'Pendientes', value: stats?.pendientes || 0 },
                  { name: 'Reprobados', value: stats?.reprobados || 0 },
                  { name: 'Atrasados', value: stats?.atrasados || 0 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {[
                      <Cell key="apr" fill="#22c55e" />,
                      <Cell key="pen" fill="#f59e0b" />,
                      <Cell key="rep" fill="#ef4444" />
                    ]}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Distribución de Estados</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Aprobados', value: stats?.aprobados || 0 },
                      { name: 'Pendientes', value: stats?.pendientes || 0 },
                      { name: 'Reprobados', value: stats?.reprobados || 0 },
                      { name: 'Atrasados', value: stats?.atrasados || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabla de Avances */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Detalle de Avances</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carnet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedAvances.map((avance, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {avance.num_avance || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {avance.Proyecto?.Estudiante?.Usuario?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {avance.Proyecto?.Estudiante?.carnet || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {avance.Proyecto?.Profesor?.Usuario?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${avance.estado === 'Aprobado' ? 'bg-green-100 text-green-800' :
                          avance.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'}`}>
                        {avance.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(avance.fecha_avance).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            >
              Anterior
            </button>
            <span>Página {currentPage}</span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * itemsPerPage >= searchedAvances.length}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardAvances;