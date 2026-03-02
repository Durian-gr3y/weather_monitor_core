import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Nigeria Weather Monitor | Research MVP",
  description: "Advanced weather analytics and agricultural forecasting for Nigeria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          <header className="glass-card m-4 p-4 flex justify-between items-center sticky top-4 z-50">
            <h1 className="text-xl text-blue-400">WeatherMonitor<span className="text-white">Core</span></h1>
            <nav className="flex gap-6 text-sm font-medium">
              <a href="/" className="hover:text-blue-400">Dashboard</a>
              <a href="/seasonal" className="hover:text-blue-400">Seasonal</a>
              <a href="/historical" className="hover:text-blue-400">Historical</a>
              <a href="/methodology" className="hover:text-blue-400">Methodology</a>
            </nav>
          </header>
          <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
            {children}
          </main>
          <footer className="p-8 text-center text-slate-500 text-sm">
            &copy; 2026 Weather Monitor Core | Nigeria Data Analyst Portfolio MVP
          </footer>
        </div>
      </body>
    </html>
  );
}
