/*layout.jsx*/
import { useState } from "react";
import ToastContainer from "./toast";
import SidebarCoordinador from "./SidebarCoordinador";
import SidebarProfesor from "./SidebarProfesor";
import SettingsCoordinador from "./SettingsCoordinador";
import AppFooter from "./Footer";
import HeaderCoordinador from "./HeaderCoordinador";
import HeaderProfesor from "./HeaderProfesor";
import HeaderEstudiante from "./HeaderEstudiante";

const Layout = ({ title, children, Sidebar = SidebarCoordinador, Settings = SettingsCoordinador }) => {
    return <>
        {/* <Title Sidebar={Sidebar} Settings={Settings}>{title}</Title> */}
        {
            Sidebar === SidebarCoordinador ? <HeaderCoordinador title={title}/> :
            Sidebar === SidebarProfesor ? <HeaderProfesor title={title}/> :
            <HeaderEstudiante title={title}/>
        }
        <main className="max-w-7xl mx-auto p-4 min-h-screen">
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
        <div className="fixed top-0 left-0 h-screen w-64 bg-gray-100" hidden={!showSidebar}>
            <Sidebar show={showSidebar} />
        </div>
        <div hidden={!showSettings} className="fixed top-0 right-0 w-64 h-screen bg-white shadow-md">
            <Settings show={showSettings} />
        </div>
        <header className="border-b-2 px-4 py-3 flex justify-between items-center bg-white">
            <button onClick={() => setShowSidebar(true)}>
                <i className="fa-solid fa-bars text-xl"></i>
            </button>
            <h1 className="text-xl font-bold">{children}</h1>
            <button onClick={() => setShowSettings(true)}>
                <i className="fa-solid fa-gear text-xl"></i>
            </button>
        </header>
    </>;
}
const Footer = () => <>
    <footer className="border-t-2 px-4 py-3 flex justify-between items-center bg-white">
        <p>Instituto Tecnológico de Costa Rica</p>
        <p>2024</p>
    </footer>
</>;

export default Layout;