import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import Box from "@mui/material/Box";
import { ThemeRegistry } from "@/components/ThemeRegistry";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { INSTALL_PROMPT_CAPTURE_SCRIPT } from "@/lib/pwa-install";
import { SITE_URL, pageMetadata } from "@/lib/site";
import { SITE_NAME } from "@/lib/config";
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
  // Installed on iPhone/iPad ("Adicionar ao ecrã principal"): open full screen.
  appleWebApp: { capable: true, title: "GARCEA", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0f16" },
  ],
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
        <script dangerouslySetInnerHTML={{ __html: INSTALL_PROMPT_CAPTURE_SCRIPT }} />
      </head>
      <body style={{ height: "100%" }}>
        <AppRouterCacheProvider options={{ key: "mui" }}>
          <ThemeRegistry>
            <Box sx={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
              <Nav />
              {children}
              <Footer />
              <ServiceWorkerRegister />
              <SiteAnalytics />
            </Box>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
