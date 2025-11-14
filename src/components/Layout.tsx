import { Navbar } from "./Navbar";
import { ThemeProvider } from "./ThemeProvider";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background transition-colors duration-300 overflow-x-hidden">
        <Navbar />
        <main className="pb-20 md:pb-4 md:pt-20 w-full max-w-[100vw] overflow-x-hidden">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}