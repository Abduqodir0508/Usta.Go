import Link from "next/link";
import { Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border-color bg-background py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} UstaGo. Barcha huquqlar himoyalangan.
        </p>
        
        <a 
          href="https://t.me/A_Husanboyev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors cursor-pointer group"
        >
          <Send className="w-4 h-4 text-amber-500 group-hover:text-amber-400 transition-colors" />
          Qo'llab-quvvatlash
        </a>
      </div>
    </footer>
  );
}
