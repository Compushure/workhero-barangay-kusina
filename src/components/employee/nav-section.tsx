'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ListChecks, Store } from "lucide-react";

export default function NavSection() {
  const [active, setActive] = useState("dashboard");
  const [hovered, setHovered] = useState<string | null>(null);
  const router = useRouter();

  const getButtonClasses = (name: string) => {
    const isActive = active === name;
    const isHovered = hovered === name;

    if (isActive && !hovered) {
      return "w-44"; // expanded width
    }
    if (isHovered) {
      return "w-44"; // expanded width
    }
    return "w-28 sm:w-32"; // compact width
  };

  const handleClick = (name: string, href: string) => {
    setActive(name);       // toggle active state
    router.push(href);     // navigate to page
  };

  return (
    <Card className="mt-10 h-full flex flex-col bg-transparent shadow-none border-none">
      <CardContent className="flex flex-col gap-6 mt-4 w-full p-0">
        {/* Dashboard */}
        <Button
          variant="outline"
          className={`${getButtonClasses("dashboard")} flex items-center gap-3 px-3 py-6 
                      text-sm sm:text-base font-medium rounded-lg justify-start 
                      text-foreground bg-white/20 hover:bg-white/30 transition-all duration-300 ease-in-out`}
          onClick={() => handleClick("dashboard", "/employee/dashboard")}
          onMouseEnter={() => setHovered("dashboard")}
          onMouseLeave={() => setHovered(null)}
        >
          <Home className="w-5 h-5 shrink-0 text-foreground" />
          <span className="truncate">Dashboard</span>
        </Button>

        {/* All Tasks */}
        <Button
          variant="outline"
          className={`${getButtonClasses("tasks")} flex items-center gap-3 px-3 py-6 
                      text-sm sm:text-base font-medium rounded-lg justify-start 
                      text-foreground bg-white/20 hover:bg-white/30 transition-all duration-300 ease-in-out`}
          onClick={() => handleClick("tasks", "/employee/tasks")}
          onMouseEnter={() => setHovered("tasks")}
          onMouseLeave={() => setHovered(null)}
        >
          <ListChecks className="w-5 h-5 shrink-0 text-foreground" />
          <span className="truncate">All Tasks</span>
        </Button>

        {/* Mercado */}
        <Button
          variant="outline"
          className={`${getButtonClasses("mercado")} flex items-center gap-3 px-3 py-6 
                      text-sm sm:text-base font-medium rounded-lg justify-start 
                      text-foreground bg-white/20 hover:bg-white/30 transition-all duration-300 ease-in-out`}
          onClick={() => handleClick("mercado", "/employee/mercado")}
          onMouseEnter={() => setHovered("mercado")}
          onMouseLeave={() => setHovered(null)}
        >
          <Store className="w-5 h-5 shrink-0 text-foreground" />
          <span className="truncate">Mercado</span>
        </Button>
      </CardContent>
    </Card>
  );
}
