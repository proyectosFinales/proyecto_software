/*modal.jsx */
import { useState, useEffect } from "react";
import Button from "./button";
import styles from "../styles/modal.module.css";

const Modal = ({ modalRef = {}, title, footer, children, onAccept }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const open = () => {
        setIsOpen(true)
        document.body.style.overflowY = "hidden";
    }

    const close = () => {
        document.body.style.overflowY = "auto";
        setIsOpen(false);
    }

    useEffect(() => {
        modalRef.close = close;
        modalRef.open = open;
    }, [modalRef]);

    if(!isOpen) return <></>;
    return (
        <div className={styles.modal} >
            <section className={styles.dialog}>
                <header>
                    {title || <p></p>}
                    <button className={styles.closeButton} onClick={close}>&times;</button>
                </header>
                <main>
                    {children}
                </main>
                <footer>
                    {footer}
                    <Button type="light" onClick={onAccept}>Aceptar</Button>
                    <Button type="light" onClick={close}>Cancelar</Button>
                </footer>
            </section>
        </div>
    );
}

export default Modal;