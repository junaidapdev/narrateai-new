// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { Toaster } from "@/components/ui/sonner";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Narrate - Transform Your Voice Into Engaging Content",
//   description: "Record your thoughts, get AI-powered transcription, and create compelling posts, articles, and social media content automatically.",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         {children}
//         <Toaster />
//       </body>
//     </html>
//   );
// }


import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Narrate - Transform Your Voice Into Engaging Content",
  description: "Record your thoughts, get AI-powered transcription, and create compelling posts, articles, and social media content automatically.",
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${inter.variable} ${fraunces.variable} antialiased`}
      >
        <ErrorBoundary>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse-subtle text-muted-foreground">Loading...</div>
          </div>}>
            {children}
          </Suspense>
        </ErrorBoundary>
        <Toaster />
                <Analytics />
      </body>
    </html>
  );
}