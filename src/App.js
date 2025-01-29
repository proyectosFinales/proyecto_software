/**app.jsx */
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
// Controllers
import LimpiarToken from './controller/limpiezaToken.js';
import RutaProtegida from './controller/ProteccionRutas.js';
import * as AsignacionDefensaController from './controller/AsignacionDefensaController';

// Pages
import Avances from './view/pages/Avances.jsx';
import Login from './view/pages/Login.js';
import Menu from './view/pages/MenuPrincipal.js';
import MenuProfesor from './view/pages/MenuPrincipalProfesor.js';
import MenuEstudiante from './view/pages/MenuPrincipalEstudiante.js';
import GestionPerfiles from './view/pages/GestionPerfiles.jsx';
import AgregarUsuario from './view/pages/AgregarUsuario.js';
import FormularioEstudiantes from './view/pages/FormularioEstudiante.js';
import FormularioCarta from './view/pages/FormularioCarta.js';
import FormularioCoordinador from './view/pages/FormularioCoordinador.js';
import AnteproyectosEstudiante from './view/pages/AnteproyectosEstudiante.js';
import Categorias from './view/pages/Categorias.jsx';
import CartasEstudiante from './view/pages/CartasEstudiante.js';
import AnteproyectosCoordinador from './view/pages/AnteproyectosCoordinador.js';
import CargarProfesores from './view/pages/CargarProfesores';
import EditarFormulario from './view/pages/EditarFormulario.js';
import Empresas from './view/pages/Empresas.js';
import EditarEmpresa from './view/pages/EditarEmpresa.js';
import CrearContacto from './view/pages/CrearContacto.js';
import Contactos from './view/pages/Contactos.js';
import EditarContacto from './view/pages/EditarContacto.js';
import FormularioEmpresa from './view/pages/FormularioEmpresa.js';
import Citas from './view/pages/Citas.js';
import CitasMenu from './view/pages/CitasMenu.js';
import Calendario from './view/pages/Calendario.jsx';
import DisponibilidadProfesor from './view/pages/DisponibilidadProfesor.js';
import CitasEstudiante from './view/pages/CitasEstudiante.js';
import CitasProfesor from './view/pages/CitasProfesor.js';
import Registro from './view/pages/Registro.js';
import EditarPerfil from './view/pages/EditarPerfil.jsx';
import InicioCargaDatos from "./view/pages/carga-datos/index.jsx";
import CantidadProyectosProfesor from "./view/pages/carga-datos/cantidad-proyectos-profesor.jsx";
import Asignaciones from "./view/pages/asignacion-proyectos/index.jsx";
import AsignacionAutomatica from "./view/pages/asignacion-proyectos/asignacion-automatica.jsx";
import EdicionAsignacionProyectos from './view/pages/asignacion-proyectos/edicion.jsx';
import RecuperarContraseña from './view/pages/RecuperarContraseña.js';
import Abandonar from './view/pages/Abandonar.js';
import ActaDefensa from './view/pages/actas/ActaDefensa.js';
import ActaEntrega from './view/pages/actas/ActaEntrega.js';
import ConstanciaDefensa from './view/pages/actas/Constancia.js';
import InicioAsignaciones from './view/pages/asignacion-proyectos/index.jsx';
import CambioContraseña from './view/pages/CambioContraseña.js';
import AprobarProyectos from './view/pages/AprobarProyectos.js';
import ProyectosAsignadosProfesor from './view/pages/asignacion-proyectos/proyectos-profesor.jsx';
import Bitacoras from './view/pages/Bitacoras.js';
import Actas from './view/pages/Actas.js';
import AgregarBitacora from './view/pages/agregarBitacora.js';
import Entrada from './view/pages/verEntrada.js';
import AgregarEntrada from './view/pages/agregarEntrada.js';
import DashboardMenu from './view/pages/DashboardMenu';
import DashboardEstudiantes from './view/pages/DashboardEstudiantes.jsx';
import ProfessorEvaluationForm from './view/pages/calificaciones/calificacionAsesor.js';
import DetailedCalificacionesDashboard from './view/pages/calificaciones/calificacionAsesorDashboard.js';
import PermisosVerCalificaciones from './view/pages/calificaciones/permisosVerCalificaciones.js';
import Machotes from './view/pages/Machotes.js';
import CalificacionAsesor from './view/pages/calificaciones/calificacionAsesor';
import AsignacionDefensas from './view/pages/AsignacionDefensas';

