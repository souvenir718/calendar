import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeColorSync } from "@/components/providers/ThemeColorSync";

export const metadata: Metadata = {
  title: "FruitsFamily Calendar",
  description: "Fruits Calendar",
};

// viewport export removed or empty if only themeColor was there
export const viewport = {};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeColorSync />
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
