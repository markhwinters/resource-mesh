import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resource Mesh",
  description: "P2P Mesh Network and resource monitor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
