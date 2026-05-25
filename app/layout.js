import "./globals.css";
import Nav from "./components/Nav";
import Concierge from "./components/Concierge";
import CoachTip from "./components/CoachTip";
import { RoleProvider } from "./components/RoleProvider";
import { PreferencesProvider } from "./components/Preferences";

export const metadata = {
  title: "DC Reporting — Generic Program",
  description: "Multi-site data center construction reporting prototype",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1d1e1a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RoleProvider>
          <PreferencesProvider>
            <Nav />
            <main className="wrap page">{children}</main>
            <Concierge />
            <CoachTip />
          </PreferencesProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
