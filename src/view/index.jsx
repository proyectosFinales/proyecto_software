import { BrowserRouter, Route, Routes } from "react-router-dom";
import Inicio from "./pages";
import CargaDatos from "./pages/carga-datos";
import CantidadProyectosProfesor from "./pages/carga-datos/cantidad-proyectos-profesor";
import './styles/index.css';
import './styles/app.css';
import './styles/form.css';

const App = () => {
    return <Rutas/>;
}

const Rutas = () =>
	<BrowserRouter pathname="">
		<Routes>
			<Route path="/" element={<Inicio/>}/>
			<Route path="/carga-datos">
				<Route index element={<CargaDatos/>}/>
				<Route path="cantidad-proyectos-profesor" element={<CantidadProyectosProfesor/>}/>
			</Route>
		</Routes>
	</BrowserRouter>

export default App;