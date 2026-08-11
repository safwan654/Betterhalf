import "./globals.css";
import { GlobalProvider } from "@/context/GlobalContext";
import EntryAnimation from "@/components/animations/EntryAnimation";
import TaskAlert from "@/components/animations/TaskAlert";
import AuthGuard from "@/components/layout/auth-guard";

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: "BetterHalf OS",
  description: "Shared Command Center for Couples",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BetterHalf",
  },
};

export const viewport: Viewport = {
  themeColor: "#f43f5e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GlobalProvider>
          <AuthGuard>
            {children}
            <EntryAnimation />
            <TaskAlert />
          </AuthGuard>
        </GlobalProvider>
      </body>
    </html>
  );
}
