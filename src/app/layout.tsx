
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
        <link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMCIgd2lkdGg9IjYwLjAwMDAwMHB0IiBoZWlnaHQ9IjI3LjAwMDAwMHB0IiB2aWV3Qm94PSIwIDAgNDUwLjAwMDAwMCAyMDIuMDAwMDAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij4KICAgICAgICAgICAgPG1ldGFkYXRhIGZpbGw9IiNjY2EyYTIiPgogICAgICAgICAgICBDcmVhdGVkIGJ5IHBvdHJhY2UgMS4xMCwgd3JpdHRlbiBieSBQZXRlciBTZWxpbmdlciAyMDAxLTIwMTEKICAgICAgICAgICAgPC9tZXRhZGF0YT4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTgwLDE3MCkgc2NhbGUoMC4wNTAwMDAwLC0wLjA1MDAwMCkiIGZpbGw9IiNjY2EyYTIiIHN0cm9rZT0ibm9uZSI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik01NzAxIDI2NTEgYy0xMyAtMTYgLTM1IC0yNCAtNDggLTE5IC00OSAxOCAtMTk5IC0xNjMgLTE3NCAtMjEwIDE1IC0yOSAxNiAtNDIgMSAtNDIgLTEyIDAgLTI2IDEzIC0zMiAyOCAtOSAyNCAtMjAgMjMgLTY3IC00IC01NSAtMzEgLTU4IC0zMCAtMTI4IDMxIC0xNDEgMTIzIC0yNzMgMTExIC00MTkgLTM4IC05MiAtOTIgLTEwNCAtOTkgLTE3MiAtODcgLTE1NiAyNiAtMzAyIC0xMzkgLTMwMiAtMzQxIDAgLTE1MCAtMjUgLTE2OCAtMTA1IC03NyAtMTI3IDE0NSAtNjg3IDE4NyAtODA0IDYxIC01NSAtNTkgLTgwIC01OSAtMTk5IDIgLTY0IDMyIC0xMjAgNDAgLTQyMSA1NyAtMjM5IDE0IC00OTcgLTYgLTQ3OCAtMzcgOSAtMTQgLTIgLTE3IC0zMCAtMTAgLTgzIDIyIC0xNzIgLTIxIC0yNDMgLTExNSAtMzcgLTQ5IC03NSAtOTAgLTg0IC05MCAtNzAgMCAxMyAtMzY5IDEwMSAtNDQ4IDI0IC0yMSA0MyAtNTAgNDMgLTY0IDAgLTYzIDEzMyAtNTUgMjA2IDE0IDc4IDcyIDEwMiAtMTYgMzUgLTEyNiAtMjIgLTM1IC0zNSAtODMgLTMwIC0xMDUgNSAtMjMgMTIgLTcwIDE2IC0xMDYgNiAtNjMgNzQgLTE0NiAxNDEgLTE3MSA_"/>
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
