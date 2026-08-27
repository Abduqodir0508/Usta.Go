import Link from "next/link";
import { Home, Search, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Bosh sahifa" },
  { href: "/search", icon: Search, label: "Qidiruv" },
  { href: "/dashboard", icon: ClipboardList, label: "Buyurtmalar" },
  { href: "/profile", icon: User, label: "Profil" },
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-50 flex items-center justify-around pb-safe">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-[#1E40AF] transition-colors"
        >
          <item.icon className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
