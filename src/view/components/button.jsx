/*button.jsx*/
import styles from "../styles/button.module.css";

/**
 * 
 * @param {{
 *  type: "dark" | "light"
 * }} params 
 * @returns 
 */
const Button = ({ children, type, ...properties }) =>
    <button
        className={`${styles.button} ${styles[`button-${type || "blue"}`]}`}
        {...properties}
    >{children}</button>;

export default Button;