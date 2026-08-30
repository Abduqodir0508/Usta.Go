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
    const targetId = masterData?.id || "unknown";
    const botUrl = `https://t.me/UstaGo_pro_bot?start=pay:${encodeURIComponent(name)}:${targetId}`;
    window.open(botUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-start sm:items-center justify-center p-3 sm:p-6 backdrop-blur-sm overflow-y-auto max-h-screen pt-12 sm:pt-6 pb-6">
      <div className="bg-zinc-950 border border-stone-800/80 rounded-2xl sm:rounded-3xl w-full max-w-4xl p-4 sm:p-6 md:p-8 shadow-2xl relative my-auto max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-stone-500 hover:text-white transition-colors bg-zinc-900 rounded-full p-1.5 sm:p-2 z-20"
        >
          <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="text-center mb-6 sm:mb-10 mt-2 sm:mt-4">
          <div className="inline-flex items-center justify-center p-2.5 sm:p-3 bg-orange-500/10 rounded-2xl mb-3 sm:mb-4 text-orange-500 border border-orange-500/20">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 fill-orange-500" />
          </div>
          <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">UstaGo PRO Tariflari</h2>
          <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto leading-relaxed">
            Mijozlarga professional ekanligingizni ko'rsating va ko'proq buyurtmalar oling.
            Hozircha barcha tariflar <span className="text-orange-500 font-bold">BEPUL (Test rejimida)</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          {/* 1-Karta (Oylik PRO) */}
          <div className="bg-zinc-900/50 border border-orange-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <div className="mb-4 sm:mb-6">
              <span className="bg-orange-500/20 text-orange-500 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 sm:py-1 rounded-full border border-orange-500/20 uppercase tracking-wider">
                Ommabop Choice
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-white mt-3 mb-1 sm:mb-2">{t.proPricing?.monthlyPlan || "1 Oylik PRO"}</h3>
              <div className="flex items-end gap-2 mb-1 sm:mb-2">
                <span className="text-2xl sm:text-4xl font-extrabold text-white">1 000 UZS</span>
                <span className="text-stone-400 text-xs sm:text-sm font-medium mb-1 line-through">77 000 UZS</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-orange-500 mb-1">{t.proPricing?.testPrice} 1 000 UZS</p>
              <p className="text-xs sm:text-sm text-stone-400">{t.proPricing?.monthlyDesc}</p>
            </div>

            {/* 7 ta Afzalliklar Ro'yxati */}
            <div className="space-y-2.5 sm:space-y-3.5 mb-6 sm:mb-8 flex-1">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-stone-200 text-xs sm:text-sm font-medium">Profil yonida rasmiy ko'k galochka (Ishonch belgisi)</span>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-stone-200 text-xs sm:text-sm font-medium">15 tagacha portfolio rasmlari yuklash (Oddiy ustalarda faqat 5 ta)</span>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-stone-200 text-xs sm:text-sm font-medium">Katalog va qidiruv natijalarida doim TOP (1-o'rinlarda) turish</span>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-stone-200 text-xs sm:text-sm font-medium">AI Maslahatchi qidiruvida mijozlarga birinchi bo'lib tavsiya etilish</span>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-stone-200 text-xs sm:text-sm font-medium">Profil banneri va fon ranglarini erkin moslashtirish</span>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-stone-200 text-xs sm:text-sm font-medium">To'g'ridan-to'g'ri Telegram va telefon orqali tezkor buyurtmalar oqimi</span>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-stone-200 text-xs sm:text-sm font-medium">Alohida "Reyting" sahifasida VIP ko'rinish va yuqori o'rinlar</span>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan("1_oylik")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-xl transition-all shadow-lg shadow-orange-500/20 text-sm sm:text-base cursor-pointer"
            >
              {t.proPricing?.buyPro || "PRO ga ulanish"}
            </button>
          </div>

          {/* 2-Karta (Uzoq muddatli) */}
          <div className="bg-zinc-900 border border-stone-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">Uzoq muddatli paketlar</h3>
                <p className="text-xs sm:text-sm text-stone-400">Tejang va doimiy mijozlarga ega bo'ling.</p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4">
                {/* 3 Oylik */}
                <div className="bg-zinc-950 border border-stone-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 hover:border-stone-700 transition-colors">
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-lg">{t.proPricing?.threeMonthPlan} <span className="text-orange-500 text-xs sm:text-sm xl:ml-1 block xl:inline">{t.proPricing?.threeMonthBadge}</span></h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white text-xs sm:text-base font-bold">1 000 UZS</span>
                      <span className="text-stone-500 text-xs sm:text-sm line-through">300 000 UZS</span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-bold text-orange-500 mt-0.5">{t.proPricing?.testPrice} 1 000 UZS</p>
                  </div>
                  <button
                    onClick={() => handleSelectPlan("3_oylik")}
                    className="bg-stone-800 hover:bg-stone-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm transition-colors w-full sm:w-auto cursor-pointer"
                  >
                    {t.proPricing?.getPro || "Xarid qilish"}
                  </button>
                </div>

                {/* 6 Oylik */}
                <div className="bg-zinc-950 border border-stone-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 hover:border-stone-700 transition-colors">
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-lg">{t.proPricing?.sixMonthPlan} <span className="text-orange-500 text-xs sm:text-sm xl:ml-1 block xl:inline">{t.proPricing?.sixMonthBadge}</span></h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white text-xs sm:text-base font-bold">1 000 UZS</span>
                      <span className="text-stone-500 text-xs sm:text-sm line-through">520 000 UZS</span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-bold text-orange-500 mt-0.5">{t.proPricing?.testPrice} 1 000 UZS</p>
                  </div>
                  <button
                    onClick={() => handleSelectPlan("6_oylik")}
                    className="bg-stone-800 hover:bg-stone-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm transition-colors w-full sm:w-auto cursor-pointer"
                  >
                    {t.proPricing?.getPro || "Xarid qilish"}
                  </button>
                </div>

                {/* Umrbod */}
                <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 hover:border-orange-500/40 transition-colors relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/20 blur-2xl rounded-full"></div>
                  <div className="relative z-10">
                    <h4 className="font-bold text-white text-sm sm:text-lg flex items-center gap-1.5 sm:gap-2">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 shrink-0" /> {t.proPricing?.lifetimePlan}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white text-xs sm:text-base font-bold">1 000 UZS</span>
                      <span className="text-stone-500 text-xs sm:text-sm line-through">1 490 000 UZS</span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-bold text-orange-500 mt-0.5">{t.proPricing?.testPrice} 1 000 UZS</p>
                  </div>
                  <button
                    onClick={() => handleSelectPlan("lifetime")}
                    className="relative z-10 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm transition-colors shadow-lg shadow-orange-500/20 w-full sm:w-auto cursor-pointer"
                  >
                    {t.proPricing?.getPro || "Xarid qilish"}
                  </button>
                </div>
              </div>
            </div>

            {/* Note at bottom of long term packages */}
            <div className="mt-4 pt-3 border-t border-stone-800/80 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                ✨ Barcha PRO imkoniyatlari + Bonus oylar
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
