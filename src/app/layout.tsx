
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'SavageMath 🔥💀',
  description: 'Get roasted or complimented on your math skills! A GenAI powered math game.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM2NzUwQTQiLz4KPHBhdGggZD0iTTIzLjA4IDE5VjQ2SDI4LjM2VjMyLjY0TDM0LjI4IDQyLjU2SDM4Ljg4TDQ0LjcyIDMyLjU2VjQ2SDUwLjMyVjE5SDQ0LjQ0TDM2LjYgMzMuODRMMjguNzIgMTlIMjMuMDhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