function App() {
  return (
    <Router>
      <LimpiarToken />
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route
          path="/menuCoordinador"
          element={<RutaProtegida element={<Menu />} requiredRoles={["1"]} />}
        />
        <Route
          path="/menuProfesor"
          element={<RutaProtegida element={<MenuProfesor />} requiredRoles={["2"]} />}
        />
        <Route
          path="/menuEstudiante"
          element={<RutaProtegida element={<MenuEstudiante />} requiredRoles={["3"]} />}
        />
        
        <Route path="/registro" element={<Registro />} />
        <Route
          path="/anteproyectosEstudiante"
          element={<RutaProtegida element={<AnteproyectosEstudiante />} requiredRoles={["3"]} />}
        />
        <Route
          path="/cartasEstudiante"
          element={<RutaProtegida element={<CartasEstudiante />} requiredRoles={["3"]} />}
        />
        <Route
          path="/anteproyectosCoordinador"
          element={<RutaProtegida element={<AnteproyectosCoordinador />} requiredRoles={["1"]} />}
        />
        <Route
          path="/darseBaja"
          element={<RutaProtegida element={<Abandonar />} requiredRoles={["3"]} />}
        />
        <Route
          path="/categorias"
          element={<RutaProtegida element={<Categorias />} requiredRoles={["1"]} />}
        />
        <Route
          path="/asignaciones"
          element={<RutaProtegida element={<Asignaciones />} requiredRoles={["1"]} />}
        />
        <Route
          path="/aprobarProyectos"
          element={<RutaProtegida element={<AprobarProyectos />} requiredRoles={["1"]} />}
        />
        <Route
          path="/gestion-perfiles"
          element={<RutaProtegida element={<GestionPerfiles />} requiredRoles={["1"]} />}
        />
        <Route
          path="/gestion-perfiles/agregar-usuario"
          element={<RutaProtegida element={<AgregarUsuario />} requiredRoles={["1"]} />}
        />
        <Route
          path="/formularioEstudiantes"
          element={<RutaProtegida element={<FormularioEstudiantes />} requiredRoles={["3"]} />}
        />
        <Route
          path="/formularioCarta"
          element={<RutaProtegida element={<FormularioCarta />} requiredRoles={["3"]} />}
        />
        <Route
          path="/actas"
          element={<RutaProtegida element={<Actas />} requiredRoles={["2"]} />}
        />
        <Route
          path="/actaDefensa"
          element={<RutaProtegida element={<ActaDefensa />} requiredRoles={["2"]} />}
        />
        <Route
          path="/actaEntrega"
          element={<RutaProtegida element={<ActaEntrega />} requiredRoles={["2"]} />}
        />
        <Route
          path="/constancia"
          element={<RutaProtegida element={<ConstanciaDefensa />} requiredRoles={["2"]} />}
        />
        <Route
          path="/machotes"
          element={<RutaProtegida element={<Machotes />} requiredRoles={["2"]} />}
        />
        <Route
          path="/formulario-coordinador"
          element={<RutaProtegida element={<FormularioCoordinador />} requiredRoles={["1"]} />}
        />
        <Route
          path="/editarFormulario"
          element={<RutaProtegida element={<EditarFormulario />} requiredRoles={["3"]} />}
        />
        <Route
          path="/empresas"
          element={<RutaProtegida element={<Empresas />} requiredRoles={["1"]} />}
        />
        <Route
          path="/editarEmpresa"
          element={<RutaProtegida element={<EditarEmpresa />} requiredRoles={["1"]} />}
        />
        <Route
          path="/contactos"
          element={<RutaProtegida element={<Contactos />} requiredRoles={["1"]} />}
        />
        <Route
          path="/editarContacto"
          element={<RutaProtegida element={<EditarContacto />} requiredRoles={["1"]} />}
        />
        <Route
          path="/crearContacto"
          element={<RutaProtegida element={<CrearContacto />} requiredRoles={["1"]} />}
        />
        <Route
          path="/formularioEmpresa"
          element={<RutaProtegida element={<FormularioEmpresa />} requiredRoles={["1"]} />}
        />
        <Route
          path="/carga-datos"
          element={
            <RutaProtegida 
              element={<InicioCargaDatos />} 
              requiredRoles={["1"]} 
            />
          }
        />
        <Route
          path="/carga-datos/profesores"
          element={
            <RutaProtegida 
              element={<CargarProfesores />} 
              requiredRoles={["1"]} 
            />
          }
        />
        <Route
          path="/citas"
          element={<RutaProtegida element={<Citas />} requiredRoles={["1"]} />}
        />
        <Route
          path="/citasMenu"
          element={<RutaProtegida element={<CitasMenu />} requiredRoles={["1"]} />}
        />
        <Route
          path="/calendario"
          element={<RutaProtegida element={<Calendario />} requiredRoles={["1"]} />}
        />
        <Route
          path="/disponibilidad-profesor"
          element={<RutaProtegida element={<DisponibilidadProfesor />} requiredRoles={["2"]} />}
        />
        <Route
          path="/citas-estudiante"
          element={<RutaProtegida element={<CitasEstudiante />} requiredRoles={["3"]} />}
        />
        <Route
          path="/citas-profesor"
          element={<RutaProtegida element={<CitasProfesor />} requiredRoles={["2"]} />}
        />
        <Route
          path="/editar-perfil"
          element={<RutaProtegida element={<EditarPerfil />} requiredRoles={["1", "2", "3"]} />}
        />
        <Route
          path="/carga-datos/cantidad-proyectos"
          element={
            <RutaProtegida 
              element={<CantidadProyectosProfesor />} 
              requiredRoles={["1"]} 
            />
          }
        />
        <Route
          path="/asignaciones/automatica"
          element={<RutaProtegida element={<AsignacionAutomatica />} requiredRoles={["1"]} />}
        />
        <Route
          path="/asignaciones/manual"
          element={<RutaProtegida element={<EdicionAsignacionProyectos />} requiredRoles={["1"]} />}
        />
        
        {/* Nested routes example */}
        <Route path="/carga-datos">
          <Route
            index
            element={<RutaProtegida element={<InicioCargaDatos />} requiredRoles={["1"]} />}
          />
          <Route
            path="cantidad-proyectos-profesor"
            element={<RutaProtegida element={<CantidadProyectosProfesor />} requiredRoles={["1"]} />}
          />
        </Route>
        <Route path="/asignaciones">
          <Route
            index
            element={<RutaProtegida element={<InicioAsignaciones />} requiredRoles={["1"]} />}
          />
          <Route
            path="automatica"
            element={<RutaProtegida element={<AsignacionAutomatica />} requiredRoles={["1"]} />}
          />
          <Route
            path="manual"
            element={<RutaProtegida element={<EdicionAsignacionProyectos />} requiredRoles={["1"]} />}
          />
        </Route>
        
        <Route path="/recuperar-contraseña" element={<RecuperarContraseña />} />
        <Route path="/cambiar-contraseña/:token" element={<CambioContraseña />} />
        <Route
          path="/proyectos-profesor"
          element={<RutaProtegida element={<ProyectosAsignadosProfesor />} requiredRoles={["2"]} />}
        />
        <Route path='bitacoras' element={<RutaProtegida element={<Bitacoras />} requiredRoles={["2", "3"]} />} />
        <Route path="agregarBitacora" element={<RutaProtegida element={<AgregarBitacora />} requiredRoles={["2", "3"]} />}/>
        <Route path="entrada" element={<RutaProtegida element={<Entrada />} requiredRoles={["2", "3"]} />}/>
        <Route path="agregarEntrada" element={<RutaProtegida element={<AgregarEntrada />} requiredRoles={["2", "3"]} />}/>
        <Route path="/dashboardMenu" element={<DashboardMenu />} />
        <Route
          path="/dashboard-estudiantes"
          element={
            <RutaProtegida 
              element={<DashboardEstudiantes />} 
              requiredRoles={["1"]} 
            />
          }
        />
        <Route
          path="/calificar-asesor"
          element={
            <RutaProtegida 
              element={<CalificacionAsesor />} 
              requiredRoles={["3"]}
            />
          }
        />
        <Route
          path="/avances/:proyectoId"
          element={
            <RutaProtegida 
              element={<Avances />} 
              requiredRoles={["2"]}
            />
          }
        />
        <Route
          path="/dashboard-calificaciones"
          element={
            <RutaProtegida
              element={<DetailedCalificacionesDashboard />}
              requiredRoles={["1"]}
            />
          }
        />
        <Route
          path="/permisos-calificaciones"
          element={
            <RutaProtegida 
              element={<PermisosVerCalificaciones />} 
              requiredRoles={["1"]} 
            />
          }
        />
        <Route
          path="/asignacion-defensas"
          element={
            <RutaProtegida
              element={<AsignacionDefensas />}
              requiredRoles={["1"]} 
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
