"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Wrench, Globe, CheckCircle2, User, LogOut, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Language } from "@/lib/dictionary";
import { AuthModal } from "@/components/modals/AuthModal";
import { AiModal } from "@/components/modals/AiModal";
import { ProSuccessModal } from "@/components/modals/ProSuccessModal";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useAuth } from "@/hooks/useAuth";

const LANGUAGES: Language[] = ["UZ", "RU", "EN"];

export function TopNavbar() {
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isProSuccessOpen, setIsProSuccessOpen] = useState(false);

  const { user } = useAuth();
  const [session, setSession] = useState<{ type: 'client' | 'master' | 'admin', name: string, id?: string, is_pro?: boolean } | null>(null);

  useEffect(() => {
    if (user) {
      setSession({ type: 'master', name: user.name, id: String(user.id), is_pro: !!user.is_pro });

      // Check if user is PRO and show_congrats_modal is true or not celebrated in localStorage
      if (user.is_pro) {
        const celebrated = localStorage.getItem(`pro_celebrated_${user.id}`);
        if (user.show_congrats_modal === true || (!celebrated && user.pro_modal_shown !== true)) {
          setIsProSuccessOpen(true);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    const checkSession = () => {
      const isSuperAdmin = window.location.pathname === "/super-admin";
      if (isSuperAdmin) {
        setSession({ type: 'admin', name: "Super Admin", is_pro: true });
        return;
      }
      
      const master = localStorage.getItem("usta_current_master");
      if (master) {
        const m = JSON.parse(master);
        setSession({ type: 'master', name: m.name, id: m.id, is_pro: m.is_pro });
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
        isScrolled ? "glass shadow-sm py-2.5 md:py-3" : "bg-transparent py-2.5 md:py-5"
      )}>
        <div className="max-w-7xl mx-auto px-3 md:px-8 flex items-center justify-between gap-1.5 md:gap-0">
          
          {/* Brand */}
          <Link href="/" className="flex items-center gap-1.5 md:gap-2 group">
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/20 transition-all">
              <Wrench className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight text-foreground">
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
            <Link href="/reyting" className="text-sm font-semibold text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span>Reyting</span>
            </Link>
            <Link href="/qanday-ishlaydi" className="text-sm font-medium text-foreground opacity-70 hover:opacity-100 transition-opacity">
              {t.navbar.faq}
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 md:gap-4">

            {/* Mobile AI Button */}
            <button 
              onClick={() => setIsAiOpen(true)}
              className="md:hidden flex w-8 h-8 rounded-full bg-[#1c1c1e] text-[#ff6b00] items-center justify-center text-[11px] font-extrabold"
            >
              AI
            </button>

            {/* Mobile Language Switcher */}
            <div className="md:hidden flex items-center">
              <select 
                className="rounded-full bg-[#1c1c1e] text-gray-200 text-xs px-2 py-1.5 outline-none appearance-none font-medium cursor-pointer"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>
                    {lang === "UZ" ? "🇺🇿 UZ" : lang === "RU" ? "🇷🇺 RU" : "🇬🇧 EN"}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switcher */}
            <div className="hidden md:flex items-center gap-1 border border-border-color rounded-full p-1 bg-surface">
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

            <div className="h-5 w-px bg-border-color mx-1 hidden md:block"></div>

            {/* Auth/CTAs */}
            {mounted && session ? (
              <div className="flex items-center gap-2 md:gap-3">
                <Link
                  href={session.type === 'master' ? "/master-dashboard" : "/katalog"}
                  className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 rounded-full hover:bg-orange-500/20 transition-all cursor-pointer"
                >
                  {/* Avatar / Bosh harf */}
                  <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {session.name?.[0] || 'U'}
                  </span>

                  {/* Ism */}
                  <span className="text-orange-500 text-xs font-medium max-w-[80px] sm:max-w-[120px] truncate">
                    {session.name}
                  </span>

                  {/* PRO Verified Badge */}
                  {session.is_pro && (
                    <VerifiedBadge className="w-3.5 h-3.5" />
                  )}
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-colors font-medium text-xs"
                  title={t.dashboard?.logout || "Chiqish"}
                >
                  <span className="hidden sm:inline">{t.dashboard?.logout || "Chiqish"}</span>
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="hidden md:block text-sm font-semibold text-foreground opacity-80 hover:opacity-100 transition-opacity"
                >
                  {t.navbar.login}
                </button>
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="hidden md:block bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  {t.navbar.joinAsMaster}
                </button>
                {/* Mobile Login Button */}
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="md:hidden bg-gradient-to-r from-amber-500 to-orange-600 text-xs px-3 py-1.5 rounded-full text-white font-semibold flex items-center justify-center whitespace-nowrap shadow-md"
                >
                  🚪 Kirish
                </button>
              </>
            )}
            
          </div>
        </div>
      </header>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <AiModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      <ProSuccessModal 
        isOpen={isProSuccessOpen} 
        onClose={() => setIsProSuccessOpen(false)} 
        user={user}
      />
    </>
  );
}
