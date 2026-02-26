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
  const xbar = (L * (2 * w1 + w2)) / (3 * (w1 + w2));

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
  const xbar = (L * (2 * w1 + w2)) / (3 * (w1 + w2));

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
