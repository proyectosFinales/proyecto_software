import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import {
  Download,
  Users,
  GraduationCap,
  AlertTriangle,
  Search,
  Ban
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { fetchSemestres } from '../../controller/Semestre';
import Profesor from '../../controller/profesor';
import Estudiante from '../../controller/estudiante';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import SettingsCoordinador from '../components/SettingsCoordinador';

const DashboardEstudiantes = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProfesor, setSelectedProfesor] = useState('');
  const [selectedSemestre, setSelectedSemestre] = useState('');
  const [profesores, setProfesores] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredEstudiantes, setFilteredEstudiantes] = useState([]);
  const [paginatedEstudiantes, setPaginatedEstudiantes] = useState([]);
  const [stats, setStats] = useState(null);
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
        setEstudiantes(data);
      } catch (error) {
        console.error('Error fetching estudiantes:', error.message);
      }
    };

    fetchProfesores();
    fetchEstudiantes();
    fetchSemestres().then(data => {
      setSemestres([{value: '', label: 'Todos los semestres'}, ...data.map(semestre => ({
        value: semestre.semestre_id,
        label: semestre.nombre
      }))])}).catch(console.error);
  }, []);

  useEffect(() => {
    const filtered = estudiantes.filter(estudiante => {
      const matchesProfesor = selectedProfesor ? estudiante.asesor === selectedProfesor : true;
      const matchesSemestre = selectedSemestre ? estudiante.semestre_id == selectedSemestre : true;
      const matchesSearch = estudiante.Usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estudiante.carnet.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesProfesor && matchesSemestre && matchesSearch;
    });

    const total = filtered.length;
    const aprobados = filtered.filter(e => e.estado === 'aprobado').length;
    const reprobados = filtered.filter(e => e.estado === 'reprobado').length;
    const retirados = filtered.filter(e => e.estado === 'retirado').length;
    const enProgreso = filtered.filter(e => e.estado === 'en progreso').length;
    const defensa = filtered.filter(e => e.estado === 'defensa').length;

    setStats({
      total,
      aprobados,
      reprobados,
      retirados,
      enProgreso,
      defensa,
      tasaAprobacion: total ? (aprobados / total * 100).toFixed(1) : 0,
      tasaReprobacion: total ? (reprobados / total * 100).toFixed(1) : 0,
      tasaRetencion: total ? ((total - retirados) / total * 100).toFixed(1) : 0
    });

    setFilteredEstudiantes(filtered);
    setCurrentPage(1);
  }, [estudiantes, selectedProfesor, selectedSemestre, searchTerm]);

  useEffect(() => {
    setPaginatedEstudiantes(
      filteredEstudiantes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );
  }, [filteredEstudiantes, currentPage]);

  const renderStatsCard = (title, value, icon, trend = null) => (
    <div className="bg-white rounded-lg p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`mt-1 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );

  const chartData = stats ? [
    { name: 'Aprobados', value: stats.aprobados },
    { name: 'Reprobados', value: stats.reprobados },
    { name: 'Retirados', value: stats.retirados },
    { name: 'En Progreso', value: stats.enProgreso },
    { name: 'Defensa', value: stats.defensa }
  ] : [];

  const handleDownload = (format) => {
    if (format === 'pdf') {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Nombre', 'Correo', 'Carnet', 'Profesor Asesor', 'Estado']],
        body: filteredEstudiantes.map(est => [
          est.Usuario.nombre,
          est.Usuario.correo,
          est.carnet,
          profesores.find(prof => prof.value === est.asesor)?.label || '',
          est.estado,
        ]),
      });
      doc.save('reporte_estudiantes.pdf');
    } else if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(
        filteredEstudiantes.map(est => ({
          Nombre: est.Usuario.nombre,
          Correo: est.Usuario.correo,
          Carnet: est.carnet,
          'Profesor Asesor': profesores.find(prof => prof.value === est.asesor)?.label || '',
          Estado: est.estado,
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes');
      XLSX.writeFile(workbook, 'reporte_estudiantes.xlsx');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Estado de estudiantes" />
      <SettingsCoordinador show={isMenuOpen} />
      
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedProfesor}
              onChange={(e) => setSelectedProfesor(e.target.value)}
              className="px-4 py-2 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              {profesores.map((profesor) => (
                <option key={profesor.value} value={profesor.value}>
                  {profesor.label}
                </option>
              ))}
            </select>

            <select
              value={selectedSemestre}
              onChange={(e) => setSelectedSemestre(e.target.value)}
              className="px-4 py-2 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              {semestres.map((semestre) => (
                <option key={semestre.value} value={semestre.value}>
                  {semestre.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleDownload('pdf')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Download className="w-5 h-5" /> PDF
            </button>
            <button
              onClick={() => handleDownload('excel')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Download className="w-5 h-5" /> Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderStatsCard(
              "Total Estudiantes",
              stats.total,
              <Users className="w-6 h-6 text-blue-500" />
            )}
            {renderStatsCard(
              "Tasa de Aprobación",
              `${stats.tasaAprobacion}%`,
              <GraduationCap className="w-6 h-6 text-green-500" />
            )}
            {renderStatsCard(
              "Tasa de Reprobación",
              `${stats.tasaReprobacion}%`,
              <AlertTriangle className="w-6 h-6 text-red-500" />
            )}
            {renderStatsCard(
              "Tasa de Retención",
              `${stats.tasaRetencion}%`,
              <Ban className="w-6 h-6 text-amber-500" />
            )}
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Distribución de Estados</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={index}
                        fill={[
                          '#22c55e',
                          '#ef4444',
                          '#f59e0b',
                          '#3b82f6',
                          '#8b5cf6'
                        ][index % 4]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Proporción de Estados</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={[
                          '#22c55e',
                          '#ef4444',
                          '#f59e0b',
                          '#3b82f6',
                          '#8b5cf6'
                        ][index % 4]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Lista de Estudiantes</h2>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carnet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profesor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semestre</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEstudiantes.map((estudiante, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {estudiante.Usuario.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {estudiante.carnet}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {profesores.find(p => p.value === estudiante.asesor)?.label || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        estudiante.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                        estudiante.estado === 'reprobado' ? 'bg-red-100 text-red-800' :
                        estudiante.estado === 'retirado' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {estudiante.estado.charAt(0).toUpperCase() + estudiante.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {semestres.find(s => s.value === estudiante.semestre_id)?.label || 'N/A'}
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
              disabled={currentPage * itemsPerPage >= filteredEstudiantes.length}
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

export default DashboardEstudiantes;
