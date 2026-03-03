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
  unitSystem,
  setUnitSystem,
  LUnit,
  setLUnit,
  lengthUnits,
  EUnit,
  setEUnit,
  eUnits,
  IUnit,
  setIUnit,
  iUnits,
  wUnit,
  setWUnit,
  wUnits,
  PUnit,
  setPUnit,
  pUnits,
  MUnit,
  setMUnit,
  mUnits,
}) {
  const activeCase = LOAD_CASES[loadType];

  function handlePropChange(name, value) {
    setProps((prev) => ({ ...prev, [name]: value }));
  }

  function handleLoadInputChange(name, value) {
    setLoadInputs((prev) => ({ ...prev, [name]: value }));
  }

  const Lnum = Number(props.L);
  const canCalculate = props.L && Number.isFinite(Lnum) && Lnum > 0;

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Inputs</h2>

      {/* ✅ Units Toggle (NOW inside return) */}
      <div className={styles.unitSystemBox}>
        <p className={styles.unitTitle}>Units:</p>

        <div className={styles.unitButtons}>
          <button
            type="button"
            className={`${styles.unitBtn} ${
              unitSystem === "imperial" ? styles.activeBtn : ""
            }`}
            onClick={() => setUnitSystem("imperial")}
          >
            Imperial
          </button>

          <button
            type="button"
            className={`${styles.unitBtn} ${
              unitSystem === "metric" ? styles.activeBtn : ""
            }`}
            onClick={() => setUnitSystem("metric")}
          >
            Metric
          </button>
        </div>
      </div>

      {/* Key Properties */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Key Properties</h3>

        <PropertyRow
          title="Length of Beam"
          symbol="L"
          value={props.L}
          onChange={(v) => handlePropChange("L", v)}
          unit={LUnit}
          unitOptions={lengthUnits}
          onUnitChange={setLUnit}
          placeholder="e.g. 2000"
          error={errors?.L}
        />

        <PropertyRow
          title="Young's Modulus"
          symbol="E"
          value={props.E}
          onChange={(v) => handlePropChange("E", v)}
          unit={EUnit}
          unitOptions={eUnits}
          onUnitChange={setEUnit}
          placeholder="e.g. 200000"
        />

        <PropertyRow
          title="Moment of Inertia"
          symbol="I"
          value={props.I}
          onChange={(v) => handlePropChange("I", v)}
          unit={IUnit}
          unitOptions={iUnits}
          onUnitChange={setIUnit}
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
            const isW = field.name === "w";
            const isP = field.name === "P";
            const isA = field.name === "a";
            const isB = field.name === "b";
            const isM = field.name === "M";
            const isWTotal = field.name === "W";
            const isW1 = field.name === "w1";
            const isW2 = field.name === "w2";
            return (
              <LoadInputRow
                key={field.name}
                label={field.label}
                value={loadInputs[field.name] ?? ""}
                onChange={(v) => handleLoadInputChange(field.name, v)}
                placeholder={field.placeholder}
                unit={
                  isW || isW1 || isW2
                    ? wUnit
                    : isP
                      ? PUnit
                      : isWTotal
                        ? PUnit
                        : isM
                          ? MUnit
                          : isA || isB
                            ? LUnit
                            : field.unit
                }
                unitOptions={
                  isW || isW1 || isW2
                    ? wUnits
                    : isP
                      ? pUnits
                      : isWTotal
                        ? pUnits
                        : isM
                          ? mUnits
                          : isA || isB
                            ? lengthUnits
                            : null
                }
                onUnitChange={
                  isW || isW1 || isW2
                    ? setWUnit
                    : isP
                      ? setPUnit
                      : isWTotal
                        ? setPUnit
                        : isM
                          ? setMUnit
                          : isA || isB
                            ? setLUnit
                            : null
                }
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
