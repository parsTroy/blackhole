import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Black Hole Visualization",
  description: "An interactive 3D visualization of a black hole inspired by Interstellar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="overflow-hidden bg-black">
        {children}
      </body>
    </html>
  );
}
