import { BrowserRouter, Route, Routes } from "react-router-dom";
import Inicio from "./pages";
import InicioCargaDatos from "./pages/carga-datos";
import CantidadProyectosProfesor from "./pages/carga-datos/cantidad-proyectos-profesor";
import './styles/index.css';
import './styles/app.css';
import './styles/form.css';
import InicioAsignaciones from "./pages/asignaciones";
import AsignacionAutomatica from "./pages/asignaciones/asignacion-automatica";

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
			</Route>
		</Routes>
	</BrowserRouter>

export default App;