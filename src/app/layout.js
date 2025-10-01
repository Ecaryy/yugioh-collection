import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";

import "./globals.css";


const inter = Inter({ subsets: ["latin"] });
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CollectiCards",
  description: "Mon site de collection",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
              className={inter.className}
      >
        {children}
      </body>
    </html>
  );
}
