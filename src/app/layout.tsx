import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import Box from "@mui/material/Box";
import { ThemeRegistry } from "@/components/ThemeRegistry";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SITE_NAME, SITE_URL, pageMetadata } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({}),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ height: "100%" }}
      suppressHydrationWarning
    >
      <head>
        <InitColorSchemeScript defaultMode="light" />
      </head>
      <body style={{ height: "100%" }}>
        <AppRouterCacheProvider options={{ key: "mui" }}>
          <ThemeRegistry>
            <Box sx={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
              <Nav />
              {children}
              <Footer />
            </Box>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
