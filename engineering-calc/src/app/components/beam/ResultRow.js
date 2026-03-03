import styles from "./BeamInput.module.css";

export default function ResultRow({
  label,
  symbol,
  value,
  unit,
  unitOptions = null,
  onUnitChange = null,
}) {
  return (
    <div className={styles.resultRow}>
      <span className={styles.resultSymbol}>{symbol} =</span>

      <input className={styles.resultInput} value={value ?? ""} readOnly />

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
        <span className={styles.resultUnit}>{unit}</span>
      )}
    </div>
  );
}
