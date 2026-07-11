import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import Navbar from "@/components/Navbar";
import CursorBlob from "@/components/CursorBlob";

const sfProDisplay = localFont({
  src: [
    {
      path: "../node_modules/sf-pro/font/woff2/sf-pro-display_regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/sf-pro/font/woff2/sf-pro-display_medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../node_modules/sf-pro/font/woff2/sf-pro-display_semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../node_modules/sf-pro/font/woff2/sf-pro-display_bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sf-display",
});

const sfProText = localFont({
  src: [
    {
      path: "../node_modules/sf-pro/font/woff2/sf-pro-text_light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "../node_modules/sf-pro/font/woff2/sf-pro-text_regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/sf-pro/font/woff2/sf-pro-text_semibold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-sf-text",
});

const qinferly = localFont({
  src: "../public/fonts/qinferly.ttf",
  variable: "--font-qin",
});

export const metadata: Metadata = {
  title: "Creative Developer Portfolio",
  description: "A premium developer portfolio showcase with smooth Lenis scrolling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sfProDisplay.variable} ${sfProText.variable} ${qinferly.variable} dark antialiased`}
    >
      <body className="flex flex-col selection:bg-foreground selection:text-background">
        <LenisProvider>
          <Navbar />
          <CursorBlob />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
