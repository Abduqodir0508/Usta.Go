"use client";

import React, { useState } from "react";
import { XCircle, CheckCircle2, Shield, Zap, Image as ImageIcon, Copy, CreditCard, Loader2 } from "lucide-react";

interface ProPricingModalProps {
  onClose: () => void;
  onSuccess: (plan: string) => void;
  masterData: any;
}

// Telegram Bot configs
const TELEGRAM_BOT_TOKEN = "8845833064:AAHB1nASi0Cwq8rZUQhvor008OX6dtQA4as";
const ADMIN_CHAT_ID = "2067464475";
const ADMIN_CARD = "8600 1234 5678 9012";

type CheckoutStep = "pricing" | "checkout" | "success";

export default function ProPricingModal({ onClose, onSuccess, masterData }: ProPricingModalProps) {
  const [step, setStep] = useState<CheckoutStep>("pricing");
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);
  
  // Checkout form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPlan = (name: string, price: string) => {
    setSelectedPlan({ name, price });
    setStep("checkout");
  };

  const handleCopyCard = () => {
    navigator.clipboard.writeText(ADMIN_CARD.replace(/\s/g, ''));
    alert("Karta raqami nusxalandi!");
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    
    try {
      const message = `
💳 <b>YANGI TEST TO'LOV (1 000 UZS):</b>
👤 <b>Usta:</b> ${masterData?.name || "Noma'lum"}
📞 <b>Telefon:</b> ${masterData?.phone || "Yo'q"}
📦 <b>Tanlangan paket:</b> ${selectedPlan.name}
💰 <b>To'langan summa:</b> 1 000 UZS
💳 <b>Usta kartasi:</b> ${cardNumber}
⏳ <b>Holat:</b> To'lov tekshirilmoqda
📅 <b>Sana:</b> ${new Date().toLocaleString('uz-UZ')}
      `.trim();

      if (TELEGRAM_BOT_TOKEN) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            text: message,
            parse_mode: "HTML",
          }),
        });
      }

      // Simulate 2 seconds loading
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setStep("success");
      
      // Delay closing modal and updating state
      setTimeout(() => {
        onSuccess(selectedPlan.name);
      }, 3000);
      
    } catch (error) {
      console.error("Payment flow error:", error);
      // Even on error, in test mode, we proceed
      setStep("success");
      setTimeout(() => {
        onSuccess(selectedPlan.name);
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Card number formatter (16 digits with spaces)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Expiry date formatter (MM/YY)
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 border border-stone-800/80 rounded-3xl w-full max-w-4xl p-6 md:p-8 shadow-2xl relative my-8">
        
        {step !== "success" && (
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors bg-zinc-900 rounded-full p-2 disabled:opacity-50"
          >
            <XCircle className="w-6 h-6" />
          </button>
        )}

        {step === "pricing" && (
          <>
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
                  <h3 className="text-2xl font-bold text-white mt-4 mb-2">Oylik PRO</h3>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-extrabold text-white">1 000 UZS</span>
                    <span className="text-stone-400 font-medium mb-1 line-through">77 000 UZS</span>
                  </div>
                  <p className="text-sm font-bold text-orange-500 mb-1">Test / Sinov narxi: 1 000 UZS</p>
                  <p className="text-sm text-stone-400">1 oylik to'liq ruxsat</p>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-stone-300 text-sm">Moviy Galochka (Tasdiqlangan usta)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-stone-300 text-sm">Qidiruvda eng TOP 3 likda chiqish</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-stone-300 text-sm">Cheksiz portfolio va HD rasmlar</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-stone-300 text-sm">Profil ranglari va fonini moslashtirish</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-stone-300 text-sm">AI Maslahatchi orqali avto-javoblar</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectPlan("Oylik PRO (1 oy)", "1 000 UZS")}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
                >
                  PRO ga ulanish
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
                      <h4 className="font-bold text-white text-lg">3 Oylik <span className="text-orange-500 text-sm xl:ml-1 block xl:inline">+1 oy bonus</span></h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white font-bold">1 000 UZS</span>
                        <span className="text-stone-500 text-sm line-through">300 000 UZS</span>
                      </div>
                      <p className="text-xs font-bold text-orange-500 mt-1">Test / Sinov narxi: 1 000 UZS</p>
                    </div>
                    <button
                      onClick={() => handleSelectPlan("3 Oylik (+1 oy bonus)", "1 000 UZS")}
                      className="bg-stone-800 hover:bg-stone-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors w-full xl:w-auto"
                    >
                      Xarid qilish
                    </button>
                  </div>
                  {/* 6 Oylik */}
                  <div className="bg-zinc-950 border border-stone-800 rounded-2xl p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 hover:border-stone-700 transition-colors">
                    <div>
                      <h4 className="font-bold text-white text-lg">6 Oylik <span className="text-orange-500 text-sm xl:ml-1 block xl:inline">+2 oy bonus</span></h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white font-bold">1 000 UZS</span>
                        <span className="text-stone-500 text-sm line-through">520 000 UZS</span>
                      </div>
                      <p className="text-xs font-bold text-orange-500 mt-1">Test / Sinov narxi: 1 000 UZS</p>
                    </div>
                    <button
                      onClick={() => handleSelectPlan("6 Oylik (+2 oy bonus)", "1 000 UZS")}
                      className="bg-stone-800 hover:bg-stone-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors w-full xl:w-auto"
                    >
                      Xarid qilish
                    </button>
                  </div>
                  {/* Umrbod */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 hover:border-orange-500/40 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/20 blur-2xl rounded-full"></div>
                    <div className="relative z-10">
                      <h4 className="font-bold text-white text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-500 shrink-0" /> Umrbod (Lifetime)
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white font-bold">1 000 UZS</span>
                        <span className="text-stone-500 text-sm line-through">1 490 000 UZS</span>
                      </div>
                      <p className="text-xs font-bold text-orange-500 mt-1">Test / Sinov narxi: 1 000 UZS</p>
                    </div>
                    <button
                      onClick={() => handleSelectPlan("Umrbod (Lifetime)", "1 000 UZS")}
                      className="relative z-10 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors shadow-lg shadow-orange-500/20 w-full xl:w-auto"
                    >
                      Xarid qilish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {step === "checkout" && (
          <div className="max-w-xl mx-auto py-4">
            <button 
              onClick={() => setStep("pricing")}
              disabled={isProcessing}
              className="text-sm font-medium text-stone-400 hover:text-white mb-6 flex items-center gap-2 disabled:opacity-50"
            >
              ← Orqaga
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">To'lovni amalga oshirish</h2>
              <p className="text-stone-400">
                Siz <span className="text-orange-500 font-bold">{selectedPlan?.name}</span> paketini tanladingiz. To'lov summasi: <span className="text-white font-bold">{selectedPlan?.price}</span>
              </p>
            </div>

            <div className="bg-zinc-900 border border-stone-800 rounded-2xl p-6 mb-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full"></div>
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Pul o'tkazish uchun hisob raqami</h3>
              <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-stone-800/50 mb-2">
                <div className="font-mono text-lg tracking-widest text-white">{ADMIN_CARD}</div>
                <button 
                  type="button"
                  onClick={handleCopyCard}
                  className="p-2 text-stone-400 hover:text-white bg-stone-800/50 hover:bg-stone-700 rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-stone-500 mt-2">Iltimos, yuqoridagi hisob raqamiga belgilangan summani o'tkazing va quyidagi formani to'ldiring. (Test rejimida istalgan ma'lumot kiriting)</p>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Karta raqamingiz</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="8600 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    disabled={isProcessing}
                    className="w-full bg-zinc-900 border border-stone-800 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">Amal qilish muddati</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    disabled={isProcessing}
                    className="w-full bg-zinc-900 border border-stone-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || cardNumber.length < 19 || expiry.length < 5}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 mt-8"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    To'lov tekshirilmoqda...
                  </>
                ) : (
                  "To'lovni tasdiqlash"
                )}
              </button>

              <a 
                href="https://t.me/UstaGo_pro_bot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 text-stone-400 hover:text-white transition-colors mt-4 text-sm font-medium"
              >
                Chekni Botga Yuborish ↗
              </a>
            </form>
          </div>
        )}

        {step === "success" && (
          <div className="max-w-md mx-auto py-12 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">To'lovingiz qabul qilindi!</h2>
            <p className="text-stone-400 mb-8">
              PRO obunangiz faollashtirildi 🎉 Endi mijozlar sizni ishonchli usta sifatida qabul qilishadi.
            </p>
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto opacity-50"></div>
          </div>
        )}

      </div>
    </div>
  );
}
