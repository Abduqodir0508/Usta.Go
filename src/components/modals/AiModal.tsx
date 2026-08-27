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

const MOCK_AI_RESPONSE = {
  masters: [
    { id: "1", name: "Alisher Usta", rating: 4.9, time: "15 daq", price: 50000, image: "https://i.pravatar.cc/150?u=alisher" },
    { id: "4", name: "Dilshod Santexnik", rating: 4.7, time: "30 daq", price: 40000, image: "https://i.pravatar.cc/150?u=dilshod" }
  ]
};

export function AiModal({ isOpen, onClose }: AiModalProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string, masters?: typeof MOCK_AI_RESPONSE.masters}[]>([
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

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking and responding with mock data
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: t.aiShowcase.aiMessage,
        masters: MOCK_AI_RESPONSE.masters
      }]);
    }, 1500);
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
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <Image src={master.image} alt={master.name} fill className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-foreground text-sm truncate">{master.name}</h4>
                                <p className="text-xs text-muted-foreground">⭐ {master.rating} • {master.time}</p>
                                <p className="text-amber-500 font-bold text-xs mt-0.5">{master.price.toLocaleString()} so'm</p>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Link href={`/usta/${master.id}`} onClick={onClose} className="px-3 py-1.5 text-[10px] font-bold bg-amber-500/10 text-amber-500 rounded-lg text-center hover:bg-amber-500/20 transition-colors">
                                  {t.aiChat.profileBtn}
                                </Link>
                                <button className="px-3 py-1.5 text-[10px] font-bold bg-amber-500 text-white rounded-lg text-center shadow-md hover:bg-amber-600 transition-colors">
                                  {t.aiChat.contactBtn}
                                </button>
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
