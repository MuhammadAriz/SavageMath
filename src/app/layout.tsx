
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
        <link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzY3NTBBNCIvPjxwYXRoIGQ9Ik0yMC40MzYgNDRWMTguOTk2SDI2LjM4OFYyOS4xNDhIMzEuNzY0VjM0LjAzMkgzNi45MjRWMTguOTk2SDQyLjY2VjQ0SDM2LjkyNFYzMy43NTZIMzEuNzY0VjQ0SDIwLjQzNloiIGZpbGw9IndoaXRlIi8+PC9zdmc+" />
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
