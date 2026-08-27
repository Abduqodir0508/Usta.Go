"use client";

import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function AiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <>
      {/* Floating Action Button for Mobile / Desktop Bottom Right */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50",
          "w-14 h-14 bg-[#EA580C] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#c2410c] transition-colors",
          isOpen && "hidden"
        )}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Drawer/Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed z-50 flex flex-col bg-white shadow-2xl overflow-hidden border border-slate-200",
              "bottom-0 left-0 right-0 top-0 md:top-auto md:left-auto md:bottom-8 md:right-8 md:w-96 md:h-[600px] md:rounded-2xl"
            )}
          >
            {/* Header */}
            <div className="bg-[#1E40AF] px-4 py-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">UstaGo AI Maslahatchisi</h3>
                  <p className="text-xs text-blue-200">Onlayn</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1E40AF] flex-shrink-0 flex items-center justify-center text-white text-sm">
                  AI
                </div>
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700">
                  Assalomu alaykum! Sizga qanday usta kerak? Muammoingizni yozing, men sizga eng yaxshi mutaxassislarni topib beraman.
                </div>
              </div>
              {/* Messages will go here */}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2">
                <input
                  type="text"
                  placeholder="Muammoni yozing (masalan, kran oqyapti)..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setQuery("")}
                />
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#EA580C] text-white hover:bg-[#c2410c] transition-colors"
                  onClick={() => setQuery("")}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
