/**
 * 
 * @param {{
 *  type: "dark" | "light"
 * }} params 
 * @returns 
 */
const Button = ({ children, type, ...properties }) =>
    <button className={`button button-${type || "dark"}`} {...properties}>{children}</button>;

export default Button;