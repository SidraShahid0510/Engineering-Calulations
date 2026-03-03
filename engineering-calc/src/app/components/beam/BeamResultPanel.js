import styles from "./BeamInput.module.css";
import ResultRow from "./ResultRow";
import BeamDiagram from "./BeamDiagram";
import {
  fromNewton,
  fromMomentNm,
  fromMeter,
  fromDeflectionMeter,
  fromSlopeRad,
} from "./units";
import { useState, useEffect } from "react";
export default function BeamResultPanel({
  output,
  xValue,
  setXValue,
  atX,
  L,
  calculateAtX,
  unitSystem,

  PUnit,
  MUnit,
  LUnit,

  pUnits,
  mUnits,
  lengthUnits,

  setPUnit,
  setMUnit,
  setLUnit,
  xUnit,
  setXUnit,
  deflUnits,
  slopeUnits,
}) {
  const [RAUnit, setRAUnit] = useState(PUnit);
  const [RBUnit, setRBUnit] = useState(PUnit);
  const [MuUnit, setMuUnit] = useState(MUnit);
  const [xmUnit, setXmUnit] = useState(LUnit);
  const [MxUnit, setMxUnit] = useState(MUnit);
  const [VxUnit, setVxUnit] = useState(PUnit);
  const [dxUnit, setDxUnit] = useState(unitSystem === "metric" ? "mm" : "in");
  const [thetaUnit, setThetaUnit] = useState("mrad");

  // reset when system changes
  useEffect(() => {
    setDxUnit(unitSystem === "metric" ? "mm" : "in");
  }, [unitSystem]);

  useEffect(() => {
    setRAUnit(PUnit);
    setRBUnit(PUnit);
  }, [PUnit]);
  useEffect(() => setMuUnit(MUnit), [MUnit]);
  useEffect(() => setXmUnit(LUnit), [LUnit]);
  useEffect(() => setMxUnit(MUnit), [MUnit]);
  useEffect(() => setVxUnit(PUnit), [PUnit]);
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

  const RA_display = fromNewton(output?.results?.RA, unitSystem, RAUnit);
  const RB_display = fromNewton(output?.results?.RB, unitSystem, RBUnit);
  const Mu_display = fromMomentNm(output?.results?.Mmax, unitSystem, MuUnit);
  const xm_display = fromMeter(output?.results?.xm, unitSystem, xmUnit);
  const Mx_display = fromMomentNm(atX?.Mx, unitSystem, MxUnit);
  const Vx_display = fromNewton(atX?.Vx, unitSystem, VxUnit);
  const dx_display =
    atX?.dx == null ? null : fromDeflectionMeter(atX.dx, unitSystem, dxUnit);
  const theta_display =
    atX?.thx == null ? null : fromSlopeRad(atX.thx, thetaUnit);

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Results</h2>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Reactions</h3>
        <ResultRow
          symbol="Rₐ"
          label="RA"
          value={fmt(RA_display)}
          unit={RAUnit}
          unitOptions={pUnits}
          onUnitChange={setRAUnit}
        />
        <ResultRow
          symbol="Rᵦ"
          label="RB"
          value={fmt(RB_display)}
          unit={RBUnit}
          unitOptions={pUnits}
          onUnitChange={setRBUnit}
        />
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Bending Moment</h3>
        <ResultRow
          symbol="Mᵤ"
          value={fmt(Mu_display)}
          unit={MuUnit}
          unitOptions={mUnits}
          onUnitChange={setMuUnit}
        />
        <ResultRow
          symbol="xₘ"
          value={fmt(xm_display)}
          unit={xmUnit}
          unitOptions={lengthUnits}
          onUnitChange={setXmUnit}
        />
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
          <select
            className={styles.unitSelect}
            value={xUnit}
            onChange={(e) => setXUnit(e.target.value)}
          >
            {lengthUnits.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
        {atX?.error ? <p className={styles.errorText}>{atX.error}</p> : null}
        {atX?.info ? <p className={styles.muted}>{atX.info}</p> : null}

        <ResultRow
          symbol="M(x)"
          value={fmt(Mx_display)}
          unit={MxUnit}
          unitOptions={mUnits}
          onUnitChange={setMxUnit}
        />

        <ResultRow
          symbol="V(x)"
          value={fmt(Vx_display)}
          unit={VxUnit}
          unitOptions={pUnits}
          onUnitChange={setVxUnit}
        />
        <ResultRow
          symbol="d(x)"
          value={dx_display == null ? "Enter E & I" : fmt(dx_display)}
          unit={dxUnit}
          unitOptions={deflUnits}
          onUnitChange={setDxUnit}
        />
        <ResultRow
          symbol="θ(x)"
          value={theta_display == null ? "Enter E & I" : fmt(theta_display)}
          unit={thetaUnit}
          unitOptions={slopeUnits}
          onUnitChange={setThetaUnit}
        />
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
