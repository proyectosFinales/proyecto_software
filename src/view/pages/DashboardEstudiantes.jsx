import { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import SettingsCoordinador from '../components/SettingsCoordinador';
import Profesor from '../../controller/profesor';
import Estudiante from '../../controller/estudiante';
import '../styles/DashboardEstudiantes.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Modal from '../components/Modal';
import { fetchSemestres } from '../../controller/Semestre';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardEstudiantes = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProfesor, setSelectedProfesor] = useState('');
  const [selectedSemestre, setSelectedSemestre] = useState('');
  const [profesores, setProfesores] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [chartData, setChartData] = useState({});
  const [estudiantes, setEstudiantes] = useState([]);
  const [modal, setModal] = useState(false);
  const [filteredEstudiantes, setFilteredEstudiantes] = useState([]);

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
    const data = estudiantes.filter(estudiante => {
      const matchesProfesor = selectedProfesor ? estudiante.asesor === selectedProfesor : true;
      const matchesSemestre = selectedSemestre ? estudiante.semestre_id == selectedSemestre : true;
      return matchesProfesor && matchesSemestre;
    });

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
            'rgba(153, 102, 255, 0.2)',
            'rgba(54, 162, 235, 0.2)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(54, 162, 235, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });
    setFilteredEstudiantes(data);
  }, [selectedProfesor, selectedSemestre, estudiantes]);

  const handleDownloadClick = () => {
    console.log('Download clicked');
    setModal(true);
  };

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
    setModal(false);
  };

  return (
    <div>
      <Header title="Estado de estudiantes" />
      <SettingsCoordinador show={isMenuOpen} />
      <div className="content-container">
        <div className="filters-container flex justify-between"> 
          <div className="flex gap-4">
            <div className="filter-item">
              <label htmlFor="profesor">Profesor:</label>
              <select id="profesor" value={selectedProfesor} onChange={(e) => setSelectedProfesor(e.target.value)}>
                {profesores.map((profesor) => (
                  <option key={profesor.value} value={profesor.value}>
                    {profesor.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label htmlFor="semestre">Semestre:</label>
              <select id="semestre" value={selectedSemestre} onChange={(e) => setSelectedSemestre(e.target.value)} >
                {semestres.map((semestre) => (
                  <option key={semestre.value} value={semestre.value}>
                    {semestre.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-primary self-center" onClick={handleDownloadClick}>Descargar Reporte</button>
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

      <Modal
        show={modal}
        onClose={() => setModal(false)}
      >
        <div>
          <p className="mb-6 text-sm">
            Elija el formato en el que desea descargar el reporte de estudiantes.
          </p>
          <div className="flex justify-end gap-2">
            <button className="btn btn-primary mr-2" onClick={() => handleDownload('pdf')}>PDF</button>
            <button className="btn btn-primary mr-2" onClick={() => handleDownload('excel')}>Excel</button>
            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardEstudiantes;
