import { Sun, Moon, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Escuro", icon: Moon },
    { value: "mixed", label: "Misturado", icon: Palette },
  ];

  const getCurrentIcon = () => {
    const currentTheme = themes.find(t => t.value === theme);
    const Icon = currentTheme?.icon || Sun;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <DropdownMenu>
      <div className="mobile-theme-selector">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative mobile-theme-button">
            {getCurrentIcon()}
            <span className="sr-only">Selecionar tema</span>
          </Button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent align="end" className="w-40 mobile-theme-dropdown bg-card border border-border">
        {themes.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={`flex items-center gap-2 cursor-pointer text-foreground ${
              theme === value ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
