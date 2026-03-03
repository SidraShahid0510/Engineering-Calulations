// src/app/components/beam/units.js

export const metricLengthUnits = [
  { value: "m", label: "m", toMeter: 1 },
  { value: "cm", label: "cm", toMeter: 0.01 },
  { value: "mm", label: "mm", toMeter: 0.001 },
];

export const imperialLengthUnits = [
  { value: "ft", label: "ft", toMeter: 0.3048 },
  { value: "in", label: "in", toMeter: 0.0254 },
  { value: "yd", label: "yd", toMeter: 0.9144 },
];

// ✅ This MUST exist (because you're importing it)
export function getLengthUnits(unitSystem) {
  return unitSystem === "metric" ? metricLengthUnits : imperialLengthUnits;
}

// ✅ This MUST exist too
export function getToMeter(unitSystem, unitValue) {
  const list = getLengthUnits(unitSystem);

  for (let i = 0; i < list.length; i++) {
    if (list[i].value === unitValue) return list[i].toMeter;
  }

  return 1;
}
// -------------------
// E (Young's Modulus) units
// base unit: Pa
// -------------------

export const metricEUnits = [
  { value: "GPa", label: "GPa", toPa: 1e9 },
  { value: "MPa", label: "MPa", toPa: 1e6 },
  { value: "Pa", label: "Pa", toPa: 1 },
];

export const imperialEUnits = [
  { value: "ksi", label: "ksi", toPa: 6894757.293168 }, // 1 ksi in Pa
  { value: "psi", label: "psi", toPa: 6894.757293168 }, // 1 psi in Pa
];

export function getEUnits(unitSystem) {
  return unitSystem === "metric" ? metricEUnits : imperialEUnits;
}

export function getToPa(unitSystem, unitValue) {
  const list = getEUnits(unitSystem);

  for (let i = 0; i < list.length; i++) {
    if (list[i].value === unitValue) return list[i].toPa;
  }

  return 1;
}
// -------------------
// I (Moment of Inertia) units
// base unit: m^4
// -------------------

export const metricIUnits = [
  { value: "m4", label: "m⁴", toM4: 1 },
  { value: "cm4", label: "cm⁴", toM4: 1e-8 }, // (0.01 m)^4
  { value: "mm4", label: "mm⁴", toM4: 1e-12 }, // (0.001 m)^4
];

export const imperialIUnits = [
  { value: "in4", label: "in⁴", toM4: 0.0254 ** 4 },
  { value: "ft4", label: "ft⁴", toM4: 0.3048 ** 4 },
];

export function getIUnits(unitSystem) {
  return unitSystem === "metric" ? metricIUnits : imperialIUnits;
}

export function getToM4(unitSystem, unitValue) {
  const list = getIUnits(unitSystem);

  for (let i = 0; i < list.length; i++) {
    if (list[i].value === unitValue) return list[i].toM4;
  }

  return 1;
}
// -------------------
// Distributed load (w) units
// base unit: N/m
// -------------------

// -------------------
// Distributed load (w) units
// base unit: N/m
// -------------------

export const metricWUnits = [
  { value: "kN/m", label: "kN/m", toNm: 1000 },
  { value: "N/m", label: "N/m", toNm: 1 },

  // extra metric options (like inspiration)
  { value: "kN/cm", label: "kN/cm", toNm: 100000 }, // 1 kN/cm = 100 kN/m = 100000 N/m
  { value: "N/mm", label: "N/mm", toNm: 1000 }, // 1 N/mm = 1000 N/m
  { value: "kN/mm", label: "kN/mm", toNm: 1000000 }, // 1 kN/mm = 1,000,000 N/m
];

export const imperialWUnits = [
  { value: "lbf/ft", label: "lbf/ft", toNm: 4.4482216152605 / 0.3048 },
  { value: "lbf/in", label: "lbf/in", toNm: 4.4482216152605 / 0.0254 },

  { value: "kip/ft", label: "kip/ft", toNm: 4448.2216152605 / 0.3048 },
  { value: "kip/in", label: "kip/in", toNm: 4448.2216152605 / 0.0254 },
];
export function getWUnits(unitSystem) {
  return unitSystem === "metric" ? metricWUnits : imperialWUnits;
}

// distributed load: base = N/m
export function getToNm(unitSystem, unitValue) {
  const list = getWUnits(unitSystem);
  const found = list.find((u) => u.value === unitValue);
  if (!found) return 1;
  return found.toNm;
}

