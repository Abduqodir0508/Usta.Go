"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { UserPlus, Search, CheckCircle, Wrench, Send, ShieldCheck, Zap } from "lucide-react";

export default function HowItWorks() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-24 pt-10">
      
      {/* Header Section */}
      <section className="text-center px-4 md:px-8 max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
          {t.howPage?.title}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground opacity-80 max-w-2xl mx-auto">
          {t.howPage?.subtitle}
        </p>
      </section>

      {/* Client Section */}
      <section className="px-4 md:px-8 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-amber-500 mb-8 text-center">
          {t.howPage?.clientTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-8 rounded-3xl relative overflow-hidden group hover:border-amber-500/50 transition-colors">
            <div className="w-12 h-12 bg-[#1c1c1e] text-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">{t.howPage?.clientStep1Title}</h3>
            <p className="text-muted-foreground opacity-90">{t.howPage?.clientStep1Desc}</p>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-9xl font-black">1</span>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl relative overflow-hidden group hover:border-amber-500/50 transition-colors">
            <div className="w-12 h-12 bg-[#1c1c1e] text-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">{t.howPage?.clientStep2Title}</h3>
            <p className="text-muted-foreground opacity-90">{t.howPage?.clientStep2Desc}</p>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-9xl font-black">2</span>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl relative overflow-hidden group hover:border-amber-500/50 transition-colors">
            <div className="w-12 h-12 bg-[#1c1c1e] text-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">{t.howPage?.clientStep3Title}</h3>
            <p className="text-muted-foreground opacity-90">{t.howPage?.clientStep3Desc}</p>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-9xl font-black">3</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="px-4 md:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-gradient-to-br from-[#1c1c1e] to-surface border border-border-color rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Zap className="w-48 h-48 text-blue-500" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold">
              <Zap className="w-4 h-4" /> {t.howPage?.aiTitle}
            </div>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl">
              {t.howPage?.aiDesc}
            </p>
          </div>
        </div>
      </section>

      {/* Master Section */}
      <section className="px-4 md:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-[#181211] border border-amber-900/30 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute left-0 bottom-0 p-8 opacity-5 pointer-events-none">
            <Wrench className="w-48 h-48 text-amber-500" />
          </div>
          <div className="flex-1 space-y-6 relative z-10 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-amber-500">
              {t.howPage?.masterTitle}
            </h2>
            <p className="text-gray-300 text-lg">
              {t.howPage?.masterDesc}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
              <ShieldCheck className="w-5 h-5" /> {t.howPage?.masterPrice}
            </div>
          </div>
          <div className="relative z-10 w-full md:w-auto mt-4 md:mt-0">
            <a 
              href="https://t.me/A_Husanboyev" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-full font-bold text-sm md:text-lg shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Send className="w-5 h-5" />
              {t.howPage?.masterBtn}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
