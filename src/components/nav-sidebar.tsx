"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { BookOpen, BarChart3, User, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/lessons", label: "Lessons", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

export function NavSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-background p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <Flame className="h-5 w-5 text-orange-500" />
        <span className="font-semibold text-sm">Drawing Trainer</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t pt-4">
        <UserButton />
      </div>
    </aside>
  );
}
