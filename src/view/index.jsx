import './styles/index.css';
import './styles/app.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Inicio from "./pages";
import InicioCargaDatos from "./pages/carga-datos";
import CantidadProyectosProfesor from "./pages/carga-datos/cantidad-proyectos-profesor";
import InicioAsignaciones from "./pages/asignacion-proyectos";
import AsignacionAutomatica from "./pages/asignacion-proyectos/asignacion-automatica";
import Anteproyectos from "./pages/anteproyectos";
import EdicionAsignacionProyectos from './pages/asignacion-proyectos/edicion';

const App = () => {
    return <Rutas/>;
}

const Rutas = () =>
	<BrowserRouter pathname="">
		<Routes>
			<Route path="/" element={<Inicio/>}/>
			<Route path="/carga-datos">
				<Route index element={<InicioCargaDatos/>}/>
				<Route path="cantidad-proyectos-profesor" element={<CantidadProyectosProfesor/>}/>
			</Route>
			<Route path="/asignaciones">
				<Route index element={<InicioAsignaciones/>}/>
				<Route path="automatica" element={<AsignacionAutomatica/>}/>
				<Route path="manual" element={<EdicionAsignacionProyectos/>}/>
			</Route>
			<Route path="/anteproyectos" element={<Anteproyectos/>}></Route>
		</Routes>
	</BrowserRouter>

export default App;