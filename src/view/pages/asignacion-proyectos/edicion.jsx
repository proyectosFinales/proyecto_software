import Button from "../../components/button";
import Layout from "../../components/layout";
import styles from "../../styles/table.module.css";

const EdicionAsignacionProyectos = () => {
    const proyectosProfesores = Array(10).fill({
        nombre: "Johanna Madrigal",
        proyectos: Array(3).fill({estudiante: {nombre: "Brayan Enrique Campos"}})
    });

    return <>
        <Layout title="Edición de asignación de proyectos">
            <Button>Generar reporte de asignaciones</Button>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Profesor</th>
                        <th>Estudiantes</th>
                    </tr>
                </thead>
                <tbody>
                    {proyectosProfesores.map((profesor, i) =>
                        <tr key={`profesor-${i}`}>
                            <td>{profesor.nombre}</td>
                            <td>
                                <ul className="proyectos-profesores">
                                    {profesor.proyectos.map((proyecto, j) =>
                                        <li key={`proyecto-${j}-profesor-${i}`}>
                                            <span>{proyecto.estudiante.nombre}</span>
                                            <button>
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </li>
                                    )}
                                    <Button>Agregar proyecto</Button>
                                </ul>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </Layout>
    </>;
}

export default EdicionAsignacionProyectos;