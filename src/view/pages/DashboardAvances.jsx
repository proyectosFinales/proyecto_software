import { useState, useEffect, useRef, useMemo } from 'react'; // Chale
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
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import SettingsCoordinador from '../components/SettingsCoordinador';
import Profesor from '../../controller/profesor';
import Estudiante from '../../controller/estudiante';

import {
  generarPDFDashboardAvances,
  descargarExcelDetalleAvances
} from '../../controller/DescargarPDF';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ESTADOS_AVANCE = {
  Pasa: { hex: '#22c55e', badge: 'bg-green-100 text-green-800' },
  'A Mejorar': { hex: '#f59e0b', badge: 'bg-amber-100 text-amber-800' },
  'No Pasa': { hex: '#ef4444', badge: 'bg-red-100 text-red-800' },
  Atrasado: { hex: '#64748b', badge: 'bg-slate-100 text-slate-700' },
  Otros: { hex: '#8884d8', badge: 'bg-gray-100 text-gray-700' }
};

const FECHA_ACTUAL = new Date();
const ANIO_ACTUAL = FECHA_ACTUAL.getFullYear();
const SEMESTRE_ACTUAL = FECHA_ACTUAL.getMonth() + 1 <= 7 ? 1 : 2;

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
  const [avanceSeleccionado, setAvanceSeleccionado] = useState(0);
  const [selectedAnio, setSelectedAnio] = useState(String(ANIO_ACTUAL));
  const [selectedSemestreNum, setSelectedSemestreNum] = useState(String(SEMESTRE_ACTUAL));
  const itemsPerPage = 10;

  const ETIQUETAS_AVANCE = {
    1: 'Primer Avance',
    2: 'Segundo Avance',
    3: 'Tercer Avance',
    4: 'Otros avances'
  };
  const handleCiclarAvance = () => setAvanceSeleccionado(prev => (prev >= 4 ? 0 : prev + 1));

  const aniosDisponibles = useMemo(() => {
    const set = new Set([ANIO_ACTUAL]);
    avances.forEach(avance => {
      const anio = avance.Proyecto?.año;
      if (anio) set.add(Number(anio));
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [avances]);

  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const handlePrintChart = (chartRef) => {
    if (!chartRef.current) return;

    // Ocultar todo excepto el grafico
    const originalContents = document.body.innerHTML;
    const printContents = chartRef.current.innerHTML;
    
    document.body.innerHTML = printContents;
    // Aplicar estilos basicos para la impresion
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body { margin: 20px; }
        .recharts-responsive-container { width: 100% !important; height: 400px !important; }
      }
    `;
    document.head.appendChild(style);

    window.print(); // Abre el dialogo de impresion

    // Restaurar la pagina
    document.body.innerHTML = originalContents;
    document.head.removeChild(style);
    // Recargar los scripts o estilos si es necesario (a veces se pierden)
    window.location.reload(); 
  };

  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        const data = await Profesor.obtenerTodos();
        const unicosPorId = new Map();
        data.forEach(prof => {
          if (!unicosPorId.has(prof.profesor_id)) {
            unicosPorId.set(prof.profesor_id, {
              value: prof.profesor_id,
              label: prof.nombre
            });
          }
        });
        setProfesores([{ value: '', label: 'Todos los profesores' }, ...unicosPorId.values()]);
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
      const matchesAvance = avanceSeleccionado === 0
        ? true
        : avanceSeleccionado === 4
          ? ![1, 2, 3].includes(Number(avance.num_avance))
          : Number(avance.num_avance) === avanceSeleccionado;
      const matchesAnio = selectedAnio ? Number(avance.Proyecto?.año) === Number(selectedAnio) : true;
      const matchesSemestreNum = selectedSemestreNum
        ? Number(avance.Proyecto?.semestre) === Number(selectedSemestreNum) : true;
      return matchesEstudiante && matchesProfesor && matchesAvance && matchesAnio && matchesSemestreNum;
    });

    setCurrentPage(1);

    const totalAvances = filteredAvances.length;
    const contar = (valor) => filteredAvances.filter(a => a.estado === valor).length;
    const pasa = contar('Pasa');
    const aMejorar = contar('A Mejorar');
    const noPasa = contar('No Pasa');
    const atrasados = contar('Atrasado');
    const otros = totalAvances - pasa - aMejorar - noPasa - atrasados;

    setStats({
      totalAvances,
      pasa,
      aMejorar,
      noPasa,
      atrasados,
      otros,
      tasaAprobacion: totalAvances ? (pasa / totalAvances * 100).toFixed(1) : 0,
      tasaReprobados: totalAvances ? (noPasa / totalAvances * 100).toFixed(1) : 0,
      tasaAMejorar: totalAvances ? (aMejorar / totalAvances * 100).toFixed(1) : 0,
      tasaAtrasados: totalAvances ? (atrasados / totalAvances * 100).toFixed(1) : 0
    });

    setFilteredAvances(filteredAvances);
  }, [avances, selectedEstudiante, selectedProfesor, avanceSeleccionado, selectedAnio, selectedSemestreNum]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = filteredAvances.filter(avance => {
      const nombre = avance.Proyecto?.Estudiante?.Usuario?.nombre?.toLowerCase() || '';
      const carnet = avance.Proyecto?.Estudiante?.carnet?.toLowerCase() || '';
      const profesor = avance.Proyecto?.Profesor?.Usuario?.nombre?.toLowerCase() || '';
      return nombre.includes(term) || carnet.includes(term) || profesor.includes(term);
    });

    setSearchedAvances(results);
  }, [searchTerm, filteredAvances]);

  useEffect(() => {
    setPaginatedAvances(searchedAvances.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ));
    console.log(paginatedAvances);
  }, [searchedAvances, currentPage]);

  const datosEstado = [
    { estado: 'Pasa', value: stats?.pasa || 0 },
    { estado: 'A Mejorar', value: stats?.aMejorar || 0 },
    { estado: 'No Pasa', value: stats?.noPasa || 0 },
    { estado: 'Atrasado', value: stats?.atrasados || 0 },
    { estado: 'Otros', value: stats?.otros || 0 }
  ]
    .filter(d => d.estado !== 'Otros' || d.value > 0)
    .map(d => ({
      name: d.estado,
      value: d.value,
      color: ESTADOS_AVANCE[d.estado].hex
    }));

const handleDownloadPDF = () => {
    // REQ-30: Esta funcion ahora imprime los graficos/stats
    if (!stats) {
      toast.error("No hay estadísticas para generar el PDF.");
      return;
    }

    generarPDFDashboardAvances(datosEstado, "Resumen de Avances de Proyectos");
  };


  const handleDownloadExcel = () => {
    // Se exportan los avances que ya están filtrados en el dashboard
    descargarExcelDetalleAvances(searchedAvances);
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
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
              <select
                value={selectedEstudiante}
                onChange={(e) => setSelectedEstudiante(e.target.value)}
                className="h-12 px-4 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                {estudiantes.map(est => (
                  <option key={est.value} value={est.value}>{est.label}</option>
                ))}
              </select>

              <select
                value={selectedProfesor}
                onChange={(e) => setSelectedProfesor(e.target.value)}
                className="h-12 px-4 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                {profesores.map(prof => (
                  <option key={prof.value} value={prof.value}>{prof.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
              <select
                value={selectedAnio}
                onChange={(e) => setSelectedAnio(e.target.value)}
                className="h-12 px-4 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los años</option>
                {aniosDisponibles.map(anio => (
                  <option key={anio} value={anio}>{anio}</option>
                ))}
              </select>

              <select
                value={selectedSemestreNum}
                onChange={(e) => setSelectedSemestreNum(e.target.value)}
                className="h-12 px-4 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione un semestre</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>

              <button
                onClick={handleCiclarAvance}
                className="h-12 max-h-12 px-4 bg-azul text-white rounded-lg hover:bg-blue-800 flex items-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                {avanceSeleccionado ? ETIQUETAS_AVANCE[avanceSeleccionado] : 'Todos los avances'}
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleDownloadPDF}
              className="h-12 max-h-12 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
            >
              <Download className="w-5 h-5" /> Resumen (PDF)
            </button>
            <button
              onClick={handleDownloadExcel}
              className="h-12 max-h-12 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
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
              "Avances Atrasados",
              stats.atrasados,
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
          <div className="bg-white rounded-lg shadow p-6" ref={barChartRef}>
            <h2 className="text-xl font-semibold mb-4">Estados de Avances</h2>
            <button 
                onClick={() => handlePrintChart(barChartRef)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                Imprimir Gráfico
              </button>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosEstado}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {datosEstado.map(d => (
                      <Cell key={d.estado} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6" ref={pieChartRef}>
            <h2 className="text-xl font-semibold mb-4">Distribución de Estados</h2>
            <button 
                onClick={() => handlePrintChart(pieChartRef)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                Imprimir Gráfico
              </button>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosEstado}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {datosEstado.map(d => (
                      <Cell key={d.estado} fill={d.color} />
                    ))}
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
                {paginatedAvances.map(avance => (
                  <tr key={avance.id} className="hover:bg-gray-50">
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
                        ${ESTADOS_AVANCE[avance.estado]?.badge || ESTADOS_AVANCE.Otros.badge}`}>
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
            <span>Página {currentPage} de {Math.max(1, Math.ceil(searchedAvances.length / itemsPerPage))} — {searchedAvances.length} avances</span>
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