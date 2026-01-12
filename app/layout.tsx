import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DynamicFavicon from "./components/DynamicFavicon";
import { ConfigProvider } from "@/contexts/ConfigContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portal Estudiante",
  description: "Portal de gestión para estudiantes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <DynamicFavicon />
      </head>
      <body className={inter.className}>
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
