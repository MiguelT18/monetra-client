import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/contexts/themeContext";
import { NotificationProvider } from "@/hooks/useNotification";
import { ProfileProvider } from "@/hooks/useProfile";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monetra — Tu Conocimiento es el Nuevo Oro",
  description:
    "La primera plataforma educativa gamificada. Crea tu producto, gestiona tu negocio y vende en todo el mundo mientras ganas XP, subes de nivel y construyes tu imperio digital.",
  openGraph: {
    title: "Monetra — Tu Conocimiento es el Nuevo Oro",
    description:
      "La primera plataforma educativa gamificada donde creadores, afiliados y estudiantes ganan mientras crecen.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="app-scrollbar min-h-full flex flex-col">
        <ThemeProvider>
          <NotificationProvider>
            <ProfileProvider>{children}</ProfileProvider>
          </NotificationProvider>
        </ThemeProvider>
        <svg aria-hidden="true" style={{position:'absolute',width:0,height:0,overflow:'hidden'}}>
          <filter id="glass-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="matrix" values="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0.07 0"/>
          </filter>
        </svg>
      </body>
    </html>
  );
}
