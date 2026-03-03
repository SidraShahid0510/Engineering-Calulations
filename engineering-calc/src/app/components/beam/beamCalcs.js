// All functions return the same shape:
// { ok: true, results: { RA, RB, Mmax, xm } }
// OR { ok: false, message: "..." }

export function calcPointLoad({ L, P, a, x }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(P > 0)) return bad("P must be > 0");
  if (!(a > 0 && a < L)) return bad("a must be between 0 and L");

  const RA = (P * (L - a)) / L;
  const RB = (P * a) / L;

  const Mmax = RA * a;
  const xm = a;

  let Vx = null;
  let Mx = null;

  // If x is provided, calculate shear and moment at x
  if (x !== undefined && x !== null) {
    if (!(x >= 0 && x <= L)) {
      return bad("x must be between 0 and L");
    }

    if (x < a) {
      Vx = RA;
      Mx = RA * x;
    } else {
      Vx = RA - P;
      Mx = RA * x - P * (x - a);
    }
  }

  return ok({ RA, RB, Mmax, xm, Vx, Mx });
}
export function calcUDL({ L, w }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(w > 0)) return bad("w must be > 0");

  const W = w * L;
  const RA = W / 2;
  const RB = W / 2;
  const Mmax = (w * L * L) / 8;
  const xm = L / 2;

  return ok({ RA, RB, Mmax, xm });
}

function ok(results) {
  return { ok: true, results };
}

