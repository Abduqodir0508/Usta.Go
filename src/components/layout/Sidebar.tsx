import Link from "next/link";
import { Home, Search, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Bosh sahifa" },
  { href: "/search", icon: Search, label: "Qidiruv" },
  { href: "/dashboard", icon: ClipboardList, label: "Buyurtmalar" },
  { href: "/profile", icon: User, label: "Profil" },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-slate-200 bg-white fixed top-0 left-0 z-40">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1E40AF] rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">U</span>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            UstaGo
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-sm font-medium text-slate-900 mb-1">
            Usta kerakmi?
          </p>
          <p className="text-xs text-slate-500 mb-3">
            AI yordamchimiz sizga to'g'ri ustani topishga yordam beradi.
          </p>
          <button className="w-full bg-[#EA580C] hover:bg-[#c2410c] text-white text-sm font-medium py-2 rounded-lg transition-colors">
            AI ga yozish
          </button>
        </div>
      </div>
    </aside>
  );
}
