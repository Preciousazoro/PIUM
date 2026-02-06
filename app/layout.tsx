import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProviderWrapper } from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";

const inter = localFont({
  src: [
    {
      path: "./fonts/inter-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/inter-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/inter-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/inter-700.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/inter-800.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TaskKash",
  description: "Earn rewards by completing tasks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <AuthProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProviderWrapper>
      </body>
    </html>
  );
}