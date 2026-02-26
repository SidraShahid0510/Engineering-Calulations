import styles from "./BeamInput.module.css";

export default function LoadInputRow({
  label,
  value,
  onChange,
  placeholder,
  unit,
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

      <span className={styles.loadUnit}>{unit}</span>
    </div>
  );
}
