/* import Image from "next/image";
import styles from "./page.module.css";
 */
import Hero from "./components/Hero";
import ToolPreviewTabs from "./components/ToolPreviewTabs";
export default function Home() {
  return (
    <>
      <main style={{ minHeight: "100vh", padding: "40px" }}>
        <Hero />
        <ToolPreviewTabs />
      </main>
    </>
  );
}
