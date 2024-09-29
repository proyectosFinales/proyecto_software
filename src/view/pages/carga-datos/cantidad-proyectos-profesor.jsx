import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import Button from "../../components/button";
import Modal from "../../components/modal";
import { FloatInput } from "../../components/input";

const CantidadProyectosProfesor = () => {
    const modalRef = useRef();
    const [excelData, setExcelData] = useState({titles: [], data: []});

    const handleExcelChange = event => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const binaryStr = event.target.result;
                // Leer el archivo Excel como binario
                const workbook = XLSX.read(binaryStr, {type: "binary"});
                // Leer la primera hoja del archivo
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                // Convertir los datos a JSON
                const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                setExcelData({
                    titles: data[0],
                    data: data.slice(1).filter(d => d.length > 0)
                });
            };
            // Leer el archivo como binario
            reader.readAsBinaryString(file);
        }
    }

    return <>
        <h1 style={{textAlign: "center"}}>Asignación de cantidad de proyectos por profesor</h1>
        <div style={{ textAlign: "center" }}>
            <FloatInput text="Ingrese el archivo de excel">
                <input type="file" accept=".xlsx" onChange={handleExcelChange} />
            </FloatInput>
            <Button onClick={() => modalRef.open()} type="dark">Subir datos</Button>
        </div>
        <Modal title="Subir datos de cantidad de proyectos por profesor?" modalRef={modalRef}>
            <div>Cantidad de filas: {excelData.data.length}</div>
            <section>
                {excelData.data.map((row, i) =>
                    <ul key={`row-${i}`}>
                        {row.map((data, j) =>
                            <li key={`cell-${i}-${j}`}>
                                <b>{excelData.titles[j]}: </b> {data}
                            </li>
                        )}
                        <hr/>
                    </ul>
                )}
            </section>
        </Modal>
    </>;
}

export default CantidadProyectosProfesor;