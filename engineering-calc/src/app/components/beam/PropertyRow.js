import styles from "./BeamInput.module.css";

export default function PropertyRow({
  title,
  symbol,
  value,
  onChange,
  unit,
  placeholder = "",
  error,
}) {
  return (
    <div className={styles.row}>
      <div className={styles.label}>{title}</div>

      <div className={styles.control}>
        <span className={styles.symbol}>{symbol} =</span>

        <input
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
        />

        <span className={styles.unit}>{unit}</span>
      </div>

      {error ? <p className={styles.errorText}>{error}</p> : null}
    </div>
  );
}
