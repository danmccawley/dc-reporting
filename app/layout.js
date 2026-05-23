import "./globals.css";
import Nav from "./components/Nav";
import Concierge from "./components/Concierge";

export const metadata = {
  title: "Project Reporting — Abilene DC Build",
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
        <Nav />
        <main className="wrap page">{children}</main>
        <Concierge />
      </body>
    </html>
  );
}
