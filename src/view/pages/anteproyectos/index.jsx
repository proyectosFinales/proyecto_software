import Button from "../../components/button";
import Layout from "../../components/layout";

const Anteproyectos = () => {
    const anteproyectos = Array(10).fill({
        estudiante: {nombre: "Brayan Enrique Campos"},
        anteproyecto: {nombre: "Dauch Center for the Managm..."}
    });

    return <>
        <Layout title="Anteproyectos">
            <Button>Generar reporte de anteproyectos</Button>
            <table className="table">
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Propuesta de Proyecto</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {anteproyectos.map((ap, index) =>
                        <tr key={`anteproyecto-${index}`}>
                            <td>{ap.estudiante.nombre}</td>
                            <td>{ap.anteproyecto.nombre}</td>
                            <td className="table-buttons">
                                <Button>Revisar</Button>
                                <Button>Reporte</Button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </Layout>
    </>;
}

export default Anteproyectos;