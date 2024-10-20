import styles from "../styles/layout.module.css";
import ToastContainer from "./toast";
import PiePagina from "./Footer";

const Layout = ({ title, children }) => {
    return (<>
        <Title>{title}</Title>
        <main className={styles.layout}>
            {children}
        </main>
        <Footer/>
        <ToastContainer/>
    </>);
}

const Title = ({ children }) =>
    <header className={styles.title}>
        <i className="fa-solid fa-bars"></i>
        <h1>{children}</h1>
        <i className="fa-solid fa-gear"></i>
    </header>

const Footer = () =>
    <PiePagina />

export default Layout;