import styles from "./BeamInput.module.css";
import ResultRow from "./ResultRow";
import BeamDiagram from "./BeamDiagram";

export default function BeamResultPanel({
  output,
  xValue,
  setXValue,
  atX,
  L,
  calculateAtX,
}) {
  // If no output yet, show message
  if (!output) {
    return (
      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Results</h2>
        <p className={styles.muted}>Fill inputs and click Calculate.</p>
      </div>
    );
  }

  // If output has an info/error message
  if (output.error) {
    return (
      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Results</h2>
        <p className={styles.errorText}>{output.error}</p>
      </div>
    );
  }

  if (output.info) {
    return (
      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Results</h2>
        <p className={styles.muted}>{output.info}</p>
      </div>
    );
  }

  // For now we only fill these 4 results for point load:
  const RA = output?.results?.RA;
  const RB = output?.results?.RB;
  const Mmax = output?.results?.Mmax;
  const xm = output?.results?.xm;

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Results</h2>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Reactions</h3>
        <ResultRow symbol="Rₐ" label="RA" value={fmt(RA)} unit="kN" />
        <ResultRow symbol="Rᵦ" label="RB" value={fmt(RB)} unit="kN" />
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Bending Moment</h3>
        <ResultRow symbol="Mᵤ" label="Mu" value={fmt(Mmax)} unit="kN·m" />
        <ResultRow symbol="xₘ" label="xm" value={fmt(xm)} unit="m" />
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          Request results at a specific point
        </h3>
        {/* Just UI for now (no logic yet) */}
        <div className={styles.requestRow}>
          <span className={styles.requestSymbol}>x =</span>
          <input
            className={styles.requestInput}
            value={xValue}
            onChange={(e) => setXValue(e.target.value)}
            placeholder="enter x"
          />
          <span className={styles.requestUnit}>m</span>
        </div>
        {atX?.error ? <p className={styles.errorText}>{atX.error}</p> : null}
        {atX?.info ? <p className={styles.muted}>{atX.info}</p> : null}

        <ResultRow symbol="M(x)" value={fmt(atX?.Mx)} unit="kN·m" />
        <ResultRow symbol="V(x)" value={fmt(atX?.Vx)} unit="kN" />
        <ResultRow
          symbol="d(x)"
          value={atX?.dx == null ? "" : (atX.dx * 1000).toFixed(3)}
          unit="mm"
        />

        <ResultRow symbol="θ(x)" label="thx" value="" unit="mrad" />
      </div>
      {/* 👇 ADD DIAGRAM HERE */}
      {output?.results ? (
        <BeamDiagram L={L} calculateAtX={calculateAtX} />
      ) : null}
    </div>
  );
}

function fmt(n) {
  if (n === undefined || n === null || Number.isNaN(n)) return "";
  return Number(n).toFixed(3);
}