function bad(message) {
  return { ok: false, message };
}
export function calcPointCentered({ L, P }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(P > 0)) return bad("P must be > 0");

  const RA = P / 2;
  const RB = P / 2;
  const Mmax = (P * L) / 4;
  const xm = L / 2;

  return ok({ RA, RB, Mmax, xm });
}
export function calcUDLTotal({ L, W }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(W > 0)) return bad("Total load W must be > 0");

  const RA = W / 2;
  const RB = W / 2;
  const Mmax = (W * L) / 8;
  const xm = L / 2;

  return ok({ RA, RB, Mmax, xm });
}
export function calcPointMoment({ L, M, a }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(M !== 0)) return bad("Moment M must not be 0");
  if (!(a > 0 && a < L)) return bad("a must be between 0 and L");

  const RA = M / L;
  const RB = -M / L;

  const Mmax = M;
  const xm = a;

  return ok({ RA, RB, Mmax, xm });
}
export function calcTriangularFull({ L, w1 }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(w1 > 0)) return bad("w1 must be > 0");

  // Total load on beam (equivalent single load)
  const W = (w1 * L) / 2;

  // Reactions for triangular load (0 at left -> w1 at right)
  const RA = W / 3;
  const RB = (2 * W) / 3;

  // Maximum bending moment and where it happens
  const xm = L / Math.sqrt(3);
  const Mmax = (w1 * L * L) / (9 * Math.sqrt(3));

  return ok({ RA, RB, Mmax, xm });
}
export function calcTrapezoidalFull({ L, w1, w2 }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(w1 >= 0 && w2 >= 0)) return bad("w1 and w2 must be >= 0");

  // Total load
  const W = ((w1 + w2) / 2) * L;

  // Location of resultant load from left support
  const xbar = (L * (w1 + 2 * w2)) / (3 * (w1 + w2));

  // Reactions
  const RB = (W * xbar) / L;
  const RA = W - RB;

  // Maximum moment approximation (for now, keep simple)
  const xm = xbar;
  const Mmax = RA * xm - (w1 * xm * xm) / 2;

  return ok({ RA, RB, Mmax, xm });
}
export function calcPointAtX({ L, P, a, x }) {
  if (!(x >= 0 && x <= L)) return bad("x must be between 0 and L");

  const RA = (P * (L - a)) / L;

  let Vx;
  let Mx;

  if (x < a) {
    Vx = RA;
    Mx = RA * x;
  } else {
    Vx = RA - P;
    Mx = RA * x - P * (x - a);
  }

  return ok({ Vx, Mx });
}
export function calcTriangularAtX({ L, w1, x, direction = "ascending" }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(w1 > 0)) return bad("w1 must be > 0");
  if (!(x >= 0 && x <= L)) return bad("x must be between 0 and L");

  // If descending: mirror to ascending and convert results back
  if (direction === "descending") {
    const xAsc = L - x;

    const asc = calcTriangularAtX({ L, w1, x: xAsc, direction: "ascending" });
    if (!asc.ok) return asc;

    // Shear changes sign under mirroring, moment does not
    return ok({
      Vx: -asc.results.Vx,
      Mx: asc.results.Mx,
    });
  }

  // ----- Ascending formulas (0 at left -> w1 at right) -----
  const RA = (w1 * L) / 6;

  // Shear and moment for linearly varying load w(x) = (w1/L)*x
  const Vx = RA - (w1 * x * x) / (2 * L);
  const Mx = RA * x - (w1 * x * x * x) / (6 * L);

  return ok({ Vx, Mx });
}
export function calcTrapezoidalAtX({ L, w1, w2, x }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(w1 >= 0 && w2 >= 0)) return bad("w1 and w2 must be >= 0");
  if (!(w1 + w2 > 0)) return bad("w1 and w2 cannot both be 0");
  if (!(x >= 0 && x <= L)) return bad("x must be between 0 and L");

  // Total load
  const W = ((w1 + w2) / 2) * L;

  // Resultant location from left (centroid)
  const xbar = (L * (w1 + 2 * w2)) / (3 * (w1 + w2));

  // Reactions
  const RB = (W * xbar) / L;
  const RA = W - RB;

  // Load varies linearly: w(x) = w1 + kx
  const k = (w2 - w1) / L;

  // Shear and moment at x (exact for linear load)
  const Vx = RA - w1 * x - (k * x * x) / 2;
  const Mx = RA * x - (w1 * x * x) / 2 - (k * x * x * x) / 6;

  return ok({ Vx, Mx });
}
export function calcPointMomentAtX({ L, M, a, x }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!isFinite(M) || M === 0) return bad("M must not be 0");
  if (!(a > 0 && a < L)) return bad("a must be between 0 and L");
  if (!(x >= 0 && x <= L)) return bad("x must be between 0 and L");

  const RA = M / L; // RB = -M/L

  const Vx = RA;

  let Mx;
  if (x < a) {
    Mx = RA * x;
  } else {
    Mx = RA * x - M;
  }

  return ok({ Vx, Mx });
}
export function calcPointDeflectionAtX({ L, P, a, x, E, I }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(P > 0)) return bad("P must be > 0");
  if (!(a > 0 && a < L)) return bad("a must be between 0 and L");
  if (!(x >= 0 && x <= L)) return bad("x must be between 0 and L");
  if (!(E > 0)) return bad("E must be > 0");
  if (!(I > 0)) return bad("I must be > 0");

  const b = L - a;

  let dx;

  // Piecewise formula for simply supported beam with point load at a
  if (x <= a) {
    dx = (P * b * x * (L * L - b * b - x * x)) / (6 * L * E * I);
  } else {
    dx =
      (P * a * (L - x) * (L * L - a * a - (L - x) * (L - x))) / (6 * L * E * I);
  }

  return ok({ dx });
}
export function calcTriangularDeflectionAtX({
  L,
  w1,
  x,
  E,
  I,
  direction = "ascending",
}) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(w1 > 0)) return bad("w1 must be > 0");
  if (!(x >= 0 && x <= L)) return bad("x must be between 0 and L");
  if (!(E > 0)) return bad("E must be > 0");
  if (!(I > 0)) return bad("I must be > 0");

  // Descending: mirror x to ascending (deflection shape mirrors)
  if (direction === "descending") {
    const xAsc = L - x;
    const asc = calcTriangularDeflectionAtX({
      L,
      w1,
      x: xAsc,
      E,
      I,
      direction: "ascending",
    });
    return asc; // dx is the same mirrored
  }

  // Ascending (0 at left -> w1 at right)
  const dx =
    (w1 / (E * I)) *
    ((L * Math.pow(x, 3)) / 36 -
      Math.pow(x, 5) / (120 * L) -
      (7 * Math.pow(L, 3) * x) / 360);

  return ok({ dx });
}
// ===============================
// Partial distributed load helpers
// ===============================

