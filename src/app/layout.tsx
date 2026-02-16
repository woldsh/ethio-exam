import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import UserGuard from "@/components/UserGuard";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EthioExam - AI-Powered Entrance Exam Tutor",
  description: "Master your Ethiopian entrance exam with AI-powered step-by-step explanations and exam tips. Practice Math, Physics, Chemistry, and Biology.",
  keywords: ["Ethiopian entrance exam", "exam preparation", "AI tutor", "education", "Ethiopia"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <Script id="mathjax-config" strategy="beforeInteractive">
          {`
            window.MathJax = {
              tex: {
                inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                processEscapes: true,
                processEnvironments: true
              },
              options: {
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
              }
            };
          `}
        </Script>
        <Script
          id="mathjax"
          strategy="beforeInteractive"
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <UserGuard>
            {children}
          </UserGuard>
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '1rem 1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#f8fafc',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f8fafc',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
