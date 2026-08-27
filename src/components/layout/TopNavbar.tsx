"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon, Wrench, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Language } from "@/lib/dictionary";
import { AuthModal } from "@/components/modals/AuthModal";
import { AiModal } from "@/components/modals/AiModal";

const LANGUAGES: Language[] = ["UZ", "RU", "EN"];

export function TopNavbar() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            <Link href="#faq" className="text-sm font-medium text-foreground opacity-70 hover:opacity-100 transition-opacity">
              {t.navbar.faq}
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-border-color hover:bg-surface-hover text-foreground transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

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
            
          </div>
        </div>
      </header>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <AiModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </>
  );
}
