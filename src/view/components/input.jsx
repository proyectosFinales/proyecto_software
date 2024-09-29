const FloatInput = ({ text, children }) => <>
    <label className="float-input">
        <span>{text}</span>
        {children}
    </label>
</>;

export { FloatInput };