import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Morpankh Saree - Traditional & Contemporary Sarees",
  description: "Shop the finest collection of traditional and contemporary sarees. Banarasi, Paithani, Kanjivaram & more at Morpankh Saree.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
