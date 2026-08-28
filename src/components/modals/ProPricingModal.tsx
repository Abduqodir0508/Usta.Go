"use client";

import React from "react";
import { XCircle, CheckCircle2, Shield, Zap } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface ProPricingModalProps {
  onClose: () => void;
  onSuccess: (plan: string) => void;
  masterData: any;
}

export default function ProPricingModal({ onClose, onSuccess, masterData }: ProPricingModalProps) {
  const { t } = useLanguage();

  const handleSelectPlan = (name: string) => {
    // Navigate directly to telegram bot
    const botUrl = `https://t.me/UstaGo_pro_bot?start=pay_${encodeURIComponent(name)}_${masterData?.id || "unknown"}`;
    window.open(botUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 border border-stone-800/80 rounded-3xl w-full max-w-4xl p-6 md:p-8 shadow-2xl relative my-8">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors bg-zinc-900 rounded-full p-2"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <div className="text-center mb-10 mt-4">
          <div className="inline-flex items-center justify-center p-3 bg-orange-500/10 rounded-2xl mb-4 text-orange-500 border border-orange-500/20">
            <Zap className="w-8 h-8 fill-orange-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">UstaGo PRO Tariflari</h2>
          <p className="text-stone-400 max-w-lg mx-auto">
            Mijozlarga professional ekanligingizni ko'rsating va ko'proq buyurtmalar oling.
            Hozircha barcha tariflar <span className="text-orange-500 font-bold">BEPUL (Test rejimida)</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* 1-Karta (Oylik PRO) */}
          <div className="bg-zinc-900/50 border border-orange-500/30 rounded-3xl p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <div className="mb-6">
              <span className="bg-orange-500/20 text-orange-500 text-xs font-bold px-3 py-1 rounded-full border border-orange-500/20 uppercase tracking-wider">
                Ommabop
              </span>
              <h3 className="text-2xl font-bold text-white mt-4 mb-2">{t.proPricing?.monthlyPlan || "1 Oylik PRO"}</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-extrabold text-white">1 000 UZS</span>
                <span className="text-stone-400 font-medium mb-1 line-through">77 000 UZS</span>
              </div>
              <p className="text-sm font-bold text-orange-500 mb-1">{t.proPricing?.testPrice} 1 000 UZS</p>
              <p className="text-sm text-stone-400">{t.proPricing?.monthlyDesc}</p>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-stone-300 text-sm">{t.proPricing?.feature2}</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-stone-300 text-sm">{t.proPricing?.feature1}</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-stone-300 text-sm">{t.proPricing?.feature3}</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-stone-300 text-sm">Profil ranglari va fonini moslashtirish</span>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan("1_oylik")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
            >
              {t.proPricing?.buyPro || "PRO ga ulanish"}
            </button>
          </div>

          {/* 2-Karta (Uzoq muddatli) */}
          <div className="bg-zinc-900 border border-stone-800 rounded-3xl p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Uzoq muddatli paketlar</h3>
              <p className="text-sm text-stone-400">Tejang va doimiy mijozlarga ega bo'ling.</p>
            </div>
            <div className="space-y-4 mb-8 flex-1">
              {/* 3 Oylik */}
              <div className="bg-zinc-950 border border-stone-800 rounded-2xl p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 hover:border-stone-700 transition-colors">
                <div>
                  <h4 className="font-bold text-white text-lg">{t.proPricing?.threeMonthPlan} <span className="text-orange-500 text-sm xl:ml-1 block xl:inline">{t.proPricing?.threeMonthBadge}</span></h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white font-bold">1 000 UZS</span>
                    <span className="text-stone-500 text-sm line-through">300 000 UZS</span>
                  </div>
                  <p className="text-xs font-bold text-orange-500 mt-1">{t.proPricing?.testPrice} 1 000 UZS</p>
                </div>
                <button
                  onClick={() => handleSelectPlan("3_oylik")}
                  className="bg-stone-800 hover:bg-stone-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors w-full xl:w-auto"
                >
                  {t.proPricing?.getPro || "Xarid qilish"}
                </button>
              </div>
              {/* 6 Oylik */}
              <div className="bg-zinc-950 border border-stone-800 rounded-2xl p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 hover:border-stone-700 transition-colors">
                <div>
                  <h4 className="font-bold text-white text-lg">{t.proPricing?.sixMonthPlan} <span className="text-orange-500 text-sm xl:ml-1 block xl:inline">{t.proPricing?.sixMonthBadge}</span></h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white font-bold">1 000 UZS</span>
                    <span className="text-stone-500 text-sm line-through">520 000 UZS</span>
                  </div>
                  <p className="text-xs font-bold text-orange-500 mt-1">{t.proPricing?.testPrice} 1 000 UZS</p>
                </div>
                <button
                  onClick={() => handleSelectPlan("6_oylik")}
                  className="bg-stone-800 hover:bg-stone-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors w-full xl:w-auto"
                >
                  {t.proPricing?.getPro || "Xarid qilish"}
                </button>
              </div>
              {/* Umrbod */}
              <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 hover:border-orange-500/40 transition-colors relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/20 blur-2xl rounded-full"></div>
                <div className="relative z-10">
                  <h4 className="font-bold text-white text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-500 shrink-0" /> {t.proPricing?.lifetimePlan}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white font-bold">1 000 UZS</span>
                    <span className="text-stone-500 text-sm line-through">1 490 000 UZS</span>
                  </div>
                  <p className="text-xs font-bold text-orange-500 mt-1">{t.proPricing?.testPrice} 1 000 UZS</p>
                </div>
                <button
                  onClick={() => handleSelectPlan("lifetime")}
                  className="relative z-10 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors shadow-lg shadow-orange-500/20 w-full xl:w-auto"
                >
                  {t.proPricing?.getPro || "Xarid qilish"}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