export const metricForceUnits = [
  { value: "kN", label: "kN", toN: 1000 },
  { value: "N", label: "N", toN: 1 },

  // extra metric like inspiration
  { value: "kgf", label: "kgf", toN: 9.80665 },
  { value: "tf", label: "tf", toN: 9806.65 }, // metric ton-force
];

export const imperialForceUnits = [
  { value: "lbf", label: "lbf", toN: 4.4482216152605 },
  { value: "kip", label: "kip", toN: 4448.2216152605 },
];

export function getForceUnits(unitSystem) {
  return unitSystem === "metric" ? metricForceUnits : imperialForceUnits;
}

export function getToN(unitSystem, unitValue) {
  const list = getForceUnits(unitSystem);

  for (let i = 0; i < list.length; i++) {
    if (list[i].value === unitValue) return list[i].toN;
  }

  return 1;
}
// -------------------
// Moment (M) units
// base unit: N·m
// -------------------

export const metricMomentUnits = [
  { value: "kN·m", label: "kN·m", toNm: 1000 },
  { value: "N·m", label: "N·m", toNm: 1 },

  // extra metric options like inspiration
  { value: "kgf·m", label: "kgf·m", toNm: 9.80665 },
  { value: "tf·m", label: "tf·m", toNm: 9806.65 },
];

export const imperialMomentUnits = [
  { value: "lbf·ft", label: "lbf·ft", toNm: 4.4482216152605 * 0.3048 },
  { value: "lbf·in", label: "lbf·in", toNm: 4.4482216152605 * 0.0254 },
  { value: "kip·ft", label: "kip·ft", toNm: 4448.2216152605 * 0.3048 },
  { value: "kip·in", label: "kip·in", toNm: 4448.2216152605 * 0.0254 },
];

export function getMomentUnits(unitSystem) {
  return unitSystem === "metric" ? metricMomentUnits : imperialMomentUnits;
}

export function getToMomentNm(unitSystem, unitValue) {
  const list = getMomentUnits(unitSystem);

  for (let i = 0; i < list.length; i++) {
    if (list[i].value === unitValue) return list[i].toNm;
  }

  return 1;
}
// Convert FROM base units (SI) to selected unit

export function fromNewton(value, unitSystem, unitValue) {
  const list = getForceUnits(unitSystem);
  const found = list.find((u) => u.value === unitValue);
  if (!found) return value;
  return value / found.toN;
}

export function fromMomentNm(value, unitSystem, unitValue) {
  const list = getMomentUnits(unitSystem);
  const found = list.find((u) => u.value === unitValue);
  if (!found) return value;
  return value / found.toNm;
}

export function fromMeter(value, unitSystem, unitValue) {
  const list = getLengthUnits(unitSystem);
  const found = list.find((u) => u.value === unitValue);
  if (!found) return value;
  return value / found.toMeter;
}
// -------------------
// Deflection units
// base unit: meter (m)
// -------------------
export const metricDeflectionUnits = [
  { value: "mm", label: "mm", toMeter: 0.001 },
  { value: "cm", label: "cm", toMeter: 0.01 },
  { value: "m", label: "m", toMeter: 1 },
];

export const imperialDeflectionUnits = [
  { value: "in", label: "in", toMeter: 0.0254 },
  { value: "ft", label: "ft", toMeter: 0.3048 },
];

export function getDeflectionUnits(unitSystem) {
  return unitSystem === "metric"
    ? metricDeflectionUnits
    : imperialDeflectionUnits;
}

// Convert FROM meters -> selected deflection unit
export function fromDeflectionMeter(value_m, unitSystem, unitValue) {
  const list = getDeflectionUnits(unitSystem);

  for (let i = 0; i < list.length; i++) {
    if (list[i].value === unitValue) {
      return value_m / list[i].toMeter;
    }
  }
  return value_m;
}
// -------------------
// Slope/rotation units
// base unit: rad
// -------------------
export const slopeUnits = [
  { value: "mrad", label: "mrad", fromRad: 1000 }, // rad -> mrad
  { value: "rad", label: "rad", fromRad: 1 },
  { value: "deg", label: "deg", fromRad: 180 / Math.PI },
];

export function getSlopeUnits() {
  return slopeUnits;
}

// Convert FROM rad -> selected unit
export function fromSlopeRad(value_rad, unitValue) {
  const list = getSlopeUnits();
  for (let i = 0; i < list.length; i++) {
    if (list[i].value === unitValue) {
      return value_rad * list[i].fromRad;
    }
  }
  return value_rad;
}
