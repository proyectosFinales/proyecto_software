import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './view/pages/MenuPrincipal';
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
import InicioCargaDatos from "./view/pages/carga-datos";
import CantidadProyectosProfesor from "./view/pages/carga-datos/cantidad-proyectos-profesor";
import Asignaciones from "./view/pages/asignacion-proyectos";
import AsignacionAutomatica from "./view/pages/asignacion-proyectos/asignacion-automatica";
import EdicionAsignacionProyectos from './view/pages/asignacion-proyectos/edicion';
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
        <Route path="/carga-datos" element={<InicioCargaDatos />} />
        <Route path="/carga-datos/cantidad-proyectos-profesor" element={<CantidadProyectosProfesor />} />
        <Route path="/asignaciones/automatica" element={<AsignacionAutomatica />} />
        <Route path="/asignaciones/manual" element={<EdicionAsignacionProyectos />} />
        {/* Otras rutas para más secciones */}
      </Routes>
    </Router>
  );
}

export default App;
