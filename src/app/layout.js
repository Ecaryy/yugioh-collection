import { Cinzel, Marcellus_SC, Berkshire_Swash } from "next/font/google";
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600", "700"] });
const marcellus = Marcellus_SC({ subsets: ["latin"], weight: ["400"] });
const berkshire = Berkshire_Swash({ subsets: ["latin"], weight: ["400"] });


import "./globals.css";


export const metadata = {
  title: "CollectiCards",
    description: "Mon site de collection",
    icons: {
        icon: [
            { url: '/Logo_petit.png', type: 'image/png' },
            
        ],
    },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
          <body className={cinzel.className}>{children}</body>
    </html>
  );
}
