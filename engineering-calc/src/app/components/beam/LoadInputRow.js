import styles from "./BeamInput.module.css";

export default function LoadInputRow({
  label,
  value,
  onChange,
  placeholder,
  unit,
  unitOptions = null,
  onUnitChange = null,
}) {
  return (
    <div className={styles.loadRow}>
      <span className={styles.loadSymbol}>{label} =</span>

      <input
        className={styles.loadInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
  );
}
