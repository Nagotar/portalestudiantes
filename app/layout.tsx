import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DynamicFavicon from "./components/DynamicFavicon";
import StructuredData from "./components/StructuredData";
import { ConfigProvider } from "@/contexts/ConfigContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.adam.cl'),
  title: {
    default: 'ADAM Capacitación | Cursos de Operación de Maquinaria Pesada',
    template: '%s | ADAM Capacitación'
  },
  description: 'Centro de capacitación profesional en operación de maquinaria pesada. Cursos certificados de grúa horquilla, excavadora, retroexcavadora y más. Certificación SENCE.',
  keywords: ['capacitación', 'maquinaria pesada', 'grúa horquilla', 'excavadora', 'retroexcavadora', 'operador certificado', 'SENCE', 'cursos certificados', 'operación de maquinaria', 'capacitación laboral'],
  authors: [{ name: 'ADAM Capacitación' }],
  creator: 'ADAM Capacitación',
  publisher: 'ADAM Capacitación',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: 'https://www.adam.cl',
    siteName: 'ADAM Capacitación',
    title: 'ADAM Capacitación | Cursos de Operación de Maquinaria Pesada',
    description: 'Centro de capacitación profesional en operación de maquinaria pesada. Cursos certificados SENCE.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ADAM Capacitación - Cursos de Maquinaria Pesada',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADAM Capacitación | Cursos de Operación de Maquinaria Pesada',
    description: 'Centro de capacitación profesional en operación de maquinaria pesada. Cursos certificados SENCE.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'tu-codigo-de-verificacion-aqui',
  },
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
        <StructuredData />
      </head>
      <body className={inter.className}>
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
