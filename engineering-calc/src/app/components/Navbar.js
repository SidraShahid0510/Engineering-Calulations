"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">EngiCalc</Link>
        </div>

        <ul className={styles.navLinks}>
          {/* Products */}
          <li className={styles.navItem}>
            <button
              type="button"
              className={styles.navLinkBtn}
              onClick={() => toggleMenu("products")}
              aria-expanded={openMenu === "products"}
            >
              Products
            </button>

            <div
              className={`${styles.dropdown} ${
                openMenu === "products" ? styles.dropdownOpen : ""
              }`}
            >
              <Link href="#">Calculator</Link>
              <Link href="#">Graphs</Link>
              <Link href="#">Equations</Link>
            </div>
          </li>

          {/* Resources */}
          <li className={styles.navItem}>
            <button
              type="button"
              className={styles.navLinkBtn}
              onClick={() => toggleMenu("resources")}
              aria-expanded={openMenu === "resources"}
            >
              Resources
            </button>

            <div
              className={`${styles.dropdown} ${
                openMenu === "resources" ? styles.dropdownOpen : ""
              }`}
            >
              <Link href="#">Docs</Link>
              <Link href="#">Examples</Link>
            </div>
          </li>

          {/* Solutions */}
          <li className={styles.navItem}>
            <button
              type="button"
              className={styles.navLinkBtn}
              onClick={() => toggleMenu("solutions")}
              aria-expanded={openMenu === "solutions"}
            >
              Solutions
            </button>

            <div
              className={`${styles.dropdown} ${
                openMenu === "solutions" ? styles.dropdownOpen : ""
              }`}
            >
              <Link href="#">Docs</Link>
              <Link href="#">Examples</Link>
            </div>
          </li>

          {/* Normal link */}
          <li className={styles.navItem}>
            <Link className={styles.navLinkText} href="/resources">
              Blog
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
