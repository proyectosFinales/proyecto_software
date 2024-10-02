import styles from "../styles/layout.module.css";

const Layout = ({ title, children }) => {
    return (<>
        <Title>{title}</Title>
        <main className={styles.layout}>
            {children}
        </main>
        <Footer/>
    </>);
}

const Title = ({ children }) =>
    <header className={styles.title}>
        <i className="fa-solid fa-bars"></i>
        <h1>{children}</h1>
        <i className="fa-solid fa-gear"></i>
    </header>

const Footer = () =>
    <footer className={styles.footer}>
        <p>Instituto Tecnológico de Costa Rica</p>
        <p>2024</p>
    </footer>

export default Layout;