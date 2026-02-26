"use client";

import { useState, useMemo } from "react";
import styles from "./BeamCalculator.module.css";
import BeamInputPanel from "../../components/beam/BeamInputPanel";
import BeamResultPanel from "../../components/beam/BeamResultPanel";
import {
  calcPointLoad,
  calcUDL,
  calcPointCentered,
  calcUDLTotal,
  calcPointMoment,
  calcTriangularFull,
  calcTrapezoidalFull,
  calcPointAtX,
  calcTriangularAtX,
  calcTrapezoidalAtX,
  calcPointMomentAtX,
  calcPointDeflectionAtX,
  calcTriangularDeflectionAtX,
} from "../../components/beam/beamCalcs";
import BeamDiagram from "../../components/beam/BeamDiagram";

export default function BeamPage() {
  // 1) Inputs (Key Properties)
  const [props, setProps] = useState({ L: "", E: "", I: "" });

  // 2) Loading section
  const [loadType, setLoadType] = useState("udl");
  const [loadInputs, setLoadInputs] = useState({});

  // 3) Output (what to show on the right after Calculate)
  const [output, setOutput] = useState(null);
  const [errors, setErrors] = useState({});
  const [xValue, setXValue] = useState("");

  const atX = useMemo(() => {
    if (!output?.results) return null;
    if (!xValue) return null;

    const L = Number(props.L);
    const x = Number(xValue);

    if (!isFinite(L) || L <= 0) return null;
    if (!isFinite(x)) return { error: "x must be a number" };
    if (x < 0 || x > L) return { error: "x must be between 0 and L" };

    if (loadType === "point") {
      const P = Number(loadInputs.P);
      const a = Number(loadInputs.a);

      if (!isFinite(P) || P <= 0) return { error: "Enter valid P" };
      if (!isFinite(a) || a <= 0 || a >= L)
        return { error: "a must be between 0 and L" };

      const resultAtX = calcPointAtX({ L, P, a, x });
      if (!resultAtX.ok) return { error: resultAtX.message };

      const E = Number(props.E);
      const I = Number(props.I);

      let dx = null;
      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        const def = calcPointDeflectionAtX({ L, P, a, x, E, I });
        if (def.ok) dx = def.results.dx;
      }

      return { ...resultAtX.results, dx };
    } else if (loadType === "pointCentered") {
      const P = Number(loadInputs.P);

      if (!isFinite(P) || P <= 0) return { error: "Enter valid P" };

      const a = L / 2;

      const resultAtX = calcPointAtX({ L, P, a, x });
      if (!resultAtX.ok) return { error: resultAtX.message };

      const E = Number(props.E);
      const I = Number(props.I);

      let dx = null;

      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        const def = calcPointDeflectionAtX({ L, P, a, x, E, I });
        if (def.ok) dx = def.results.dx;
      }

      return { ...resultAtX.results, dx };
    } else if (loadType === "udl") {
      const w = Number(loadInputs.w);
      if (!isFinite(w) || w <= 0) return { error: "Enter valid w" };

      const RA = (w * L) / 2;
      const Vx = RA - w * x;
      const Mx = RA * x - (w * x * x) / 2;

      const E = Number(props.E);
      const I = Number(props.I);

      let dx = null;

      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        dx =
          (w * x * (Math.pow(L, 3) - 2 * L * x * x + Math.pow(x, 3))) /
          (24 * E * I);
      }

      return { Vx, Mx, dx };
    } else if (loadType === "udlTotal") {
      const W = Number(loadInputs.W);
      if (!isFinite(W) || W <= 0) return { error: "Enter valid W" };

      const w = W / L;
      const RA = (w * L) / 2; // = W/2
      return {
        Vx: RA - w * x,
        Mx: RA * x - (w * x * x) / 2,
      };
    } else if (loadType === "triangular") {
      const w1 = Number(loadInputs.w1);
      if (!isFinite(w1) || w1 <= 0) return { error: "Enter valid w1" };
      const direction = loadInputs.direction || "ascending";
      const resultAtX = calcTriangularAtX({ L, w1, x, direction });
      if (!resultAtX.ok) return { error: resultAtX.message };

      const E = Number(props.E);
      const I = Number(props.I);

      let dx = null;
      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        const def = calcTriangularDeflectionAtX({ L, w1, x, E, I, direction });
        if (def.ok) dx = def.results.dx;
      }

      return { ...resultAtX.results, dx };
    } else if (loadType === "pointMoment") {
      const M = Number(loadInputs.M);
      const a = Number(loadInputs.a);

      if (!isFinite(M) || M === 0) return { error: "Enter valid M (not 0)" };
      if (!isFinite(a) || a <= 0 || a >= L)
        return { error: "a must be between 0 and L" };

      const resultAtX = calcPointMomentAtX({ L, M, a, x });
      return resultAtX.ok ? resultAtX.results : { error: resultAtX.message };
    } else if (loadType === "trapezoidal") {
      const w1 = Number(loadInputs.w1);
      const w2 = Number(loadInputs.w2);

      if (!isFinite(w1) || w1 < 0) return { error: "Enter valid w1 (>= 0)" };
      if (!isFinite(w2) || w2 < 0) return { error: "Enter valid w2 (>= 0)" };
      if (w1 === 0 && w2 === 0) return { error: "w1 and w2 cannot both be 0" };

      const resultAtX = calcTrapezoidalAtX({ L, w1, w2, x });
      return resultAtX.ok ? resultAtX.results : { error: resultAtX.message };
    }

    return { info: "V(x) and M(x) not implemented for this load type yet." };
  }, [output, xValue, props.L, props.E, props.I, loadType, loadInputs]);

  function calculateAtX(x) {
    const L = Number(props.L);
    if (!isFinite(L) || L <= 0) return null;
    if (!isFinite(x) || x < 0 || x > L) return null;

    // POINT LOAD
    if (loadType === "point") {
      const P = Number(loadInputs.P);
      const a = Number(loadInputs.a);

      if (!isFinite(P) || P <= 0) return null;
      if (!isFinite(a) || a <= 0 || a >= L) return null;

      const vm = calcPointAtX({ L, P, a, x });
      if (!vm.ok) return null;

      const E = Number(props.E);
      const I = Number(props.I);

      let dx = null;
      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        const def = calcPointDeflectionAtX({ L, P, a, x, E, I });
        if (def.ok) dx = def.results.dx;
      }

      return { ...vm.results, dx };
    }

    // POINT LOAD (CENTERED)
    if (loadType === "pointCentered") {
      const P = Number(loadInputs.P);
      if (!isFinite(P) || P <= 0) return null;

      const a = L / 2;

      const vm = calcPointAtX({ L, P, a, x });
      if (!vm.ok) return null;

      const E = Number(props.E);
      const I = Number(props.I);

      let dx = null;
      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        const def = calcPointDeflectionAtX({ L, P, a, x, E, I });
        if (def.ok) dx = def.results.dx;
      }

      return { ...vm.results, dx };
    }
    // UDL
    if (loadType === "udl") {
      const w = Number(loadInputs.w);
      if (!isFinite(w) || w <= 0) return null;

      const RA = (w * L) / 2;
      const Vx = RA - w * x;
      const Mx = RA * x - (w * x * x) / 2;

      // -------- DEFLECTION PART --------
      const E = Number(props.E);
      const I = Number(props.I);

      let dx = 0;

      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        dx =
          (w * x * (Math.pow(L, 3) - 2 * L * x * x + Math.pow(x, 3))) /
          (24 * E * I);
      }

      return { Vx, Mx, dx };
    }
    // UDL TOTAL
    if (loadType === "udlTotal") {
      const W = Number(loadInputs.W);
      if (!isFinite(W) || W <= 0) return null;

      const w = W / L;
      const RA = (w * L) / 2;
      return {
        Vx: RA - w * x,
        Mx: RA * x - (w * x * x) / 2,
      };
    }

    // TRIANGULAR
    if (loadType === "triangular") {
      const w1 = Number(loadInputs.w1);
      if (!isFinite(w1) || w1 <= 0) return null;
      const direction = loadInputs.direction || "ascending";
      const vm = calcTriangularAtX({ L, w1, x, direction });
      if (!vm.ok) return null;

      const E = Number(props.E);
      const I = Number(props.I);

      let dx = null;
      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        const def = calcTriangularDeflectionAtX({ L, w1, x, E, I, direction });
        if (def.ok) dx = def.results.dx;
      }

      return { ...vm.results, dx };
    }
    // POINT MOMENT
    if (loadType === "pointMoment") {
      const M = Number(loadInputs.M);
      const a = Number(loadInputs.a);
      if (!isFinite(M) || M === 0) return null;
      if (!isFinite(a) || a <= 0 || a >= L) return null;

      const res = calcPointMomentAtX({ L, M, a, x });
      return res.ok ? res.results : null;
    }

    // TRAPEZOIDAL
    if (loadType === "trapezoidal") {
      const w1 = Number(loadInputs.w1);
      const w2 = Number(loadInputs.w2);
      if (!isFinite(w1) || w1 < 0) return null;
      if (!isFinite(w2) || w2 < 0) return null;
      if (w1 === 0 && w2 === 0) return null;

      const res = calcTrapezoidalAtX({ L, w1, w2, x });
      return res.ok ? res.results : null;
    }

    return null;
  }

  function handleCalculate() {
    // -----------------------------
    // 1️⃣ Basic validation (Beam length)
    // -----------------------------
    const nextErrors = {};

    const L = Number(props.L);

    if (!props.L || !isFinite(L) || L <= 0) {
      nextErrors.L = "Please enter a valid beam length (L > 0).";
    }

    // If there are validation errors → stop here
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setOutput(null);
      return;
    }

    // Clear previous errors
    setErrors({});

    // -----------------------------
    // 2️⃣ Choose calculation based on load type
    // -----------------------------
    let calcResult = null;

    // -------- Point Load --------
    if (loadType === "point") {
      const P = Number(loadInputs.P);
      const a = Number(loadInputs.a);

      const x = xValue ? Number(xValue) : undefined;

      calcResult = calcPointLoad({ L, P, a, x });
    } else if (loadType === "pointCentered") {
      const P = Number(loadInputs.P);
      calcResult = calcPointCentered({ L, P });
    }

    // -------- Uniform Distributed Load --------
    else if (loadType === "udl") {
      const w = Number(loadInputs.w);

      calcResult = calcUDL({ L, w });
    } else if (loadType === "udlTotal") {
      const W = Number(loadInputs.W);
      calcResult = calcUDLTotal({ L, W });
    } else if (loadType === "pointMoment") {
      const M = Number(loadInputs.M);
      const a = Number(loadInputs.a);

      calcResult = calcPointMoment({ L, M, a });
    } else if (loadType === "triangular") {
      const w1 = Number(loadInputs.w1);
      calcResult = calcTriangularFull({ L, w1 });
    } else if (loadType === "trapezoidal") {
      const w1 = Number(loadInputs.w1);
      const w2 = Number(loadInputs.w2);

      calcResult = calcTrapezoidalFull({ L, w1, w2 });
    }
    // -------- Not implemented yet --------
    else {
      setOutput({
        info: "Calculation for this load type is not implemented yet.",
      });
      return;
    }

    // -----------------------------
    // 3️⃣ Handle calculation result
    // -----------------------------
    if (!calcResult.ok) {
      // If calculator returned an error
      setOutput({
        error: calcResult.message,
      });
      return;
    }

    // -----------------------------
    // 4️⃣ Success → Save results
    // -----------------------------
    setOutput({
      type: loadType,
      results: calcResult.results,
    });
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Beam Calculator</h1>

      <section className={styles.grid}>
        <BeamInputPanel
          props={props}
          setProps={setProps}
          loadType={loadType}
          setLoadType={setLoadType}
          loadInputs={loadInputs}
          setLoadInputs={setLoadInputs}
          onCalculate={handleCalculate}
          errors={errors}
        />

        <BeamResultPanel
          output={output}
          xValue={xValue}
          setXValue={setXValue}
          atX={atX}
          L={Number(props.L)}
          calculateAtX={calculateAtX}
        />
      </section>
    </main>
  );
}
