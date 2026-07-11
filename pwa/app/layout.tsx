import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import Splash from "./components/Splash";
import PageTransition from "./components/PageTransition";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ThriveCBT",
  description: "A guided CBT therapy companion.",
  appleWebApp: {
    title: "ThriveCBT",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hankenGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Splash>
          <PageTransition>{children}</PageTransition>
        </Splash>
      </body>
    </html>
  );
}
