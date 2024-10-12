import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './view/pages/MenuPrincipal';
import Anteproyectos from './view/pages/Anteproyectos';
import Asignaciones from './view/pages/Asignaciones';
import GestionPerfiles from './view/pages/GestionPerfiles';
import FormularioEstudiantes from './view/pages/FormularioEstudiante';
import FormularioCoordinador from './view/pages/FormularioCoordinador';
import AnteproyectosEstudiante from './view/pages/AnteproyectosEstudiante';
import AnteproyectosCoordinador from './view/pages/AnteproyectosCoordinador';
import Citas from './view/pages/Citas';
import CitasUsuario from './view/pages/CitasUsuario';
import Login from './view/pages/Login';
import Registro from './view/pages/Registro';
import './App.css'
import EditarPerfil from './view/pages/EditarPerfil';
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
