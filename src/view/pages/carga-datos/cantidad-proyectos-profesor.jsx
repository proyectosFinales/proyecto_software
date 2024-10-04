// import * as XLSX from "xlsx";
import Button from "../../components/button";
import Layout from "../../components/layout";
import styles from "../../styles/table.module.css";
import { FloatInput } from "../../components/input";

// const handleExcelChange = event => {
//     const file = event.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = (event) => {
//             const binaryStr = event.target.result;
//             // Leer el archivo Excel como binario
//             const workbook = XLSX.read(binaryStr, {type: "binary"});
//             // Leer la primera hoja del archivo
//             const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//             // Convertir los datos a JSON
//             const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
//             setExcelData({
//                 titles: data[0],
//                 data: data.slice(1).filter(d => d.length > 0),
//                 uploaded: true
//             });
//         };
//         // Leer el archivo como binario
//         reader.readAsBinaryString(file);
//     }
// }

const CantidadProyectosProfesor = () => {
    const profesores = Array(10).fill({ nombre: "Johanna Madrigal", cantidadProyectos: 3})

    return <>
        <Layout title="Asignación de cantidad de proyectos por profesor">
            <Button type="dark">Guardar cambios</Button>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Profesor</th>
                        <th>Cantidad de proyectos</th>
                    </tr>
                </thead>
                <tbody>
                    {profesores.map((profesor, i) =>
                        <tr key={`profesor-${i}`}>
                            <td>{profesor.nombre}</td>
                            <td>
                                <FloatInput text="">
                                    <input type="number" value={profesor.cantidadProyectos} onChange={()=>{}}/>
                                </FloatInput>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </Layout>
    </>;
}

export default CantidadProyectosProfesor;