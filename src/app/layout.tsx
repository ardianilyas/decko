import type { Metadata } from "next";
import { Albert_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

import { cookies } from "next/headers";

const albertSans = Albert_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Decko",
  description: "Modern chat application",
};

import { TRPCProvider } from "@/trpc/Provider";
import { ThemeProvider } from "@/components/theme-provider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("decko-theme")?.value || "system";
  const themeClass = theme === "dark" ? "dark" : theme === "light" ? "light" : "";

  return (
    <html
      lang="en"
      className={`${albertSans.variable} ${geistMono.variable} h-full antialiased ${themeClass}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem("decko-theme");
                  const theme = stored || "system";
                  let isDark = theme === "dark";
                  if (theme === "system") {
                    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  }
                  if (isDark) {
                    document.documentElement.classList.add("dark");
                    document.documentElement.classList.remove("light");
                  } else {
                    document.documentElement.classList.remove("dark");
                    document.documentElement.classList.add("light");
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <TRPCProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" closeButton richColors />
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