// Returns how much "load" is to the left of x (shear contribution)
// and its moment about the section x (moment contribution).
// Segment from a -> b with linearly varying intensity w1 -> w2
function segmentContribution({ x, a, b, w1, w2 }) {
  if (x <= a) return { Q: 0, M: 0 }; // nothing included yet

  const Ls = b - a;
  if (Ls <= 0) return { Q: 0, M: 0 };

  const dw = w2 - w1;

  // If x is beyond the segment, include full segment:
  if (x >= b) {
    const W = ((w1 + w2) / 2) * Ls;
    const xbar = a + (Ls * (w1 + 2 * w2)) / (3 * (w1 + w2)); // centroid
    // If w1 + w2 = 0, W = 0 and xbar is irrelevant
    if (W === 0) return { Q: 0, M: 0 };
    return { Q: W, M: W * (x - xbar) };
  }

  // x is inside the segment:
  const u = x - a; // how far into the segment

  // Q = ∫ w(t) dt from a to x
  const Q = w1 * u + (dw * u * u) / (2 * Ls);

  // M = ∫ w(t) * (x - t) dt from a to x
  // derived closed-form:
  const M = (w1 * u * u) / 2 + (dw * u * u * u) / (6 * Ls);

  return { Q, M };
}
export function calcPartialUniform({ L, w, a, b }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(w > 0)) return bad("w must be > 0");
  if (!(a >= 0 && b <= L && b > a))
    return bad("a and b must satisfy 0 ≤ a < b ≤ L");

  const W = w * (b - a);
  const xbar = (a + b) / 2;

  const RB = (W * xbar) / L;
  const RA = W - RB;

  // Find Mmax by sampling (simple and safe)
  let Mmax = -Infinity;
  let xm = 0;

  const steps = 400;
  for (let i = 0; i <= steps; i++) {
    const x = (L * i) / steps;

    const seg = segmentContribution({ x, a, b, w1: w, w2: w });
    const Vx = RA - seg.Q;
    const Mx = RA * x - seg.M;

    if (Mx > Mmax) {
      Mmax = Mx;
      xm = x;
    }
  }

  return ok({ RA, RB, Mmax, xm });
}

export function calcPartialUniformAtX({ L, w, a, b, x }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(a >= 0 && b <= L && b > a))
    return bad("a and b must satisfy 0 ≤ a < b ≤ L");
  if (!(x >= 0 && x <= L)) return bad("x must be between 0 and L");

  const W = w * (b - a);
  const xbar = (a + b) / 2;

  const RB = (W * xbar) / L;
  const RA = W - RB;

  const seg = segmentContribution({ x, a, b, w1: w, w2: w });

  const Vx = RA - seg.Q;
  const Mx = RA * x - seg.M;

  return ok({ Vx, Mx });
}
export function calcPartialTriangular({ L, w1, a, b }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(w1 > 0)) return bad("w1 must be > 0");
  if (!(a >= 0 && b <= L && b > a))
    return bad("a and b must satisfy 0 ≤ a < b ≤ L");

  // triangle from 0 at a to w1 at b:
  const segLen = b - a;
  const W = (w1 * segLen) / 2;
  const xbar = a + (2 * segLen) / 3;

  const RB = (W * xbar) / L;
  const RA = W - RB;

  let Mmax = -Infinity;
  let xm = 0;

  const steps = 400;
  for (let i = 0; i <= steps; i++) {
    const x = (L * i) / steps;

    const seg = segmentContribution({ x, a, b, w1: 0, w2: w1 });
    const Mx = RA * x - seg.M;

    if (Mx > Mmax) {
      Mmax = Mx;
      xm = x;
    }
  }

  return ok({ RA, RB, Mmax, xm });
}

export function calcPartialTriangularAtX({ L, w1, a, b, x }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(a >= 0 && b <= L && b > a))
    return bad("a and b must satisfy 0 ≤ a < b ≤ L");
  if (!(x >= 0 && x <= L)) return bad("x must be between 0 and L");

  const segLen = b - a;
  const W = (w1 * segLen) / 2;
  const xbar = a + (2 * segLen) / 3;

  const RB = (W * xbar) / L;
  const RA = W - RB;

  const seg = segmentContribution({ x, a, b, w1: 0, w2: w1 });

  const Vx = RA - seg.Q;
  const Mx = RA * x - seg.M;

  return ok({ Vx, Mx });
}
export function calcPartialTrapezoidal({ L, w1, w2, a, b }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(w1 >= 0 && w2 >= 0)) return bad("w1 and w2 must be >= 0");
  if (w1 === 0 && w2 === 0) return bad("w1 and w2 cannot both be 0");
  if (!(a >= 0 && b <= L && b > a))
    return bad("a and b must satisfy 0 ≤ a < b ≤ L");

  const segLen = b - a;
  const W = ((w1 + w2) / 2) * segLen;

  // centroid of trapezoid load
  const xbarRel = (segLen * (2 * w1 + w2)) / (3 * (w1 + w2));
  const xbar = a + xbarRel;

  const RB = (W * xbar) / L;
  const RA = W - RB;

  let Mmax = -Infinity;
  let xm = 0;

  const steps = 400;
  for (let i = 0; i <= steps; i++) {
    const x = (L * i) / steps;

    const seg = segmentContribution({ x, a, b, w1, w2 });
    const Mx = RA * x - seg.M;

    if (Mx > Mmax) {
      Mmax = Mx;
      xm = x;
    }
  }

  return ok({ RA, RB, Mmax, xm });
}

