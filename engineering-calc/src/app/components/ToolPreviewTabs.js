"use client";
import { useState } from "react";
import styles from "./ToolPreviewTabs.module.css";
import Link from "next/link";
import Image from "next/image";

export default function ToolPreviewTabs() {
  const [activeTab, setActiveTab] = useState("beam");
  const content = {
    beam: {
      title: "Beam Calculator",
      description:
        "Our Beam Calculator is designed to simplify structural analysis by providing accurate calculations for shear force, bending moment, reactions, and deflection. Whether analyzing simply supported beams, cantilevers, or continuous systems, this tool helps engineers and students quickly evaluate structural behavior under various loading conditions with precision and reliability.",
      link: "/calculators/beam",
      images: ["/beam.png", "/beam2.png", "/beam2.png"],
    },
    inertia: {
      title: "Moment of Inertia",
      description:
        "Understanding moment of inertia is critical for predicting how a beam or structural member will respond to bending. This calculator streamlines the process, reducing manual computation errors and ensuring reliable section property results for design verification and analysis.",
      link: "/tools/inertia",
      images: ["/beam.png", "/beam2.png", "/beam2.png"],
    },
    section: {
      title: "Section Properties",
      description:
        "Compute centroid, area, and structural properties instantly.",
      link: "/tools/section",
      images: ["/beam.png", "/beam2.png", "/beam2.png"],
    },
    user: {
      title: "User Defined",
      description:
        "Create custom shapes and define your own section parameters.",
      link: "/tools/user",
      images: ["/beam.png", "/beam2.png", "/beam2.png"],
    },
  };
  const current = content[activeTab];
  return (
    <section className={styles.wrapper}>
      <p className={styles.previewText}>
        Streamline your structural design process with powerful, reliable
        engineering calculators built for precision and speed.
      </p>
      {/*tabs*/}
      <div className={styles.tabs}>
        <button
          className={activeTab === "beam" ? styles.active : ""}
          onClick={() => setActiveTab("beam")}
        >
          Beam Calculator
        </button>
        <button
          className={activeTab === "inertia" ? styles.active : ""}
          onClick={() => setActiveTab("inertia")}
        >
          Moment of Inertia
        </button>

        <button
          className={activeTab === "section" ? styles.active : ""}
          onClick={() => setActiveTab("section")}
        >
          Section Properties
        </button>

        <button
          className={activeTab === "user" ? styles.active : ""}
          onClick={() => setActiveTab("user")}
        >
          User Defined
        </button>
      </div>
      {/* Content Layout */}
      <div className={styles.layout}>
        {/* Left: Big Image */}
        <div className={styles.bigImage}>
          <Image
            src={current.images[0]}
            alt={`${current.title} preview`}
            width={600}
            height={400}
            className={styles.bigImg}
          />
        </div>

        {/* Right: Text + Link + 2 images */}
        <div className={styles.rightSide}>
          <div className={styles.textBox}>
            <h3 className={styles.title}>{current.title}</h3>
            <p className={styles.description}>{current.description}</p>

            <Link href={current.link} className={styles.linkBtn}>
              Go to Tool
            </Link>
          </div>

          <div className={styles.smallImages}>
            <div className={styles.smallImageBox}>
              <Image
                src={current.images[1]}
                alt=""
                width={300}
                height={200}
                className={styles.smallImg}
              />
            </div>
            <div className={styles.smallImageBox}>
              <Image
                src={current.images[1]}
                alt=""
                width={300}
                height={200}
                className={styles.smallImg}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
