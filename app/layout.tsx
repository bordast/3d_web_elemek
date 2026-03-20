import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D Viewer",
  description: "Interactive GLTF model viewer with texture, camera and light controls",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
