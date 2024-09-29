import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './pages/MenuPrincipal';
import Asignaciones from './pages/Asignaciones';
import GestionPerfiles from './pages/GestionPerfiles';
import FormularioEstudiantes from './pages/FormularioEstudiante';
import FormularioCoordinador from './pages/FormularioCoordinador';
import AnteproyectosEstudiante from './pages/AnteproyectosEstudiante';
import AnteproyectosCoordinador from './pages/AnteproyectosCoordinador';
// Otras importaciones de componentes

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Menu />} />  {/* Ruta para la página principal */}
        <Route path="/anteproyectosEstudiante" element={<AnteproyectosEstudiante />} />  {/* Ruta para anteproyectos */}
        <Route path="/anteproyectosCoordinador" element={<AnteproyectosCoordinador />} />  {/* Ruta para anteproyectos */}
        <Route path="/asignaciones" element={<Asignaciones />} />
        <Route path="/gestion-perfiles" element={<GestionPerfiles />} />
        <Route path="/formulario-estudiantes" element={<FormularioEstudiantes />} />
        <Route path="/formulario-coordinador" element={<FormularioCoordinador />} />
        {/* Otras rutas para más secciones */}
      </Routes>
    </Router>
  );
}

export default App;
