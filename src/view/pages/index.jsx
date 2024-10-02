import { Link } from "react-router-dom";

function Inicio() {
	// Función para manejar el clic en los iconos
	const handleClick = (section) => {
		alert(`Navegando a la sección: ${section}`);
		// Aquí puedes implementar la lógica de navegación o interacción
	};

	return (
		<div className="App">
			<header className="App-header">
				<h1>Inicio</h1>
				<div className="settings-icon">
					<i className="fas fa-cog"></i>
				</div>
			</header>

			<div className="menu-grid">
				<Link className="menu-item" to="/anteproyectos">
					<i className="fas fa-folder"></i>
					<p>Anteproyectos</p>
				</Link>
				<Link className="menu-item" to="/asignaciones">
					<i className="fas fa-users"></i>
					<p>Asignaciones</p>
				</Link>
				<div className="menu-item" onClick={() => handleClick('Gestión de perfiles')}>
					<i className="fas fa-user-circle"></i>
					<p>Gestión de perfiles</p>
				</div>
				<div className="menu-item" onClick={() => handleClick('Proyectos')}>
					<i className="fas fa-folder-open"></i>
					<p>Proyectos</p>
				</div>
				<Link className="menu-item" to="/carga-datos">
					<i className="fas fa-database"></i>
					<p>Cargar datos</p>
				</Link>
				<div className="menu-item" onClick={() => handleClick('Citas')}>
					<i className="fas fa-clock"></i>
					<p>Citas</p>
				</div>
			</div>

			<footer className="App-footer">
				<p>Instituto Tecnológico de Costa Rica<br />2024</p>
			</footer>
		</div>
	);
}

export default Inicio;