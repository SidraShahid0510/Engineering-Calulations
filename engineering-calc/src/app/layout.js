import { Poppins } from "next/font/google";
import "./globals.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Engineering Calc",
  description: "Engineering calculators and references",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Navbar />

        {children}
      </body>
    </html>
  );
}
