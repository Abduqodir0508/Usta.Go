"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Star, ShieldCheck, MapPin, MessageSquare, Wrench, ChevronRight, Zap, BadgeCheck, CreditCard, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

// Removed MOCK_MASTERS completely

import { useState, useEffect } from "react";
import ProPricingModal from "@/components/modals/ProPricingModal";
import TermsModal from "@/components/modals/TermsModal";

export default function Home() {
  const { t } = useLanguage();
  const [featuredMasters, setFeaturedMasters] = useState<any[]>([]);
  const [currentMaster, setCurrentMaster] = useState<any>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  useEffect(() => {
    const loadMasters = () => {
      const stored = localStorage.getItem("usta_masters");
      if (stored) {
        const parsed = JSON.parse(stored);
        const categoryMapping: Record<string, string> = {
          "santexnik": "plumber",
          "elektrik": "electrician",
          "mebelchi": "furniture",
          "remont": "renovation"
        };
        const formatted = parsed.slice(0, 3).map((m: any) => ({
          id: m.id.toString(),
          name: m.name,
          categoryId: categoryMapping[m.category] || m.category,
          rating: m.rating || 5.0,
          price: m.price ? parseInt(m.price) : 50000,
          image: m.avatar_url || "https://i.pravatar.cc/150?u=" + m.id,
        }));
        setFeaturedMasters(formatted);
      }
      
      const loggedIn = localStorage.getItem("usta_current_master");
      if (loggedIn) {
        setCurrentMaster(JSON.parse(loggedIn));
      } else {
        setCurrentMaster(null);
      }
    };
    
    loadMasters();
    window.addEventListener("storage", loadMasters);
    return () => window.removeEventListener("storage", loadMasters);
  }, []);

  const handleProClick = () => {
    if (currentMaster) {
      setIsPricingModalOpen(true);
    } else {
      alert("Bu tarif faqat ro'yxatdan o'tgan ustalar uchun! Usta sifatida kiring.");
    }
  };

  const handlePurchaseSuccess = (planName: string) => {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const updatedMaster = { 
      ...currentMaster, 
      is_pro: true, 
      pro_plan: planName, 
      pro_expires_at: expiresAt.toISOString() 
    };
    setCurrentMaster(updatedMaster);
    localStorage.setItem("usta_current_master", JSON.stringify(updatedMaster));
    
    const allMasters = JSON.parse(localStorage.getItem("usta_masters") || "[]");
    const updatedAll = allMasters.map((m: any) => m.id === currentMaster.id ? updatedMaster : m);
    localStorage.setItem("usta_masters", JSON.stringify(updatedAll));
    
    window.dispatchEvent(new Event("storage"));
    setIsPricingModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-24 pb-24">
      
      {/* 1. Hero Section */}
      <section className="relative pt-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/20 dark:bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-amber-600 dark:text-amber-400 mb-4 animate-in slide-in-from-bottom-4 fade-in duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            {t.hero.badge}
          </div>
          
          <h1 className="text-2xl font-bold md:text-6xl md:font-extrabold text-foreground tracking-tight leading-[1.1] animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
            {t.hero.title.split('—')[0]} <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
              — {t.hero.title.split('—')[1]}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground opacity-80 max-w-2xl mx-auto animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
            {t.hero.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-full font-bold text-lg shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              {t.hero.findMaster}
            </button>
            <Link href="/qanday-ishlaydi" className="w-full sm:w-auto px-8 py-4 glass text-foreground rounded-full font-bold text-lg hover:bg-surface-hover transition-all flex items-center justify-center gap-2">
              {t.hero.howItWorks}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Comparison Section */}
      <section id="features" className="px-4 md:px-8 max-w-7xl mx-auto w-full scroll-mt-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">{t.comparison.title}</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Oldin / Qiyin */}
          <div className="bg-[#181211] border border-red-900/30 rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
              <span className="p-1 bg-red-900/50 rounded-md">❌</span>
              {t.comparison.beforeTitle}
            </h3>
            <ul className="space-y-4">
              {[t.comparison.before1, t.comparison.before2, t.comparison.before3, t.comparison.before4].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-[#A8A29E] font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* UstaGo Bilan */}
          <div className="bg-[#141813] border border-amber-900/30 rounded-3xl p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Wrench className="w-32 h-32 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2 relative z-10">
              <span className="p-1 bg-amber-900/50 rounded-md">✅</span>
              {t.comparison.afterTitle}
            </h3>
            <ul className="space-y-4 relative z-10">
              {[t.comparison.after1, t.comparison.after2, t.comparison.after3, t.comparison.after4].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-[#E7E5E4] font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3. AI Assistant Showcase */}
      <section id="ai-assistant" className="px-4 md:px-8 max-w-7xl mx-auto w-full scroll-mt-24">
        <div className="glass rounded-3xl p-8 md:p-12 border-border-color overflow-hidden relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-8 z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold">
                <Zap className="w-4 h-4" /> AI Powered
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-foreground">
                {t.aiShowcase.title}
              </h2>
              <ul className="space-y-4 md:space-y-6">
                {[t.aiShowcase.feature1, t.aiShowcase.feature2, t.aiShowcase.feature3].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 md:gap-4 text-xs sm:text-sm text-gray-200 md:text-lg md:text-slate-300">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-surface flex items-center justify-center border border-border-color shadow-sm flex-shrink-0">
                      <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Chat UI Mockup */}
            <div className="bg-surface border border-border-color rounded-2xl shadow-2xl p-4 space-y-4 z-10">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-[#1e293b] text-white p-3 md:p-4 rounded-2xl rounded-tr-sm max-w-[85%] text-xs md:text-sm shadow-sm">
                  {t.aiShowcase.userMessage}
                </div>
              </div>
              {/* AI Response */}
              <div className="flex gap-2 md:gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5 md:mt-0">
                  <span className="text-white text-[10px] md:text-xs font-bold">AI</span>
                </div>
                <div className="bg-[#1f1f1f] border border-[#2a2a2a] md:border-amber-500/20 text-gray-200 p-3 md:p-4 rounded-2xl rounded-tl-sm text-xs md:text-sm whitespace-pre-line leading-relaxed shadow-sm">
                  {t.aiShowcase.aiMessage}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Craftsman Directory Preview */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground">{t.navbar.directory}</h2>
          <Link href="/search" className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
            {t.categories.all} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 md:pb-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
          {featuredMasters.map((master) => (
            <Link
              key={master.id}
              href={`/usta/${master.id}`}
              className="min-w-[280px] md:min-w-0 snap-center glass p-5 md:p-6 rounded-3xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex gap-3 md:gap-4 items-start">
                <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                  <Image src={master.image} alt={master.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground group-hover:text-amber-500 transition-colors flex items-center gap-1">
                    {master.name}
                  </h3>
                  <p className="text-sm text-muted-foreground opacity-80">{t.categories[master.categoryId as keyof typeof t.categories] || master.categoryId}</p>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-border-color">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground opacity-60">{t.search.startingPrice}</span>
                  <span className="font-bold text-foreground text-lg">{master.price.toLocaleString()} so'm</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-current" /> {master.rating}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. PRO Tariflar Bloki (For Masters) */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-12">
        <div className="bg-zinc-900 border border-orange-500/20 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-orange-500/10 blur-3xl rounded-full transition-transform group-hover:scale-150"></div>
          
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider mb-4 border border-red-500/20">
              <Star className="w-3.5 h-3.5 fill-red-500" /> Ustalar Diqqatiga!
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              UstaGo PRO orqali buyurtmalaringizni <span className="text-orange-500">5 barobarga</span> oshiring
            </h2>
            <p className="text-stone-400 mb-6">
              Tasdiqlangan usta maqomini oling, qidiruvlarda birinchi o'ringa chiqing va faqat o'z ishingiz bilan shug'ullaning. Mijozlarni topishni bizga qo'yib bering.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-stone-300 font-medium">
                <CheckCircle2 className="w-5 h-5 text-orange-500" /> Qidiruvda 1-o'rinlarda bo'lish
              </li>
              <li className="flex items-center gap-3 text-stone-300 font-medium">
                <CheckCircle2 className="w-5 h-5 text-orange-500" /> Moviy galochka va Ishonch
              </li>
            </ul>
            <button 
              onClick={handleProClick}
              className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-orange-500/20"
            >
              Tariflarni ko'rish / Sotib olish
            </button>
          </div>
          
          <div className="relative z-10 hidden md:block">
            <div className="w-48 h-48 bg-zinc-950 border border-stone-800 rounded-full flex items-center justify-center relative shadow-2xl">
              <ShieldCheck className="w-24 h-24 text-orange-500" />
              <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-lg">
                PRO USTA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Foydalanish Qoidalari va Xavfsiz To'lov Kafolati */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mb-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800/50 text-stone-300 text-xs font-bold uppercase tracking-wider mb-4 border border-stone-700">
            <ShieldCheck className="w-3.5 h-3.5" /> Xavfsizlik va Shaffoflik
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Foydalanish Qoidalari va To'lov Tartibi
          </h2>
          <p className="text-stone-400">
            UstaGo platformasida xizmatlardan foydalanish, to'lovlarni amalga oshirish va kafolat shartlari bilan tanishing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 1-Karta */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-orange-500" />
              To'lov va PRO Xizmatini Faollashtirish Tartibi
            </h3>
            <ul className="space-y-5 text-stone-300 flex-1">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-stone-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                <p className="text-sm">Kerakli PRO tarifni tanlang va to'lov rekvizitlarini oling.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-stone-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                <p className="text-sm">To'lovni amalga oshirgach, chek ma'lumotlarini rasmiy botimizga (@UstaGoAdmin_bot) yuboring.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-stone-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                <p className="text-sm">Arizangiz administrator tomonidan tekshirilib, PRO profilingiz 5–15 daqiqa ichida faollashtiriladi.</p>
              </li>
            </ul>
          </div>

          {/* 2-Karta */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-orange-500" />
              Ommaviy Oferta va Shartlar (Qoidalar)
            </h3>
            <ul className="space-y-4 text-stone-300 flex-1">
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white text-sm">Xizmat sharti:</span>
                  <p className="text-sm text-stone-400 mt-1">PRO tarif ustaning platforma katalogidagi ko'rinishini oshirish va qo'shimcha imkoniyatlar berish uchun xizmat qiladi.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white text-sm">Mablag' qaytarilishi:</span>
                  <p className="text-sm text-stone-400 mt-1">PRO xizmati darhol taqdim etilishi sababli, faollashtirilgan davr uchun to'langan mablag' qaytarib berilmaydi.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white text-sm">Javobgarlik:</span>
                  <p className="text-sm text-stone-400 mt-1">Mijoz va Usta o'rtasidagi bajarilgan ishlar sifati uchun tomonlar o'zaro kelishuv asosida javobgardir.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsTermsModalOpen(true)}
            className="text-orange-500 hover:text-orange-400 text-sm font-bold flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            To'liq Ommaviy Oferta matnini o'qish ↗
          </button>
        </div>
      </section>

      {isPricingModalOpen && currentMaster && (
        <ProPricingModal 
          onClose={() => setIsPricingModalOpen(false)} 
          onSuccess={handlePurchaseSuccess} 
          masterData={currentMaster} 
        />
      )}

      {isTermsModalOpen && (
        <TermsModal onClose={() => setIsTermsModalOpen(false)} />
      )}
    </div>
  );
}
