import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { useEffect } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
      themes={["light", "dark", "mixed"]}
      storageKey="gymjm-theme"
      {...props}
    >
      <ThemeWrapper>{children}</ThemeWrapper>
    </NextThemesProvider>
  );
}

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Força aplicação do tema em mobile e desktop
    const applyTheme = () => {
      const theme = localStorage.getItem("gymjm-theme") || "light";
      const root = document.documentElement;
      
      // Adiciona classe do tema ao body para mobile
      document.body.classList.remove("theme-light", "theme-dark", "theme-mixed");
      document.body.classList.add(`theme-${theme}`);
      
      // Força atualização das CSS variables
      root.setAttribute("data-theme", theme);
    };

    applyTheme();
    
    // Observa mudanças de tema
    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
