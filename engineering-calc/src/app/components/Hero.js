import styles from "./Hero.module.css";
import Image from "next/image";
export default function Hero() {
  return (
    <section className="styles.hero">
      <div className={styles.container}>
        {/*left side*/}
        <div className={styles.content}>
          <h1 className={styles.title}>Engineering Calculators</h1>
          <p className={styles.description}>
            Solve complex engineering equations instantly with accurate and
            reliable tools designed for students and professionals.
          </p>
          <button className={styles.primaryBtn}>Explore Tools</button>
        </div>
        {/*right side*/}
        <div className={styles.imageWrapper}>
          <Image
            src="/hero-img.png" // put image in public folder
            alt="Engineering Illustration"
            width={500}
            height={400}
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
