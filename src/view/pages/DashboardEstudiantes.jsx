import { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import SettingsCoordinador from '../components/SettingsCoordinador';
import '../styles/DashboardEstudiantes.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardEstudiantes = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProfesor, setSelectedProfesor] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const profesores = [
    { value: '', label: 'Todos los profesores' },
    { value: 'profesor1', label: 'Profesor 1' },
    { value: 'profesor2', label: 'Profesor 2' },
    { value: 'profesor3', label: 'Profesor 3' }
  ];

  const handleProfesorChange = (e) => {
    setSelectedProfesor(e.target.value);
  };

  const handleFechaInicioChange = (e) => {
    setFechaInicio(e.target.value);
  };

  const handleFechaFinChange = (e) => {
    setFechaFin(e.target.value);
  };

  const data = {
    labels: ['Aprobados', 'Reprobados', 'Pendientes'],
    datasets: [
      {
        label: 'Estado de estudiantes',
        data: [300, 50, 100],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 206, 86, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
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
              <Bar data={data} />
            </div>
          </div>
          <div className="chart-item">
            <div className="chart-wrapper">
              <Pie data={data} />
            </div>
          </div>
        </div> 
      </div>     
      <Footer />
    </div>
  );
};

export default DashboardEstudiantes;
