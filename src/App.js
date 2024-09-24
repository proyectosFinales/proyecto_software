import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './MenuPrincipal';
import Anteproyectos from './Anteproyectos';
import Asignaciones from './Asignaciones';
import GestionPerfiles from './GestionPerfiles';
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
