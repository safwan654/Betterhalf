import "./globals.css";
import { GlobalProvider } from "@/context/GlobalContext";
import EntryAnimation from "@/components/animations/EntryAnimation";
import AuthGuard from "@/components/layout/auth-guard";

export const metadata = {
  title: "BetterHalf - Home OS",
  description: "Shared Command Center for Couples",
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
          </AuthGuard>
        </GlobalProvider>
      </body>
    </html>
  );
}
