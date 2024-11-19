import { useState } from "react";
import styles from "../styles/layout.module.css";
import ToastContainer from "./toast";
import SidebarCoordinador from "./SidebarCoordinador";
import SidebarProfesor from "./SidebarProfesor";
import SidebarEstudiante from "./SidebarEstudiante";
import SettingsCoordinador from "./SettingsCoordinador";
import AppFooter from "./Footer";
import HeaderCoordinador from "./HeaderCoordinador";
import HeaderProfesor from "./HeaderProfesor";
import HeaderEstudiante from "./HeaderEstudiante";

const Layout = ({ title, children, Sidebar=SidebarCoordinador, Settings=SettingsCoordinador }) => {
    return <>
        {/* <Title Sidebar={Sidebar} Settings={Settings}>{title}</Title> */}
        {
            Sidebar === SidebarCoordinador ? <HeaderCoordinador title={title}/> :
            Sidebar === SidebarProfesor ? <HeaderProfesor title={title}/> :
            <HeaderEstudiante title={title}/>
        }
        <main className={styles.layout}>
            {children}
        </main>
        {/* <Footer/> */}
        <AppFooter/>
        <ToastContainer/>
    </>;
}

const Title = ({ children, Sidebar, Settings }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    return <>
        <div className={styles.navContainer}>
            <Sidebar show={showSidebar}/>
            <Settings show={showSettings}/>
        </div>
        <header className={styles.title}>
            <button onClick={() => setShowSidebar(true)}>
                <i className="fa-solid fa-bars"></i>
            </button>
            <h1>{children}</h1>
            <button onClick={() => setShowSettings(true)}>
                <i className="fa-solid fa-gear"></i>
            </button>
        </header>
    </>;
}
const Footer = () => <>
    <footer className={styles.footer}>
        <p>Instituto Tecnológico de Costa Rica</p>
        <p>2024</p>
    </footer>
</>;

export default Layout;