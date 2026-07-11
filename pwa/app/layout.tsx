import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Splash from "./components/Splash";
import PageTransition from "./components/PageTransition";
import "./globals.css";

const generalSans = localFont({
  variable: "--font-general-sans",
  src: [
    {
      path: "./fonts/general-sans/GeneralSans-Extralight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/general-sans/GeneralSans-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/general-sans/GeneralSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/general-sans/GeneralSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/general-sans/GeneralSans-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/general-sans/GeneralSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
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
    <html lang="en" className={`${generalSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Splash>
          <PageTransition>{children}</PageTransition>
        </Splash>
      </body>
    </html>
  );
}
