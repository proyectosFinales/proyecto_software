import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import './view/styles/app.css'
import './view/styles/index.css'
import Menu from './view/pages/MenuPrincipal';
import MenuProfesor from './view/pages/MenuPrincipalProfesor.js';
import MenuEstudiante from './view/pages/MenuPrincipalEstudiante.js';
import GestionPerfiles from './view/pages/GestionPerfiles';
import AgregarUsuario from './view/pages/AgregarUsuario';
import FormularioEstudiantes from './view/pages/FormularioEstudiante';
import FormularioCoordinador from './view/pages/FormularioCoordinador';
import AnteproyectosEstudiante from './view/pages/AnteproyectosEstudiante';
import AnteproyectosCoordinador from './view/pages/AnteproyectosCoordinador';
import CargarProfesores from './view/pages/CargarProfesores';
import EditarFormulario from './view/pages/EditarFormulario';
import Citas from './view/pages/Citas';
import CitasMenu from './view/pages/CitasMenu';
import Calendario from './view/pages/Calendario';
import DashboardEstudiantes from './view/pages/DashboardEstudiantes';
import DashboardMenu from './view/pages/DashboardMenu.jsx';
import DisponibilidadProfesor from './view/pages/DisponibilidadProfesor.js';
import CitasEstudiante from './view/pages/CitasEstudiante.js';
import CitasProfesor from './view/pages/CitasProfesor.js';
import Login from './view/pages/Login';
import Registro from './view/pages/Registro';
import EditarPerfil from './view/pages/EditarPerfil';
import InicioCargaDatos from "./view/pages/carga-datos";
import CantidadProyectosProfesor from "./view/pages/carga-datos/cantidad-proyectos-profesor";
import Asignaciones from "./view/pages/asignacion-proyectos";
import AsignacionAutomatica from "./view/pages/asignacion-proyectos/asignacion-automatica";
import EdicionAsignacionProyectos from './view/pages/asignacion-proyectos/edicion';
import RecuperarContraseña from './view/pages/RecuperarContraseña';
import Abandonar from './view/pages/Abandonar';
// Otras importaciones de componentes
import InicioAsignaciones from './view/pages/asignacion-proyectos';
import CambioContraseña from './view/pages/CambioContraseña.js';
import AprobarProyectos from './view/pages/AprobarProyectos';
import LimpiarToken from './controller/limpiezaToken';
import ProyectosAsignadosProfesor from './view/pages/asignacion-proyectos/proyectos-profesor.jsx';
import RutaProtegida from './controller/ProteccionRutas.js';

function App() {
	
	return (
		<Router>
			<LimpiarToken />
			<Routes>
				<Route path="/" element={<Login />} />  {/* Ruta para la página principal */}
				<Route path="/menuCoordinador" element={<RutaProtegida element={<Menu />} requiredRoles={["1"]} />} /> 
				<Route path="/menuProfesor" element={<RutaProtegida element={<MenuProfesor />} requiredRoles={["2"]} />} />  
				<Route path="/menuEstudiante" element={<RutaProtegida element={<MenuEstudiante />} requiredRoles={["3"]} />} /> 
				<Route path="/registro" element={<Registro />} />  
				<Route path="/anteproyectosEstudiante" element={<RutaProtegida element={<AnteproyectosEstudiante />} requiredRoles={["3"]} />} />  
				<Route path="/anteproyectosCoordinador" element={<RutaProtegida element={<AnteproyectosCoordinador />} requiredRoles={["1"]} />} />
				<Route path="/darseBaja" element={<RutaProtegida element={<Abandonar />} requiredRoles={["3"]} />} />   
				<Route path="/asignaciones" element={<RutaProtegida element={<Asignaciones />} requiredRoles={["1"]} />} />
				<Route path="/aprobarProyectos" element={<RutaProtegida element={<AprobarProyectos />} requiredRoles={["1"]} />} /> 
				<Route path="/gestion-perfiles" element={<RutaProtegida element={<GestionPerfiles />} requiredRoles={["1"]} />} />
				<Route path="/gestion-perfiles/agregar-usuario" element={<RutaProtegida element={<AgregarUsuario />} requiredRoles={["1"]} />} />
				<Route path="/formulario-estudiantes" element={<RutaProtegida element={<FormularioEstudiantes />} requiredRoles={["3"]} />} />
				<Route path="/formulario-coordinador" element={<RutaProtegida element={<FormularioCoordinador />} requiredRoles={["1"]} />} />
				<Route path="/editarFormulario" element={<RutaProtegida element={<EditarFormulario />} requiredRoles={["3"]} />} />
				<Route path="/cargarProfesores" element={<RutaProtegida element={<CargarProfesores />} requiredRoles={["1"]} />} />
				<Route path="/citas" element={<RutaProtegida element={<Citas />} requiredRoles={["1"]} />} />
				<Route path="/citasMenu" element={<RutaProtegida element={<CitasMenu />} requiredRoles={["1"]} />} />
				<Route path="/calendario" element={<RutaProtegida element={<Calendario />} requiredRoles={["1"]} />} />
				<Route path="/dashboard-estudiantes" element={<RutaProtegida element={<DashboardEstudiantes />} requiredRoles={["1"]} />} />
				<Route path="/dashboard-menu" element={<RutaProtegida element={<DashboardMenu />} requiredRoles={["1"]} />} />
				<Route path="/disponibilidad-profesor" element={<RutaProtegida element={<DisponibilidadProfesor />} requiredRoles={["2"]} />} />
				<Route path="/citas-estudiante" element={<RutaProtegida element={<CitasEstudiante />} requiredRoles={["3"]} />} />
				<Route path="/citas-profesor" element={<RutaProtegida element={<CitasProfesor />} requiredRoles={["2"]} />} />
				<Route path="/editar-perfil" element={<RutaProtegida element={<EditarPerfil />} requiredRoles={["1", "2", "3"]} />} />
				<Route path="/carga-datos" element={<RutaProtegida element={<InicioCargaDatos />} requiredRoles={["1"]} />} />
				<Route path="/carga-datos/cantidad-proyectos-profesor" element={<RutaProtegida element={<CantidadProyectosProfesor />} requiredRoles={["1"]} />} />
				<Route path="/asignaciones/automatica" element={<RutaProtegida element={<AsignacionAutomatica />} requiredRoles={["1"]} />} />
				<Route path="/asignaciones/manual" element={<RutaProtegida element={<EdicionAsignacionProyectos />} requiredRoles={["1"]} />} />
				<Route path="/carga-datos">
					<Route index element={<RutaProtegida element={<InicioCargaDatos />} requiredRoles={["1"]} />} />
					<Route path="cantidad-proyectos-profesor" element={<RutaProtegida element={<CantidadProyectosProfesor />} requiredRoles={["1"]} />} />
				</Route>
				<Route path="/asignaciones">
					<Route index element={<RutaProtegida element={<InicioAsignaciones />} requiredRoles={["1"]} />} />
					<Route path="automatica" element={<RutaProtegida element={<AsignacionAutomatica />} requiredRoles={["1"]} />} />
					<Route path="manual" element={<RutaProtegida element={<EdicionAsignacionProyectos />} requiredRoles={["1"]} />} />
				</Route>
				<Route path="/recuperar-contraseña" element={<RecuperarContraseña />} />
				<Route path="/cambiar-contraseña/:token" element={<CambioContraseña />} />
				<Route path="/proyectos-profesor" element={<RutaProtegida element={<ProyectosAsignadosProfesor />} requiredRoles={["2"]} />} />
			</Routes>
		</Router>
	);
}

export default App;