"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { supabase } from "@/lib/supabase";

interface ProSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function ProSuccessModal({ isOpen, onClose, user }: ProSuccessModalProps) {
  if (!isOpen || !user) return null;

  // Calculate plan details
  const plan = user.pro_plan || "1_month";
  let monthsText = "1 oylik";
  if (plan === "3_months" || plan === "3m") monthsText = "3 oylik (+1 oy bonus)";
  else if (plan === "6_months" || plan === "6m") monthsText = "6 oylik (+2 oy bonus)";
  else if (plan === "lifetime" || plan === "life") monthsText = "Umrbod (Lifetime)";

  let remainingDays = 30;
  if (user.pro_expires_at) {
    if (user.pro_expires_at.startsWith("2099")) {
      remainingDays = 36500;
    } else {
      const diff = new Date(user.pro_expires_at).getTime() - new Date().getTime();
      remainingDays = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
  }

  const handleDismiss = async () => {
    try {
      if (user?.id) {
        localStorage.setItem(`pro_celebrated_${user.id}`, "true");
        const updateObj = { show_congrats_modal: false, pro_modal_shown: true };
        
        try {
          await supabase.from("ustalar").update(updateObj).eq("id", user.id);
        } catch (e) {}
        try {
          await supabase.from("profiles").update(updateObj).eq("id", user.id);
        } catch (e) {}
        try {
          await supabase.from("users").update(updateObj).eq("id", user.id);
        } catch (e) {}
      }
    } catch (e) {
      console.error("Pro modal update error:", e);
    } finally {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center relative overflow-hidden shadow-2xl"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Badge icon */}
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20 mb-6 border border-amber-400/40 relative">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
            <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-1 border-2 border-zinc-950">
              <VerifiedBadge className="w-5 h-5 text-white" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
            🎉 Tabriklaymiz, siz PRO versiyani muvaffaqiyatli faollashtirdingiz!
          </h2>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 my-5 text-left space-y-2 text-sm">
            <p className="text-zinc-200">
              Siz tanlagan tarif <span className="font-bold text-amber-400">({monthsText})</span> faollashtirildi.
            </p>
            <p className="text-zinc-300">
              Obuna muddati:{" "}
              <span className="font-bold text-emerald-400">
                {user.pro_expires_at && user.pro_expires_at.startsWith("2099")
                  ? "Cheksiz (Umrbod)"
                  : `${remainingDays} kundan keyin`}
              </span>{" "}
              tugaydi.
            </p>
            <div className="pt-2 border-t border-zinc-800 text-xs text-stone-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Tugashiga 5 kun qolganida sizga Telegram bot orqali avtomatik eslatma yuboramiz.
              </span>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-extrabold text-base shadow-xl shadow-amber-500/25 transition-all transform active:scale-95 flex items-center justify-center space-x-2 border border-amber-300/40 cursor-pointer"
          >
            <span>Tushundim / Saytga o'tish</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
