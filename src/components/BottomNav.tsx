import { Link, useLocation } from "react-router-dom";
import { Home, Activity, Search, Dumbbell, User, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  currentPage?: "dashboard" | "workouts" | "explore" | "exercises" | "profile";
}

export function BottomNav({ currentPage }: BottomNavProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (currentPage) {
      return path.includes(currentPage);
    }
    return location.pathname === path;
  };

  const navItems = [
    { icon: Home, label: "Treinos", path: "/workouts" },
    { icon: Activity, label: "Atividades", path: "/progress" },
    { icon: ChefHat, label: "Receitas", path: "/favorite-recipes" },
    { icon: Dumbbell, label: "Exercícios", path: "/exercises" },
    { icon: User, label: "Corpo", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[60px]",
                "transition-colors"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  active ? "text-black" : "text-gray-400"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  active ? "text-black" : "text-gray-400"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
