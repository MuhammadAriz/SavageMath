
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
        <link rel="icon" href="data:image/png;base64,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" type="image/png" />
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
