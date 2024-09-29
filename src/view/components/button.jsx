const Button = ({ children, ...properties }) =>
    <button className="dark-button" {...properties}>{children}</button>;

export default Button;