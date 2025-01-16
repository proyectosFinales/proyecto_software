import { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import SettingsCoordinador from '../components/SettingsCoordinador';
import Profesor from '../../controller/profesor';
import Estudiante from '../../controller/estudiante';
import '../styles/DashboardEstudiantes.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardEstudiantes = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProfesor, setSelectedProfesor] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [profesores, setProfesores] = useState([]);
  const [chartData, setChartData] = useState({});



  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        const data = await Profesor.obtenerTodos();
        setProfesores([{ value: '', label: 'Todos los profesores' }, ...data.map(prof => ({
          value: prof.id,
          label: prof.nombre
        }))]);
      } catch (error) {
        console.error('Error fetching profesores:', error.message);
      }
    };

    const fetchEstudiantes = async () => {
      try {
        const data = await Estudiante.obtenerTodos();
        const estadoCounts = {
          aprobado: 0,
          reprobado: 0,
          retirado: 0,
          defensa: 0,
          'en progreso': 0,
        };

        data.forEach(estudiante => {
          if (estadoCounts[estudiante.estado] !== undefined)
            estadoCounts[estudiante.estado]++;
        });

        setChartData({
          labels: ['Aprobado', 'Reprobado', 'Retirado', 'Defensa', 'En Progreso'],
          datasets: [
            {
              label: 'Estado de estudiantes',
              data: Object.values(estadoCounts),
              backgroundColor: [
                'rgba(75, 192, 192, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
              ],
              borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(153, 102, 255, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching estudiantes:', error.message);
      }
    };

    fetchProfesores();
    fetchEstudiantes();
  }, []);

  const handleProfesorChange = (e) => {
    setSelectedProfesor(e.target.value);
  };

  const handleFechaInicioChange = (e) => {
    setFechaInicio(e.target.value);
  };

  const handleFechaFinChange = (e) => {
    setFechaFin(e.target.value);
  };
  
  return (
    <div>
      <Header title="Estado de estudiantes" />
      <SettingsCoordinador show={isMenuOpen} />
      <div className="content-container">
        <div className="filters-container">
          <div className="filter-item">
            <label htmlFor="profesor">Profesor:</label>
            <select id="profesor" value={selectedProfesor} onChange={handleProfesorChange}>
              {profesores.map((profesor) => (
                <option key={profesor.value} value={profesor.value}>
                  {profesor.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="fechaInicio">Fecha Inicio:</label>
            <input
              type="date"
              id="fechaInicio"
              value={fechaInicio}
              onChange={handleFechaInicioChange}
            />
          </div>
          <div className="filter-item">
            <label htmlFor="fechaFin">Fecha Fin:</label>
            <input
              type="date"
              id="fechaFin"
              value={fechaFin}
              onChange={handleFechaFinChange}
            />
          </div>
        </div>
        <div className="charts-container">
          <div className="chart-item">
            <div className="chart-wrapper">
              {chartData.labels ? <Bar data={chartData} /> : <p>Cargando datos...</p>}
            </div>
          </div>
          <div className="chart-item">
            <div className="chart-wrapper">
              {chartData.labels ? <Pie data={chartData} /> : <p>Cargando datos...</p>}
            </div>
          </div>
        </div>
      </div>     
      <Footer />
    </div>
  );
};

export default DashboardEstudiantes;
