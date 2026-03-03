import styles from "./BeamInput.module.css";

export default function PropertyRow({
  title,
  symbol,
  value,
  onChange,
  unit,
  placeholder = "",
  error,
  unitOptions = null,
  onUnitChange = null,
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

        {unitOptions && onUnitChange ? (
          <select
            className={styles.unitSelect}
            value={unit}
            onChange={(e) => onUnitChange(e.target.value)}
          >
            {unitOptions.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        ) : (
          <span className={styles.unit}>{unit}</span>
        )}
      </div>

      {error ? <p className={styles.errorText}>{error}</p> : null}
    </div>
  );
}
