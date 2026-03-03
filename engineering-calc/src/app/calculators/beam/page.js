"use client";

import { useState, useMemo, useEffect } from "react";
import styles from "./BeamCalculator.module.css";
import BeamInputPanel from "../../components/beam/BeamInputPanel";
import BeamResultPanel from "../../components/beam/BeamResultPanel";
import { computeThetaDeflectionFromMoment } from "../../components/beam/numericalBeamEI";
import {
  getLengthUnits,
  getToMeter,
  getEUnits,
  getToPa,
  getIUnits,
  getToM4,
  getWUnits,
  getToNm,
  getForceUnits,
  getToN,
  getMomentUnits,
  getToMomentNm,
  getDeflectionUnits,
  getSlopeUnits,
} from "../../components/beam/units";
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
  calcPartialUniform,
  calcPartialUniformAtX,
  calcPartialTriangular,
  calcPartialTriangularAtX,
  calcPartialTrapezoidal,
  calcPartialTrapezoidalAtX,
  calcTrapezoidalSlab,
  calcTrapezoidalSlabAtX,
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
  const [unitSystem, setUnitSystem] = useState("metric");
  const [LUnit, setLUnit] = useState("m");
  const [EUnit, setEUnit] = useState("MPa"); // default metric
  const [IUnit, setIUnit] = useState("mm4"); // default
  const [wUnit, setWUnit] = useState("kN/m");
  const [PUnit, setPUnit] = useState("kN");
  const [MUnit, setMUnit] = useState("kN·m");
  const [xUnit, setXUnit] = useState(LUnit);
  useEffect(() => {
    // When switching system, reset default units so they MATCH the system

    if (unitSystem === "metric") {
      setLUnit("m");
      setWUnit("kN/m");
      setPUnit("kN");
      setMUnit("kN·m");
    } else {
      setLUnit("ft");
      setWUnit("kip/ft");
      setPUnit("kip");
      setMUnit("kip·ft");
    }
  }, [unitSystem]);
  useEffect(() => {
    setXUnit(LUnit);
  }, [LUnit]);

  const atX = useMemo(() => {
    // Must have results + x input
    if (!output?.results) return null;
    if (!xValue) return null;

    // 1) Convert common values ONCE (base units)

    const L = Number(props.L) * getToMeter(unitSystem, LUnit);
    const x = Number(xValue) * getToMeter(unitSystem, xUnit);

    // ✅ IMPORTANT: convert to base units for deflection/slope
    const E = Number(props.E) * getToPa(unitSystem, EUnit); // Pa
    const I = Number(props.I) * getToM4(unitSystem, IUnit); // m^4

    // -----------------------------
    // 2) Validate L and x
    // -----------------------------
    if (!isFinite(L) || L <= 0) return null;
    if (!isFinite(x)) return { error: "x must be a number" };
    if (x < 0 || x > L) return { error: "x must be between 0 and L" };

    // -----------------------------
    // 3) Load cases
    // -----------------------------

    // ✅ POINT LOAD (P at a)
    if (loadType === "point") {
      const P = Number(loadInputs.P) * getToN(unitSystem, PUnit);
      const a = Number(loadInputs.a) * getToMeter(unitSystem, LUnit);

      if (!isFinite(P) || P <= 0) return { error: "Enter valid P" };
      if (!isFinite(a) || a <= 0 || a >= L)
        return { error: "a must be between 0 and L" };

      const resultAtX = calcPointAtX({ L, P, a, x });
      if (!resultAtX.ok) return { error: resultAtX.message };

      // deflection (optional)
      let dx = null;
      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        const def = calcPointDeflectionAtX({ L, P, a, x, E, I });
        if (def.ok) dx = def.results.dx;
      }

      // slope (we added earlier)
      let thx = null;
      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        const b = L - a;

        if (x <= a) {
          thx = (P * b * x * (L * L - b * b - x * x)) / (6 * L * E * I);
        } else {
          const s = L - x;
          thx = (P * a * s * (L * L - a * a - s * s)) / (6 * L * E * I);
        }
      }

      return { ...resultAtX.results, dx, thx };
    }

    // ✅ POINT LOAD (CENTERED)
    if (loadType === "pointCentered") {
      const P = Number(loadInputs.P) * getToN(unitSystem, PUnit);
      if (!isFinite(P) || P <= 0) return { error: "Enter valid P" };

      const a = L / 2;

      const resultAtX = calcPointAtX({ L, P, a, x });
      if (!resultAtX.ok) return { error: resultAtX.message };

      let dx = null;
      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        const def = calcPointDeflectionAtX({ L, P, a, x, E, I });
        if (def.ok) dx = def.results.dx;
      }

      // same slope formula as point load, with a = L/2
      let thx = null;
      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        const b = L - a; // also L/2
        if (x <= a) {
          thx = (P * b * x * (L * L - b * b - x * x)) / (6 * L * E * I);
        } else {
          const s = L - x;
          thx = (P * a * s * (L * L - a * a - s * s)) / (6 * L * E * I);
        }
      }

      return { ...resultAtX.results, dx, thx };
    }

    // ✅ UDL (w over whole span)
    if (loadType === "udl") {
      const w = Number(loadInputs.w) * getToNm(unitSystem, wUnit);
      if (!isFinite(w) || w <= 0) return { error: "Enter valid w" };

      // V(x) and M(x) (base units: N, N·m)
      const RA = (w * L) / 2;
      const Vx = RA - w * x;
      const Mx = RA * x - (w * x * x) / 2;

      // deflection + slope
      // deflection + slope (UDL over full span, simply supported)
      let dx = null;
      let thx = null;

      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        // slope θ(x)
        thx =
          (w / (24 * E * I)) *
          (Math.pow(L, 3) - 6 * L * x * x + 4 * Math.pow(x, 3));

        // deflection d(x)
        dx =
          (w / (24 * E * I)) *
          (x * (Math.pow(L, 3) - 2 * L * x * x + Math.pow(x, 3)));
      }

      return { Vx, Mx, dx, thx };
    }

    // ✅ UDL TOTAL (W total load)
    if (loadType === "udlTotal") {
      const W = Number(loadInputs.W) * getToN(unitSystem, PUnit);
      if (!isFinite(W) || W <= 0) return { error: "Enter valid W" };

      // Convert total load W to equivalent UDL w (N/m)
      const w = W / L;

      // V(x) and M(x) (base units: N, N·m)
      const RA = (w * L) / 2;
      const Vx = RA - w * x;
      const Mx = RA * x - (w * x * x) / 2;

      // ✅ deflection + slope (same formulas as UDL)
      let dx = null;
      let thx = null;

      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        dx =
          (w * x * (Math.pow(L, 3) - 2 * L * x * x + Math.pow(x, 3))) /
          (24 * E * I);

        thx =
          (w * (6 * L * L * x - 4 * L * x * x + Math.pow(x, 3))) / (24 * E * I);
      }

      return { Vx, Mx, dx, thx };
    }

    // ✅ TRIANGULAR (full span) - uses your calc + deflection helper
    if (loadType === "triangular") {
      const w1 = Number(loadInputs.w1) * getToNm(unitSystem, wUnit);
      if (!isFinite(w1) || w1 <= 0) return { error: "Enter valid w1" };

      const direction = loadInputs.direction || "ascending";

      const resultAtX = calcTriangularAtX({ L, w1, x, direction });
      if (!resultAtX.ok) return { error: resultAtX.message };

      // ✅ Compute dx + thx numerically from M(x)
      const { dx, thx } = computeThetaDeflectionFromMoment({
        L,
        E,
        I,
        xQuery: x,
        getM: (xi) => {
          const r = calcTriangularAtX({ L, w1, x: xi, direction });
          return r.ok ? r.results.Mx : 0;
        },
      });

      return { ...resultAtX.results, dx, thx };
    }
    // ✅ POINT MOMENT (M at a) - includes dx + thx
    if (loadType === "pointMoment") {
      const M = Number(loadInputs.M) * getToMomentNm(unitSystem, MUnit);
      const a = Number(loadInputs.a) * getToMeter(unitSystem, LUnit);

      if (!isFinite(M) || M === 0) return { error: "Enter valid M (not 0)" };
      if (!isFinite(a) || a <= 0 || a >= L)
        return { error: "a must be between 0 and L" };

      const resultAtX = calcPointMomentAtX({ L, M, a, x });
      if (!resultAtX.ok) return { error: resultAtX.message };

      let dx = null;
      let thx = null;

      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        const L2 = L * L;
        const L3 = L2 * L;
        const a2 = a * a;
        const a3 = a2 * a;
        const denom = 6 * E * I * L2;

        if (x <= a) {
          thx =
            (M * (3 * L3 - 9 * L2 * a + 6 * L * a2 + 3 * L * x * x - a3)) /
            denom;

          dx =
            (M * x * (3 * L3 - 9 * L2 * a + 6 * L * a2 + L * x * x - a3)) /
            denom;
        } else {
          thx =
            (M *
              (3 * L3 - 3 * L2 * a + 3 * L * a2 - 6 * L * x * (L - a) - a3)) /
            denom;

          dx =
            (M *
              (L * (-a2 * (3 * L - a) + 3 * x * x * (-L + a)) +
                x * (3 * L3 - 3 * L2 * a + 3 * L * a2 - a3))) /
            denom;
        }
      }

      return { ...resultAtX.results, dx, thx };
    }

    // ✅ TRAPEZOIDAL (full span)
    if (loadType === "trapezoidal") {
      const w1 = Number(loadInputs.w1) * getToNm(unitSystem, wUnit);
      const w2 = Number(loadInputs.w2) * getToNm(unitSystem, wUnit);

      if (!isFinite(w1) || w1 < 0) return { error: "Enter valid w1 (>= 0)" };
      if (!isFinite(w2) || w2 < 0) return { error: "Enter valid w2 (>= 0)" };
      if (w1 === 0 && w2 === 0) return { error: "w1 and w2 cannot both be 0" };

      const resultAtX = calcTrapezoidalAtX({ L, w1, w2, x });
      if (!resultAtX.ok) return { error: resultAtX.message };

      // ✅ Compute dx + thx numerically from M(x)
      const { dx, thx } = computeThetaDeflectionFromMoment({
        L,
        E,
        I,
        xQuery: x,
        getM: (xi) => {
          const r = calcTrapezoidalAtX({ L, w1, w2, x: xi });
          return r.ok ? r.results.Mx : 0;
        },
      });

      return { ...resultAtX.results, dx, thx };
    }

    // ✅ PARTIAL UNIFORM (if you added these load types)
    if (loadType === "partialUniform") {
      const w = Number(loadInputs.w) * getToNm(unitSystem, wUnit);
      const a = Number(loadInputs.a) * getToMeter(unitSystem, LUnit);
      const b = Number(loadInputs.b) * getToMeter(unitSystem, LUnit);

      if (!isFinite(w) || w <= 0) return { error: "Enter valid w (> 0)" };
      if (!isFinite(a) || a <= 0) return { error: "a must be > 0" };
      if (!isFinite(b) || b <= a || b >= L)
        return { error: "b must be between a and L" };

      const r = calcPartialUniformAtX({ L, w, a, b, x });
      if (!r.ok) return { error: r.message };

      // ✅ Compute dx + thx numerically from M(x)
      const { dx, thx } = computeThetaDeflectionFromMoment({
        L,
        E,
        I,
        xQuery: x,
        getM: (xi) => {
          const ri = calcPartialUniformAtX({ L, w, a, b, x: xi });
          return ri.ok ? ri.results.Mx : 0;
        },
      });

      return { ...r.results, dx, thx };
    }

    // ✅ PARTIAL TRIANGULAR
    if (loadType === "partialTriangular") {
      const w1 = Number(loadInputs.w1) * getToNm(unitSystem, wUnit);
      const a = Number(loadInputs.a) * getToMeter(unitSystem, LUnit);
      const b = Number(loadInputs.b) * getToMeter(unitSystem, LUnit);

      // if you have a direction dropdown like "ascending"/"descending"
      const direction = loadInputs.direction || "ascending";

      if (!isFinite(w1) || w1 <= 0) return { error: "Enter valid w1 (> 0)" };
      if (!isFinite(a) || a <= 0) return { error: "a must be > 0" };
      if (!isFinite(b) || b <= a || b >= L)
        return { error: "b must be between a and L" };

      const r = calcPartialTriangularAtX({ L, w1, a, b, x, direction });
      if (!r.ok) return { error: r.message };

      // ✅ Compute dx + thx numerically from M(x)
      const { dx, thx } = computeThetaDeflectionFromMoment({
        L,
        E,
        I,
        xQuery: x,
        getM: (xi) => {
          const ri = calcPartialTriangularAtX({
            L,
            w1,
            a,
            b,
            x: xi,
            direction,
          });
          return ri.ok ? ri.results.Mx : 0;
        },
      });

      return { ...r.results, dx, thx };
    }

    // ✅ PARTIAL TRAPEZOIDAL
    if (loadType === "partialTrapezoidal") {
      const w1 = Number(loadInputs.w1) * getToNm(unitSystem, wUnit);
      const w2 = Number(loadInputs.w2) * getToNm(unitSystem, wUnit);
      const a = Number(loadInputs.a) * getToMeter(unitSystem, LUnit);
      const b = Number(loadInputs.b) * getToMeter(unitSystem, LUnit);

      if (!isFinite(w1) || w1 < 0) return { error: "Enter valid w1 (>= 0)" };
      if (!isFinite(w2) || w2 < 0) return { error: "Enter valid w2 (>= 0)" };
      if (!isFinite(a) || a <= 0) return { error: "a must be > 0" };
      if (!isFinite(b) || b <= a || b >= L)
        return { error: "b must be between a and L" };
      if (w1 === 0 && w2 === 0) return { error: "w1 and w2 cannot both be 0" };

      const r = calcPartialTrapezoidalAtX({ L, w1, w2, a, b, x });
      if (!r.ok) return { error: r.message };

      // ✅ Compute dx + thx numerically from M(x)
      const { dx, thx } = computeThetaDeflectionFromMoment({
        L,
        E,
        I,
        xQuery: x,
        getM: (xi) => {
          const ri = calcPartialTrapezoidalAtX({ L, w1, w2, a, b, x: xi });
          return ri.ok ? ri.results.Mx : 0;
        },
      });

      return { ...r.results, dx, thx };
    }

    // ✅ SLAB TRAPEZOIDAL
    if (loadType === "trapezoidalSlab") {
      const w = Number(loadInputs.w) * getToNm(unitSystem, wUnit); // N/m
      const a = Number(loadInputs.a) * getToMeter(unitSystem, LUnit); // m
      const b = Number(loadInputs.b) * getToMeter(unitSystem, LUnit); // m

      if (!isFinite(w) || w <= 0) return { error: "Enter valid w (>0)" };
      if (!isFinite(a) || a <= 0) return { error: "a must be > 0" };
      if (!isFinite(b) || b <= 0) return { error: "b must be > 0" };

      // slab trapezoid rule: L = 2a + b
      const targetL = 2 * a + b;
      const tol = 1e-9;
      if (Math.abs(L - targetL) > tol) {
        return { error: "For slab trapezoid, L must equal 2a + b" };
      }

      // Total load: two triangles + rectangle = w*a + w*b = w(a+b)
      const W = w * (a + b);
      const RA = W / 2;

      // helper: cumulative load F(x) = ∫0..x w(s) ds
      function F(xi) {
        if (xi <= 0) return 0;
        if (xi <= a) {
          // ramp up: w(s)=w*s/a
          return (w * xi * xi) / (2 * a);
        }
        if (xi <= a + b) {
          // ramp + flat
          return (w * a) / 2 + w * (xi - a);
        }
        if (xi <= L) {
          // ramp + flat + ramp down: w(s)=w*(L-s)/a
          const x0 = a + b;
          const part3 = (w / a) * (L * (xi - x0) - (xi * xi - x0 * x0) / 2);
          return (w * a) / 2 + w * b + part3;
        }
        return W;
      }

      // helper: G(x) = ∫0..x w(s)*s ds  (for moment)
      function G(xi) {
        if (xi <= 0) return 0;

        if (xi <= a) {
          // w(s)=w*s/a -> w(s)*s = w*s^2/a
          return (w * Math.pow(xi, 3)) / (3 * a);
        }

        const Ga = (w * a * a) / 3;

        if (xi <= a + b) {
          // add flat part: ∫ w*s ds
          return Ga + (w * (xi * xi - a * a)) / 2;
        }

        // add flat up to a+b
        const x0 = a + b;
        const Gx0 = Ga + (w * (x0 * x0 - a * a)) / 2;

        // ramp down: w(s)=w*(L-s)/a => w(s)*s = w/a*(L*s - s^2)
        const part3 =
          (w / a) *
          ((L * (xi * xi - x0 * x0)) / 2 -
            (Math.pow(xi, 3) - Math.pow(x0, 3)) / 3);

        return Gx0 + part3;
      }

      // Shear and moment at x
      const Fx = F(x);
      const Vx = RA - Fx; // N
      const Mx = x * Vx + G(x); // N*m

      // ✅ deflection + slope from moment (numerical integration)
      const { dx, thx } = computeThetaDeflectionFromMoment({
        L,
        E,
        I,
        xQuery: x,
        getM: (xi) => {
          const Fxi = F(xi);
          const Vxi = RA - Fxi;
          return xi * Vxi + G(xi);
        },
      });

      return { Vx, Mx, dx, thx };
    }
    return { info: "V(x) and M(x) not implemented for this load type yet." };
  }, [
    output,
    xValue,
    props.L,
    props.E,
    props.I,
    loadType,
    loadInputs,
    unitSystem,
    LUnit,
    xUnit,
    EUnit,
    IUnit,
    PUnit,
    MUnit,
    wUnit,
  ]);
  function calculateAtX(x) {
    const L = Number(props.L) * getToMeter(unitSystem, LUnit);
    const xSI = Number(x) * getToMeter(unitSystem, xUnit);

    const E = Number(props.E) * getToPa(unitSystem, EUnit);
    const I = Number(props.I) * getToM4(unitSystem, IUnit);

    if (!isFinite(L) || L <= 0) return null;
    if (!isFinite(xSI) || xSI < 0 || xSI > L) return null;

    // POINT LOAD
    if (loadType === "point") {
      const P = Number(loadInputs.P);
      const a = Number(loadInputs.a);

      if (!isFinite(P) || P <= 0) return null;
      if (!isFinite(a) || a <= 0 || a >= L) return null;

      const vm = calcPointAtX({ L, P, a, x });
      if (!vm.ok) return null;

      /*     const E = Number(props.E);
      const I = Number(props.I); */

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

      /*     const E = Number(props.E);
      const I = Number(props.I); */

      let dx = null;
      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        const def = calcPointDeflectionAtX({ L, P, a, x, E, I });
        if (def.ok) dx = def.results.dx;
      }

      return { ...vm.results, dx };
    }
    // UDL
    if (loadType === "udl") {
      const w = Number(loadInputs.w) * getToNm(unitSystem, wUnit); // N/m

      const RA = (w * L) / 2;
      const Vx = RA - w * xSI;
      const Mx = RA * xSI - (w * xSI * xSI) / 2;

      let dx = null;
      let thx = null;

      if (E > 0 && I > 0) {
        thx = (w / (24 * E * I)) * (L ** 3 - 6 * L * xSI ** 2 + 4 * xSI ** 3); // radians

        dx =
          (w / (24 * E * I)) * (xSI * (L ** 3 - 2 * L * xSI ** 2 + xSI ** 3)); // meters
      }

      return { Vx, Mx, dx, thx };
    }
    // UDL TOTAL
    if (loadType === "udlTotal") {
      const W = Number(loadInputs.W) * getToN(unitSystem, PUnit);
      if (!isFinite(W) || W <= 0) return { error: "Enter valid W" };

      const w = W / L;

      const RA = W / 2;
      const Vx = RA - w * x;
      const Mx = RA * x - (w * x * x) / 2;

      let dx = null;
      let thx = null;

      if (isFinite(E) && E > 0 && isFinite(I) && I > 0) {
        dx =
          (w * x * (Math.pow(L, 3) - 2 * L * x * x + Math.pow(x, 3))) /
          (24 * E * I);

        thx =
          (w * (Math.pow(L, 3) - 6 * L * x * x + 4 * Math.pow(x, 3))) /
          (24 * E * I);
      }

      return { Vx, Mx, dx, thx };
    }

    // TRIANGULAR
    if (loadType === "triangular") {
      const w1 = Number(loadInputs.w1);
      if (!isFinite(w1) || w1 <= 0) return null;
      const direction = loadInputs.direction || "ascending";
      const vm = calcTriangularAtX({ L, w1, x, direction });
      if (!vm.ok) return null;

      /*    const E = Number(props.E);
      const I = Number(props.I); */

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
    // PARTIAL UNIFORM
    if (loadType === "partialUniform") {
      const w = Number(loadInputs.w) * getToNm(unitSystem, wUnit);
      const a = Number(loadInputs.a) * getToMeter(unitSystem, LUnit);
      const b = Number(loadInputs.b) * getToMeter(unitSystem, LUnit);

      const res = calcPartialUniformAtX({ L, w, a, b, x });
      return res.ok ? res.results : null;
    }

    // PARTIAL TRIANGULAR
    if (loadType === "partialTriangular") {
      const w1 = Number(loadInputs.w1) * getToNm(unitSystem, wUnit);
      const a = Number(loadInputs.a) * getToMeter(unitSystem, LUnit);
      const b = Number(loadInputs.b) * getToMeter(unitSystem, LUnit);

      const res = calcPartialTriangularAtX({ L, w1, a, b, x });
      return res.ok ? res.results : null;
    }

    // PARTIAL TRAPEZOIDAL
    if (loadType === "partialTrapezoidal") {
      const w1 = Number(loadInputs.w1) * getToNm(unitSystem, wUnit);
      const w2 = Number(loadInputs.w2) * getToNm(unitSystem, wUnit);
      const a = Number(loadInputs.a) * getToMeter(unitSystem, LUnit);
      const b = Number(loadInputs.b) * getToMeter(unitSystem, LUnit);

      const res = calcPartialTrapezoidalAtX({ L, w1, w2, a, b, x });
      return res.ok ? res.results : null;
    }

    // SLAB TRAPEZOIDAL
    if (loadType === "trapezoidalSlab") {
      const w = Number(loadInputs.w) * getToNm(unitSystem, wUnit);
      const a = Number(loadInputs.a) * getToMeter(unitSystem, LUnit);
      const b = Number(loadInputs.b) * getToMeter(unitSystem, LUnit);

      const res = calcTrapezoidalSlabAtX({ L, w, a, b, x });
      return res.ok ? res.results : null;
    }

    return null;
  }

  function handleCalculate() {
    // -----------------------------
    // 1️⃣ Convert units to base units
    // -----------------------------
    const L_m = Number(props.L) * getToMeter(unitSystem, LUnit); // length -> meters
    const E_Pa = Number(props.E) * getToPa(unitSystem, EUnit); // E -> Pa (for later)
    const I_m4 = Number(props.I) * getToM4(unitSystem, IUnit); // I -> m^4 (for later)

    // -----------------------------
    // 2️⃣ Validation (Beam length only)
    // -----------------------------
    const nextErrors = {};

    if (!props.L || !Number.isFinite(L_m) || L_m <= 0) {
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

    // ✅ Use meters for ALL calculations
    const L = L_m;

    // -----------------------------
    // 3️⃣ Choose calculation based on load type
    // -----------------------------
    let calcResult = null;

    if (loadType === "point") {
      const P_N = Number(loadInputs.P) * getToN(unitSystem, PUnit);
      const a_m = Number(loadInputs.a) * getToMeter(unitSystem, LUnit);

      const x = xValue ? Number(xValue) : undefined; // we'll convert x later in another step

      calcResult = calcPointLoad({ L, P: P_N, a: a_m, x });
    } else if (loadType === "pointCentered") {
      const P_N = Number(loadInputs.P) * getToN(unitSystem, PUnit);
      calcResult = calcPointCentered({ L, P: P_N });
    } else if (loadType === "udl") {
      const w_Nm = Number(loadInputs.w) * getToNm(unitSystem, wUnit);
      calcResult = calcUDL({ L, w: w_Nm });
    } else if (loadType === "udlTotal") {
      const W_N = Number(loadInputs.W) * getToN(unitSystem, PUnit);
      calcResult = calcUDLTotal({ L, W: W_N });
    } else if (loadType === "pointMoment") {
      const M_Nm = Number(loadInputs.M) * getToMomentNm(unitSystem, MUnit);
      const a_m = Number(loadInputs.a) * getToMeter(unitSystem, LUnit);

      calcResult = calcPointMoment({ L, M: M_Nm, a: a_m });
    } else if (loadType === "triangular") {
      const w1_Nm = Number(loadInputs.w1) * getToNm(unitSystem, wUnit);
      calcResult = calcTriangularFull({ L, w1: w1_Nm });
    } else if (loadType === "trapezoidal") {
      const w1_Nm = Number(loadInputs.w1) * getToNm(unitSystem, wUnit);
      const w2_Nm = Number(loadInputs.w2) * getToNm(unitSystem, wUnit);
      calcResult = calcTrapezoidalFull({ L, w1: w1_Nm, w2: w2_Nm });
    } else if (loadType === "partialUniform") {
      const w_Nm = Number(loadInputs.w) * getToNm(unitSystem, wUnit);
      const a_m = Number(loadInputs.a) * getToMeter(unitSystem, LUnit);
      const b_m = Number(loadInputs.b) * getToMeter(unitSystem, LUnit);

      calcResult = calcPartialUniform({ L, w: w_Nm, a: a_m, b: b_m });
    } else if (loadType === "partialTriangular") {
      const w1_Nm = Number(loadInputs.w1) * getToNm(unitSystem, wUnit);
      const a_m = Number(loadInputs.a) * getToMeter(unitSystem, LUnit);
      const b_m = Number(loadInputs.b) * getToMeter(unitSystem, LUnit);

      calcResult = calcPartialTriangular({ L, w1: w1_Nm, a: a_m, b: b_m });
    } else if (loadType === "partialTrapezoidal") {
      const w1_Nm = Number(loadInputs.w1) * getToNm(unitSystem, wUnit);
      const w2_Nm = Number(loadInputs.w2) * getToNm(unitSystem, wUnit);
      const a_m = Number(loadInputs.a) * getToMeter(unitSystem, LUnit);
      const b_m = Number(loadInputs.b) * getToMeter(unitSystem, LUnit);

      calcResult = calcPartialTrapezoidal({
        L,
        w1: w1_Nm,
        w2: w2_Nm,
        a: a_m,
        b: b_m,
      });
    } else if (loadType === "trapezoidalSlab") {
      const w_Nm = Number(loadInputs.w) * getToNm(unitSystem, wUnit);
      const a_m = Number(loadInputs.a) * getToMeter(unitSystem, LUnit);
      const b_m = Number(loadInputs.b) * getToMeter(unitSystem, LUnit);

      calcResult = calcTrapezoidalSlab({ L, w: w_Nm, a: a_m, b: b_m });
    } else {
      setOutput({
        info: "Calculation for this load type is not implemented yet.",
      });
      return;
    }

    // -----------------------------
    // 4️⃣ Handle calculation result
    // -----------------------------
    if (!calcResult.ok) {
      setOutput({ error: calcResult.message });
      return;
    }

    // -----------------------------
    // 5️⃣ Success → Save results
    // -----------------------------
    setOutput({
      type: loadType,
      results: {
        ...calcResult.results,

        // optional: store converted E for later deflection work
        E_Pa: Number.isFinite(E_Pa) ? E_Pa : null,
      },
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
          unitSystem={unitSystem}
          setUnitSystem={setUnitSystem}
          LUnit={LUnit}
          setLUnit={setLUnit}
          lengthUnits={getLengthUnits(unitSystem)}
          EUnit={EUnit}
          setEUnit={setEUnit}
          eUnits={getEUnits(unitSystem)}
          IUnit={IUnit}
          setIUnit={setIUnit}
          iUnits={getIUnits(unitSystem)}
          wUnit={wUnit}
          setWUnit={setWUnit}
          wUnits={getWUnits(unitSystem)}
          PUnit={PUnit}
          setPUnit={setPUnit}
          pUnits={getForceUnits(unitSystem)}
          MUnit={MUnit}
          setMUnit={setMUnit}
          mUnits={getMomentUnits(unitSystem)}
        />

        <BeamResultPanel
          output={output}
          xValue={xValue}
          setXValue={setXValue}
          atX={atX}
          L={Number(props.L)}
          calculateAtX={calculateAtX}
          unitSystem={unitSystem}
          // force
          PUnit={PUnit}
          setPUnit={setPUnit}
          pUnits={getForceUnits(unitSystem)}
          // moment
          MUnit={MUnit}
          setMUnit={setMUnit}
          mUnits={getMomentUnits(unitSystem)}
          // length
          LUnit={LUnit}
          setLUnit={setLUnit}
          lengthUnits={getLengthUnits(unitSystem)}
          xUnit={xUnit}
          setXUnit={setXUnit}
          deflUnits={getDeflectionUnits(unitSystem)}
          slopeUnits={getSlopeUnits()}
        />
      </section>
    </main>
  );
}
