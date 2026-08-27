"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Star, ShieldCheck, MapPin, MessageSquare, Wrench, ChevronRight, Zap, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

const MOCK_MASTERS = [
  { id: "1", name: "Alisher Usta", categoryId: "plumber", rating: 4.8, reviews: 124, price: 50000, verified: true, image: "https://i.pravatar.cc/150?u=alisher", location: "Toshkent" },
  { id: "2", name: "Sanjar Elektrik", categoryId: "electrician", rating: 4.9, reviews: 89, price: 70000, verified: true, image: "https://i.pravatar.cc/150?u=sanjar", location: "Samarqand" },
  { id: "3", name: "Mebelchi Jasur", categoryId: "furniture", rating: 4.6, reviews: 45, price: 150000, verified: false, image: "https://i.pravatar.cc/150?u=jasur", location: "Buxoro" },
];

export default function Home() {
  const { t } = useLanguage();

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
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1] animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
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
            <button className="w-full sm:w-auto px-8 py-4 glass text-foreground rounded-full font-bold text-lg hover:bg-surface-hover transition-all flex items-center justify-center gap-2">
              {t.hero.howItWorks}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Comparison Section */}
      <section id="features" className="px-4 md:px-8 max-w-7xl mx-auto w-full scroll-mt-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">{t.comparison.title}</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Oldin / Qiyin */}
          <div className="glass bg-[#EBD5CC] dark:bg-red-950/20 border-[#D9BBAF] dark:border-red-900/30 rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-[#7F1D1D] dark:text-red-400 flex items-center gap-2">
              <span className="p-1 bg-[#D9BBAF] dark:bg-red-900/50 rounded-md">❌</span>
              {t.comparison.beforeTitle}
            </h3>
            <ul className="space-y-4">
              {[t.comparison.before1, t.comparison.before2, t.comparison.before3, t.comparison.before4].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-[#7F1D1D] dark:text-slate-300 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* UstaGo Bilan */}
          <div className="glass bg-[#DFE7D6] dark:bg-amber-950/20 border-[#C5D5B8] dark:border-amber-900/30 rounded-3xl p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Wrench className="w-32 h-32 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-[#14532D] dark:text-amber-400 flex items-center gap-2 relative z-10">
              <span className="p-1 bg-[#C5D5B8] dark:bg-amber-900/50 rounded-md">✅</span>
              {t.comparison.afterTitle}
            </h3>
            <ul className="space-y-4 relative z-10">
              {[t.comparison.after1, t.comparison.after2, t.comparison.after3, t.comparison.after4].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-[#14532D] dark:text-slate-200 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#14532D] mt-2 flex-shrink-0" />
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
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {t.aiShowcase.title}
              </h2>
              <ul className="space-y-6">
                {[t.aiShowcase.feature1, t.aiShowcase.feature2, t.aiShowcase.feature3].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 text-lg text-stone-800 dark:text-slate-300">
                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center border border-border-color shadow-sm flex-shrink-0">
                      <BadgeCheck className="w-5 h-5 text-amber-500" />
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
                <div className="bg-slate-100 dark:bg-slate-800 text-foreground p-4 rounded-2xl rounded-tr-sm max-w-[85%] text-sm">
                  {t.aiShowcase.userMessage}
                </div>
              </div>
              {/* AI Response */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-foreground p-4 rounded-2xl rounded-tl-sm text-sm whitespace-pre-line leading-relaxed">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_MASTERS.map((master) => (
            <Link
              key={master.id}
              href={`/usta/${master.id}`}
              className="glass p-6 rounded-3xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex gap-4 items-start">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                  <Image src={master.image} alt={master.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground group-hover:text-amber-500 transition-colors flex items-center gap-1">
                    {master.name}
                    {master.verified && <ShieldCheck className="w-4 h-4 text-green-500" />}
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

    </div>
  );
}
