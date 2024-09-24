import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './pages/MenuPrincipal';
import Anteproyectos from './pages/Anteproyectos';
import Asignaciones from './pages/Asignaciones';
import GestionPerfiles from './pages/GestionPerfiles';
// Otras importaciones de componentes

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Menu />} />  {/* Ruta para la página principal */}
        <Route path="/anteproyectos" element={<Anteproyectos />} />  {/* Ruta para anteproyectos */}
        <Route path="/asignaciones" element={<Asignaciones />} />
        <Route path="/gestion-perfiles" element={<GestionPerfiles />} />
        {/* Otras rutas para más secciones */}
      </Routes>
    </Router>
  );
}

export default App;
