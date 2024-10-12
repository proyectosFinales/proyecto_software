import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './pages/MenuPrincipal';
import Anteproyectos from './pages/Anteproyectos';
import Asignaciones from './pages/Asignaciones';
import GestionPerfiles from './pages/GestionPerfiles';
import FormularioEstudiantes from './pages/FormularioEstudiante';
import FormularioCoordinador from './pages/FormularioCoordinador';
import AnteproyectosEstudiante from './pages/AnteproyectosEstudiante';
import AnteproyectosCoordinador from './pages/AnteproyectosCoordinador';
import Citas from './pages/Citas';
import CitasUsuario from './pages/CitasUsuario';
import Login from './pages/Login';
import Registro from './pages/Registro';
import './App.css'
import EditarPerfil from './pages/EditarPerfil';
// Otras importaciones de componentes

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Menu />} />  {/* Ruta para la página principal */}
        <Route path="/login" element={<Login />} />  {/* Ruta para login */}
        <Route path="/registro" element={<Registro />} />  {/* Ruta para registrarse */}
        <Route path="/anteproyectosEstudiante" element={<AnteproyectosEstudiante />} />  {/* Ruta para anteproyectos */}
        <Route path="/anteproyectosCoordinador" element={<AnteproyectosCoordinador />} />  {/* Ruta para anteproyectos */}
        <Route path="/asignaciones" element={<Asignaciones />} />
        <Route path="/gestion-perfiles" element={<GestionPerfiles />} />
        <Route path="/formulario-estudiantes" element={<FormularioEstudiantes />} />
        <Route path="/formulario-coordinador" element={<FormularioCoordinador />} />
        <Route path="/citas" element={<Citas />} />
        <Route path="/citas-usuario" element={<CitasUsuario />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        {/* Otras rutas para más secciones */}
      </Routes>
    </Router>
  );
}

export default App;
