export const LOAD_CASES = {
  udl: {
    label: "Uniform distributed load",
    fields: [{ name: "w", label: "w", placeholder: "enter w", unit: "kN/m" }],
  },

  udlTotal: {
    label: "Uniform distr. load (total)",
    fields: [
      { name: "W", label: "W", placeholder: "enter total load", unit: "kN" },
    ],
  },

  pointCentered: {
    label: "Point load (centered)",
    fields: [{ name: "P", label: "P", placeholder: "enter P", unit: "kN" }],
  },

  point: {
    label: "Point load",
    fields: [
      { name: "P", label: "P", placeholder: "enter P", unit: "kN" },
      { name: "a", label: "a", placeholder: "enter distance a", unit: "m" },
    ],
  },

  pointMoment: {
    label: "Point moment",
    fields: [
      { name: "M", label: "M", placeholder: "enter moment", unit: "kN·m" },
      { name: "a", label: "a", placeholder: "enter distance a", unit: "m" },
    ],
  },

  triangular: {
    label: "Triangular load",
    fields: [
      { name: "w1", label: "w1", placeholder: "enter w1", unit: "kN/m" },
      {
        name: "direction",
        label: "Form",
        type: "radio",
        options: [
          { label: "Ascending", value: "ascending" },
          { label: "Descending", value: "descending" },
        ],
      },
    ],
  },

  trapezoidal: {
    label: "Trapezoidal load",
    fields: [
      { name: "w1", label: "w1", placeholder: "enter w1", unit: "kN/m" },
      { name: "w2", label: "w2", placeholder: "enter w2", unit: "kN/m" },
    ],
  },

  trapezoidalSlab: {
    label: "Trapezoidal load (slab)",
    fields: [
      { name: "w", label: "w", placeholder: "enter w", unit: "kN/m" },
      { name: "a", label: "a", placeholder: "enter length a", unit: "m" },
      { name: "b", label: "b", placeholder: "enter length b", unit: "m" },
    ],
  },

  partialUniform: {
    label: "Partial uniform load",
    fields: [
      { name: "w", label: "w", placeholder: "enter w", unit: "kN/m" },
      { name: "a", label: "a", placeholder: "enter length a", unit: "m" },
      { name: "b", label: "b", placeholder: "enter length b", unit: "m" },
    ],
  },

  partialTriangular: {
    label: "Partial triangular load",
    fields: [
      { name: "w1", label: "w1", placeholder: "enter w1", unit: "kN/m" },
      { name: "a", label: "a", placeholder: "enter length a", unit: "m" },
      { name: "b", label: "b", placeholder: "enter length b", unit: "m" },
    ],
  },

  partialTrapezoidal: {
    label: "Partial trapezoidal load",
    fields: [
      { name: "w1", label: "w1", placeholder: "enter w1", unit: "kN/m" },
      { name: "w2", label: "w2", placeholder: "enter w2", unit: "kN/m" },
      { name: "a", label: "a", placeholder: "enter length a", unit: "m" },
      { name: "b", label: "b", placeholder: "enter length b", unit: "m" },
    ],
  },
};
