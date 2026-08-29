"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, MessageSquare, Bot } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import { supabase } from "@/lib/supabase";
import { AvatarImage } from "@/components/ui/AvatarImage";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

export function AiModal({ isOpen, onClose }: AiModalProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string, masters?: any[]}[]>([
    { role: 'ai', content: t.aiChat.greeting }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update greeting when language changes, only if no messages sent yet
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'ai') {
      setMessages([{ role: 'ai', content: t.aiChat.greeting }]);
    }
  }, [t.aiChat.greeting]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const queryLower = userMsg.toLowerCase();
      
      // Category filter
      let categoryFilter = "";
      if (queryLower.includes("mebel") || queryLower.includes("shkaf") || queryLower.includes("stol") || queryLower.includes("krovat") || queryLower.includes("stul")) {
        categoryFilter = "mebel";
      } else if (queryLower.includes("santexnik") || queryLower.includes("jo'mrak") || queryLower.includes("jomrak") || queryLower.includes("truba") || queryLower.includes("kran") || queryLower.includes("unitaz") || queryLower.includes("vanna")) {
        categoryFilter = "santexnik";
      } else if (queryLower.includes("elektr") || queryLower.includes("rozetka") || queryLower.includes("sim") || queryLower.includes("lampa") || queryLower.includes("lyustra") || queryLower.includes("shit")) {
        categoryFilter = "elektr";
      } else if (queryLower.includes("remont") || queryLower.includes("bo'yoq") || queryLower.includes("pobelka") || queryLower.includes("oboy") || queryLower.includes("kafel") || queryLower.includes("plitka")) {
        categoryFilter = "remont";
      } else if (queryLower.includes("gruzchik") || queryLower.includes("yuk") || queryLower.includes("tashish") || queryLower.includes("mashina")) {
        categoryFilter = "gruzchik";
      }

      // City / Region filter
      const cities = ["toshkent", "samarqand", "buxoro", "andijon", "farg'ona", "namangan", "qashqadaryo", "surxondaryo", "xorazm", "navoiy", "jizzax", "sirdaryo", "qoraqalpog'iston"];
      let detectedCity = "";
      for (const city of cities) {
        if (queryLower.includes(city)) {
          detectedCity = city;
          break;
        }
      }

      let queryBuilder = supabase.from('ustalar').select('*').eq('is_banned', false);

      if (categoryFilter) {
        queryBuilder = queryBuilder.ilike('category', `%${categoryFilter}%`);
      }
      
      if (detectedCity) {
        queryBuilder = queryBuilder.or(`address.ilike.%${detectedCity}%,bio.ilike.%${detectedCity}%`);
      }

      if (!categoryFilter && !detectedCity) {
        queryBuilder = queryBuilder.or(`name.ilike.%${userMsg}%,category.ilike.%${userMsg}%,address.ilike.%${userMsg}%`);
      }

      const { data: foundMasters, error } = await queryBuilder.order('is_pro', { ascending: false }).order('rating', { ascending: false }).limit(4);

      setIsTyping(false);

      if (foundMasters && foundMasters.length > 0) {
        const formatted = foundMasters.map((m: any) => ({
          id: m.id.toString(),
          name: m.name,
          category: m.category,
          rating: m.rating || 5.0,
          price: m.price ? parseInt(m.price) : 50000,
          image: m.avatar_url || null,
          phone: m.phone,
          is_pro: m.is_pro,
          address: m.address || "Toshkent"
        }));

        const cityText = detectedCity ? ` (${detectedCity.charAt(0).toUpperCase() + detectedCity.slice(1)} bo'yicha)` : "";
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: `${t.aiShowcase?.aiMessage || "Sizning so'rovingizga mos eng yaxshi ustalarni topdim"}${cityText}:`,
          masters: formatted
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: "Kechirasiz, ushbu yo'nalish yoki shahar bo'yicha mos ustalar topilmadi. Katalog sahifasidan barcha ustalarni ko'rishingiz mumkin."
        }]);
      }
    } catch (err) {
      console.error("AI Search Error:", err);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Qidirishda xatolik yuz berdi. Iltimos qayta urinib ko'ring."
      }]);
    }
  };

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
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-4 md:p-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-surface border border-border-color rounded-3xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col relative pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-border-color flex items-center justify-between bg-surface/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">{t.aiChat.title}</h2>
                    <p className="text-xs text-green-500 font-medium">{t.aiChat.status}</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-hover text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-[85%] rounded-2xl p-4 text-sm whitespace-pre-line",
                      msg.role === 'user' 
                        ? "bg-amber-500 text-white rounded-tr-sm" 
                        : "bg-surface-hover text-foreground border border-border-color rounded-tl-sm"
                    )}>
                      {msg.content}
                      
                      {/* Master Cards Rendering for AI */}
                      {msg.masters && (
                        <div className="mt-4 space-y-3">
                          {msg.masters.map(master => (
                            <div key={master.id} className="bg-surface border border-border-color rounded-xl p-3 flex gap-3 items-center">
                              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <AvatarImage src={master.image} alt={master.name} fill className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-foreground text-sm truncate flex items-center gap-1">
                                  {master.name}
                                  {master.is_pro && (
                                    <>
                                      <VerifiedBadge className="w-4 h-4" />
                                      <span className="text-[10px] bg-orange-500/20 text-orange-500 font-bold px-1.5 py-0.5 rounded">PRO</span>
                                    </>
                                  )}
                                </h4>
                                <p className="text-xs text-muted-foreground">⭐ {master.rating} • {master.category}</p>
                                <p className="text-amber-500 font-bold text-xs mt-0.5">{master.price.toLocaleString()} so'm</p>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <Link href={`/usta/${master.id}`} onClick={onClose} className="px-3 py-1.5 text-[10px] font-bold bg-amber-500/10 text-amber-500 rounded-lg text-center hover:bg-amber-500/20 transition-colors">
                                  {t.aiChat?.profileBtn || "Profil"}
                                </Link>
                                <a href={`tel:${master.phone}`} className="px-3 py-1.5 text-[10px] font-bold bg-amber-500 text-white rounded-lg text-center shadow-md hover:bg-amber-600 transition-colors">
                                  {t.aiChat?.contactBtn || "Bog'lanish"}
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-surface-hover border border-border-color rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-150" />
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border-color bg-background">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t.aiChat.placeholder}
                    className="w-full bg-surface border border-border-color text-foreground rounded-full pl-4 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder-muted-foreground text-sm"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 w-10 h-10 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
