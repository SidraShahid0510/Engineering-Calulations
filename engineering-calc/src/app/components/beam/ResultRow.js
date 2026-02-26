import styles from "./BeamInput.module.css";

export default function ResultRow({ label, symbol, value, unit }) {
  return (
    <div className={styles.resultRow}>
      <span className={styles.resultSymbol}>{symbol} =</span>

      <input className={styles.resultInput} value={value ?? ""} readOnly />

      <span className={styles.resultUnit}>{unit}</span>
    </div>
  );
}
