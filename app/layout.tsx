import "./globals.css";
export const metadata = { title: "Brainrot Tracker", description: "Live brainrot exist counts" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
