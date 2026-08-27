"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Lock, User, Mail, ChevronRight, Send } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [tab, setTab] = useState<'client' | 'master'>('client');
  const [showRegInfo, setShowRegInfo] = useState(false);

  // Form states
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [masterLogin, setMasterLogin] = useState("");
  const [masterPassword, setMasterPassword] = useState("");

  const handleClientLogin = () => {
    if (clientName.toLowerCase() === "admin" && clientPhone.toLowerCase() === "admin") {
      onClose();
      router.push("/super-admin");
      return;
    }
    
    // Normal client login
    if (clientName && clientPhone) {
      localStorage.setItem("usta_client", JSON.stringify({ name: clientName, phone: clientPhone }));
    }
    onClose();
  };

  const handleMasterLogin = () => {
    if (masterLogin && masterPassword) {
      onClose();
      router.push("/master-dashboard");
    }
  };

  const resetAndClose = () => {
    setShowRegInfo(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#1A1614] border border-stone-800 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md relative pointer-events-auto overflow-hidden"
            >
              <button 
                onClick={resetAndClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#231F1C] text-white hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {showRegInfo ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6 text-center pt-4"
                >
                  <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                    <User className="w-8 h-8 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Ustalar safiga qo'shiling</h2>
                  <p className="text-sm text-stone-400 leading-relaxed mb-6">
                    Platformaga usta sifatida qo'shilish uchun administratorga murojaat qiling. Profilingiz to'liq sozlab beriladi.
                  </p>
                  
                  <a 
                    href="https://t.me/admin" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Telegram orqali adminga yozish
                  </a>
                  
                  <button 
                    onClick={() => setShowRegInfo(false)}
                    className="w-full text-sm font-medium text-stone-500 hover:text-white py-2"
                  >
                    Ortga qaytish
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Tabs */}
                  <div className="flex bg-[#231F1C] p-1 rounded-2xl mb-8 border border-stone-800">
                    <button 
                      onClick={() => setTab('client')}
                      className={cn(
                        "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
                        tab === 'client' ? "bg-[#1A1614] text-white shadow-sm border border-stone-800" : "text-stone-500 hover:text-white"
                      )}
                    >
                      {t.auth.clientTab}
                    </button>
                    <button 
                      onClick={() => setTab('master')}
                      className={cn(
                        "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
                        tab === 'master' ? "bg-[#1A1614] text-white shadow-sm border border-stone-800" : "text-stone-500 hover:text-white"
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
                        <h2 className="text-2xl font-bold text-white mb-2">{t.auth.clientTitle}</h2>
                        <p className="text-sm text-stone-400">{t.auth.clientDesc}</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="w-5 h-5 text-stone-500" />
                          </div>
                          <input 
                            type="text" 
                            placeholder={t.auth.namePlaceholder} 
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="w-full bg-[#181513] border border-stone-700/80 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder-stone-500" 
                          />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="w-5 h-5 text-stone-500" />
                          </div>
                          <input 
                            type="tel" 
                            placeholder={t.auth.phonePlaceholder} 
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            className="w-full bg-[#181513] border border-stone-700/80 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder-stone-500" 
                          />
                        </div>
                        <button 
                          onClick={handleClientLogin}
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
                        <h2 className="text-2xl font-bold text-white mb-2">{t.auth.masterTitle}</h2>
                        <p className="text-sm text-stone-400">{t.auth.masterDesc}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="w-5 h-5 text-stone-500" />
                          </div>
                          <input 
                            type="text" 
                            placeholder="Login yoki Telefon raqam"
                            value={masterLogin}
                            onChange={(e) => setMasterLogin(e.target.value)}
                            className="w-full bg-[#181513] border border-stone-700/80 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder-stone-500" 
                          />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="w-5 h-5 text-stone-500" />
                          </div>
                          <input 
                            type="password" 
                            placeholder={t.auth.passwordPlaceholder} 
                            value={masterPassword}
                            onChange={(e) => setMasterPassword(e.target.value)}
                            className="w-full bg-[#181513] border border-stone-700/80 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder-stone-500" 
                          />
                        </div>
                        <button 
                          onClick={handleMasterLogin}
                          className="w-full bg-[#231F1C] hover:bg-stone-800 border border-stone-800 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                          Usta kabinetiga kirish <ChevronRight className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowRegInfo(true)}
                          className="w-full text-center text-sm font-medium text-amber-500 hover:text-amber-400 py-2"
                        >
                          {t.auth.registerLink}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
