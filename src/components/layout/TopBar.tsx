import Link from "next/link";
import { MessageSquare } from "lucide-react";

export function TopBar() {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-[#1E40AF] rounded flex items-center justify-center">
          <span className="text-white font-bold text-base leading-none">U</span>
        </div>
        <span className="text-lg font-bold text-slate-900 tracking-tight">
          UstaGo
        </span>
      </Link>
      <button className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <MessageSquare className="w-5 h-5" />
      </button>
    </header>
  );
}
