"use client";

import PropertyRow from "./PropertyRow";
import LoadInputRow from "./LoadInputRow";
import { LOAD_CASES } from "./loadCases";
import styles from "./BeamInput.module.css";

export default function BeamInputPanel({
  props,
  setProps,
  loadType,
  setLoadType,
  loadInputs,
  setLoadInputs,
  onCalculate,
  errors,
}) {
  const activeCase = LOAD_CASES[loadType];

  function handlePropChange(name, value) {
    setProps((prev) => ({ ...prev, [name]: value }));
  }

  function handleLoadInputChange(name, value) {
    setLoadInputs((prev) => ({ ...prev, [name]: value }));
  }
  const Lnum = Number(props.L);
  const canCalculate = props.L && isFinite(Lnum) && Lnum > 0;

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Inputs</h2>
      {/* Key Properties */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Key Properties</h3>

        <PropertyRow
          title="Length of Beam"
          symbol="L"
          value={props.L}
          onChange={(v) => handlePropChange("L", v)}
          unit="mm"
          placeholder="e.g. 2000"
          error={errors?.L}
        />

        <PropertyRow
          title="Young's Modulus"
          symbol="E"
          value={props.E}
          onChange={(v) => handlePropChange("E", v)}
          unit="MPa"
          placeholder="e.g. 200000"
        />

        <PropertyRow
          title="Second Moment of Area (I)"
          symbol="I"
          value={props.I}
          onChange={(v) => handlePropChange("I", v)}
          unit="mm⁴"
          placeholder="e.g. 6660000"
        />
      </div>
      {/* Loading */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Imposed loading</h3>
        <select
          className={styles.select}
          value={loadType}
          onChange={(e) => {
            setLoadType(e.target.value);
            setLoadInputs({});
          }}
        >
          {Object.entries(LOAD_CASES).map(([key, obj]) => (
            <option key={key} value={key}>
              {obj.label}
            </option>
          ))}
        </select>
        <div className={styles.loadFields}>
          {activeCase.fields.map((field) => {
            // ✅ RADIO FIELDS (like Ascending / Descending)
            if (field.type === "radio") {
              const selected =
                loadInputs[field.name] || field.options?.[0]?.value;

              return (
                <div key={field.name} className={styles.radioGroup}>
                  <div className={styles.radioLabel}>{field.label}:</div>

                  <div className={styles.radioOptions}>
                    {field.options.map((opt) => (
                      <label key={opt.value} className={styles.radioOption}>
                        <input
                          type="radio"
                          name={field.name}
                          value={opt.value}
                          checked={selected === opt.value}
                          onChange={(e) =>
                            handleLoadInputChange(field.name, e.target.value)
                          }
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            }

            // ✅ NORMAL INPUT FIELDS (w1, w2, a, b, etc.)
            return (
              <LoadInputRow
                key={field.name}
                label={field.label}
                value={loadInputs[field.name] ?? ""}
                onChange={(v) => handleLoadInputChange(field.name, v)}
                placeholder={field.placeholder}
                unit={field.unit}
              />
            );
          })}
        </div>
        <button
          className={styles.calculateBtn}
          type="button"
          onClick={onCalculate}
          disabled={!canCalculate}
        >
          Calculate
        </button>
      </div>
    </div>
  );
}
