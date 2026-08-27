"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Lock, User, Mail, ChevronRight } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'client' | 'master'>('client');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-surface border border-border-color p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md relative pointer-events-auto overflow-hidden"
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-hover text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Tabs */}
              <div className="flex bg-surface-hover p-1 rounded-2xl mb-8 border border-border-color">
                <button 
                  onClick={() => setTab('client')}
                  className={cn(
                    "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
                    tab === 'client' ? "bg-surface text-foreground shadow-sm border border-border-color" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.auth.clientTab}
                </button>
                <button 
                  onClick={() => setTab('master')}
                  className={cn(
                    "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
                    tab === 'master' ? "bg-surface text-foreground shadow-sm border border-border-color" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.auth.masterTab}
                </button>
              </div>

              {tab === 'client' ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">{t.auth.clientTitle}</h2>
                    <p className="text-sm text-muted-foreground">{t.auth.clientDesc}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-muted-foreground opacity-50" />
                      </div>
                      <input type="text" placeholder={t.auth.namePlaceholder} className="w-full bg-background border border-border-color text-foreground rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder-muted-foreground/50" />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="w-5 h-5 text-muted-foreground opacity-50" />
                      </div>
                      <input type="tel" placeholder={t.auth.phonePlaceholder} className="w-full bg-background border border-border-color text-foreground rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder-muted-foreground/50" />
                    </div>
                    <button 
                      onClick={onClose}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                    >
                      {t.auth.loginBtn}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">{t.auth.masterTitle}</h2>
                    <p className="text-sm text-muted-foreground">{t.auth.masterDesc}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-muted-foreground opacity-50" />
                      </div>
                      <input type="text" placeholder={t.auth.emailPlaceholder} className="w-full bg-background border border-border-color text-foreground rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder-muted-foreground/50" />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-muted-foreground opacity-50" />
                      </div>
                      <input type="password" placeholder={t.auth.passwordPlaceholder} className="w-full bg-background border border-border-color text-foreground rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder-muted-foreground/50" />
                    </div>
                    <button 
                      onClick={onClose}
                      className="w-full bg-surface-hover hover:bg-slate-200 dark:hover:bg-slate-800 border border-border-color text-foreground font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      {t.auth.masterLoginBtn} <ChevronRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={onClose}
                      className="w-full text-center text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 py-2"
                    >
                      {t.auth.registerLink}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