export function calcPartialTrapezoidalAtX({ L, w1, w2, a, b, x }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(a >= 0 && b <= L && b > a))
    return bad("a and b must satisfy 0 ≤ a < b ≤ L");
  if (!(x >= 0 && x <= L)) return bad("x must be between 0 and L");

  const segLen = b - a;
  const W = ((w1 + w2) / 2) * segLen;
  const xbarRel = (segLen * (2 * w1 + w2)) / (3 * (w1 + w2));
  const xbar = a + xbarRel;

  const RB = (W * xbar) / L;
  const RA = W - RB;

  const seg = segmentContribution({ x, a, b, w1, w2 });

  const Vx = RA - seg.Q;
  const Mx = RA * x - seg.M;

  return ok({ Vx, Mx });
}
export function calcTrapezoidalSlab({ L, w, a, b }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(w > 0)) return bad("w must be > 0");
  if (!(a > 0)) return bad("a must be > 0");
  if (!(b >= 0)) return bad("b must be >= 0");
  if (Math.abs(L - (2 * a + b)) > 1e-9) {
    return bad("For slab trapezoid, L must equal 2a + b");
  }

  // segments:
  const seg1 = { a: 0, b: a, w1: 0, w2: w };
  const seg2 = { a: a, b: a + b, w1: w, w2: w };
  const seg3 = { a: a + b, b: L, w1: w, w2: 0 };

  function totalWandMomentAboutA() {
    const segs = [seg1, seg2, seg3];
    let Wtot = 0;
    let MtotA = 0; // moment about left support A

    for (const s of segs) {
      const Ls = s.b - s.a;
      const W = ((s.w1 + s.w2) / 2) * Ls;
      if (W === 0) continue;

      const xbarRel = (Ls * (s.w1 + 2 * s.w2)) / (3 * (s.w1 + s.w2));
      const xbar = s.a + xbarRel;

      Wtot += W;
      MtotA += W * xbar;
    }
    return { Wtot, MtotA };
  }

  const { Wtot, MtotA } = totalWandMomentAboutA();
  const RB = MtotA / L;
  const RA = Wtot - RB;

  let Mmax = -Infinity;
  let xm = 0;

  const steps = 400;
  for (let i = 0; i <= steps; i++) {
    const x = (L * i) / steps;

    const c1 = segmentContribution({ x, ...seg1 });
    const c2 = segmentContribution({ x, ...seg2 });
    const c3 = segmentContribution({ x, ...seg3 });

    const Q = c1.Q + c2.Q + c3.Q;
    const M = c1.M + c2.M + c3.M;

    const Mx = RA * x - M;

    if (Mx > Mmax) {
      Mmax = Mx;
      xm = x;
    }
  }

  return ok({ RA, RB, Mmax, xm });
}

export function calcTrapezoidalSlabAtX({ L, w, a, b, x }) {
  if (!(L > 0)) return bad("L must be > 0");
  if (!(x >= 0 && x <= L)) return bad("x must be between 0 and L");
  if (Math.abs(L - (2 * a + b)) > 1e-9) {
    return bad("For slab trapezoid, L must equal 2a + b");
  }

  const seg1 = { a: 0, b: a, w1: 0, w2: w };
  const seg2 = { a: a, b: a + b, w1: w, w2: w };
  const seg3 = { a: a + b, b: L, w1: w, w2: 0 };

  // total W and moment about A:
  const segs = [seg1, seg2, seg3];
  let Wtot = 0;
  let MtotA = 0;
  for (const s of segs) {
    const Ls = s.b - s.a;
    const W = ((s.w1 + s.w2) / 2) * Ls;
    if (W === 0) continue;

    const xbarRel = (Ls * (2 * s.w1 + s.w2)) / (3 * (s.w1 + s.w2));
    const xbar = s.a + xbarRel;

    Wtot += W;
    MtotA += W * xbar;
  }

  const RB = MtotA / L;
  const RA = Wtot - RB;

  const c1 = segmentContribution({ x, ...seg1 });
  const c2 = segmentContribution({ x, ...seg2 });
  const c3 = segmentContribution({ x, ...seg3 });

  const Q = c1.Q + c2.Q + c3.Q;
  const M = c1.M + c2.M + c3.M;

  const Vx = RA - Q;
  const Mx = RA * x - M;

  return ok({ Vx, Mx });
}
