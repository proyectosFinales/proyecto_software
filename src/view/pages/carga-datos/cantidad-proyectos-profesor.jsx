import { useRef } from "react";
import Button from "../../components/button";
import Modal from "../../components/modal";
import { FloatInput } from "../../components/input";

const CantidadProyectosProfesor = () => {
    const modalRef = useRef();

    return <>
        <h1>Asignación de cantidad de proyectos por profesor</h1>
        <div style={{textAlign: "center"}}>
            <FloatInput text="Ingrese el archivo de excel">
                <input type="file"/>
            </FloatInput>
            <Button onClick={() => modalRef.open()}>Subir datos</Button>
        </div>
        <Modal title="Confirmación" modalRef={modalRef}>

        </Modal>
    </>;
}

export default CantidadProyectosProfesor;