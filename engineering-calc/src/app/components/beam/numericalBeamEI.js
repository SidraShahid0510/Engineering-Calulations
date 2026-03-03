// numericalBeamEI.js
// Computes theta(x) and deflection d(x) from M(x) using numerical integration.
// Assumes: M(x) in N*m, E in Pa, I in m^4, x and L in meters.
// Returns: thx in rad, dx in meters.

export function computeThetaDeflectionFromMoment({
  L,
  E,
  I,
  getM,
  xQuery,
  n = 300,
}) {
  if (!isFinite(L) || L <= 0) return { thx: null, dx: null };
  if (!isFinite(E) || E <= 0) return { thx: null, dx: null };
  if (!isFinite(I) || I <= 0) return { thx: null, dx: null };

  const N = Math.max(50, n);
  const h = L / (N - 1);

  const xs = new Array(N);
  const kappa = new Array(N); // curvature = M/(E*I)

  for (let i = 0; i < N; i++) {
    const x = i * h;
    xs[i] = x;

    const Mx = getM(x);
    kappa[i] = (isFinite(Mx) ? Mx : 0) / (E * I);
  }

  // 1) Integrate curvature -> theta0 (with constant C1 = 0 for now)
  const theta0 = new Array(N);
  theta0[0] = 0;
  for (let i = 1; i < N; i++) {
    // trapezoidal integration
    theta0[i] = theta0[i - 1] + 0.5 * (kappa[i - 1] + kappa[i]) * h;
  }

  // 2) Integrate theta0 -> y0 (with C1=0, y(0)=0)
  const y0 = new Array(N);
  y0[0] = 0;
  for (let i = 1; i < N; i++) {
    y0[i] = y0[i - 1] + 0.5 * (theta0[i - 1] + theta0[i]) * h;
  }

  // 3) Fix boundary condition y(L)=0 by adding constant slope C1
  // If theta = theta0 + C1, then y = y0 + C1*x. We want y(L)=0:
  // 0 = y0(L) + C1*L  -> C1 = -y0(L)/L
  const C1 = -y0[N - 1] / L;

  // Helper: interpolate array value at xQuery
  function interp(arr) {
    const x = Math.min(Math.max(xQuery, 0), L);
    const idx = x / h;
    const i0 = Math.floor(idx);
    const i1 = Math.min(i0 + 1, N - 1);
    const t = idx - i0;
    return arr[i0] * (1 - t) + arr[i1] * t;
  }

  const thx = interp(theta0) + C1;
  const dx = interp(y0) + C1 * xQuery;

  return { thx, dx };
}
