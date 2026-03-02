// layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

const chillax = localFont({
  src: "./fonts/Chillax-Variable.woff2",
  variable: "--font-local",
});


export const metadata: Metadata = {
  title: "Femabras",
  description: "O seu sucesso e o nosso foco",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-pt">
      <body
        className={`${chillax.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
