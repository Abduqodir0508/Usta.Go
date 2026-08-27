"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Wrench, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Language } from "@/lib/dictionary";
import { AuthModal } from "@/components/modals/AuthModal";
import { AiModal } from "@/components/modals/AiModal";

const LANGUAGES: Language[] = ["UZ", "RU", "EN"];

export function TopNavbar() {
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const [session, setSession] = useState<{ type: 'client' | 'master' | 'admin', name: string, id?: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    const checkSession = () => {
      // Check admin
      const isSuperAdmin = window.location.pathname === "/super-admin";
      if (isSuperAdmin) {
        setSession({ type: 'admin', name: "Super Admin" });
        return;
      }
      
      const master = localStorage.getItem("usta_current_master");
      if (master) {
        const m = JSON.parse(master);
        setSession({ type: 'master', name: m.name, id: m.id });
        return;
      }
      
      const client = localStorage.getItem("usta_client");
      if (client) {
        const c = JSON.parse(client);
        setSession({ type: 'client', name: c.name });
        return;
      }
      
      setSession(null);
    };

    checkSession();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("storage", checkSession);
    
    // Custom event for same-tab auth changes
    window.addEventListener("auth_changed", checkSession);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", checkSession);
      window.removeEventListener("auth_changed", checkSession);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usta_current_master");
    localStorage.removeItem("usta_client");
    setSession(null);
    window.dispatchEvent(new Event("auth_changed"));
    window.location.href = "/";
  };

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "glass shadow-sm py-3" : "bg-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/20 transition-all">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              UstaGo
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => setIsAiOpen(true)} className="text-sm font-medium text-foreground opacity-70 hover:opacity-100 transition-opacity">
              {t.navbar.aiAssistant}
            </button>
            <Link href="/katalog" className="text-sm font-medium text-foreground opacity-70 hover:opacity-100 transition-opacity">
              {t.navbar.directory}
            </Link>
            <Link href="/#faq" className="text-sm font-medium text-foreground opacity-70 hover:opacity-100 transition-opacity">
              {t.navbar.faq}
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-4">

            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 border border-border-color rounded-full p-1 bg-surface">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-semibold rounded-full transition-colors",
                    language === lang 
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white" 
                      : "text-foreground opacity-60 hover:opacity-100"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="h-5 w-px bg-border-color mx-1 hidden sm:block"></div>

            {/* Auth/CTAs */}
            {mounted && session ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-stone-700 to-stone-800 flex items-center justify-center border border-border-color text-white font-bold text-sm">
                    {session.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-foreground hidden md:block max-w-[100px] truncate">
                    {session.name}
                  </span>
                </div>
                
                {session.type === 'master' && (
                  <Link 
                    href="/master-dashboard"
                    className="text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Kabinet
                  </Link>
                )}
                {session.type === 'admin' && (
                  <Link 
                    href="/super-admin"
                    className="text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                  title="Chiqish"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="hidden sm:block text-sm font-semibold text-foreground opacity-80 hover:opacity-100 transition-opacity"
                >
                  {t.navbar.login}
                </button>
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  {t.navbar.joinAsMaster}
                </button>
              </>
            )}
            
          </div>
        </div>
      </header>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <AiModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </>
  );
}
