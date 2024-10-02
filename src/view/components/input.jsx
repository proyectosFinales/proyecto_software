import styles from "../styles/input.module.css"

const FloatInput = ({ text, children }) => <>
    <label className={styles.floatInput}>
        <span>{text}</span>
        {children}
    </label>
</>;

export { FloatInput };