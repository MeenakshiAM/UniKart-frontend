import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Unikart",
  description: "Student marketplace frontend for Unikart",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Navbar />
          <main className="mx-auto min-h-[calc(100vh-80px)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
