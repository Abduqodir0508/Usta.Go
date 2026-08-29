"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, MapPin, Trophy, Award, Medal, Filter, Search, Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { supabase } from "@/lib/supabase";
import { AvatarImage } from "@/components/ui/AvatarImage";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

const REGIONS = [
  "Barcha shaharlar",
  "Toshkent",
  "Samarqand",
  "Buxoro",
  "Andijon",
  "Farg'ona",
  "Namangan",
  "Qashqadaryo",
  "Surxondaryo",
  "Xorazm",
  "Navoiy",
  "Jizzax",
  "Sirdaryo",
  "Qoraqalpog'iston",
];

export default function ReytingPage() {
  const { t } = useLanguage();
  const [masters, setMasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("Barcha shaharlar");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTopMasters = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("ustalar")
          .select("*")
          .eq("is_banned", false)
          .order("rating", { ascending: false })
          .order("is_pro", { ascending: false });

        if (data && !error) {
          setMasters(data);
        }
      } catch (e) {
        console.error("Reyting fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMasters();
  }, []);

  const CATEGORIES = [
    { key: "all", label: "Barchasi" },
    { key: "santexnik", label: "Santexnik" },
    { key: "elektrik", label: "Elektrik" },
    { key: "mebelchi", label: "Mebelchi" },
    { key: "remont", label: "Remont / Ta'mirlash" },
    { key: "gruzchik", label: "Gruzchik / Yuk tashish" },
  ];

  // Filter & Sort Masters
  const filteredMasters = masters.filter((m) => {
    const catMatch =
      selectedCategory === "all" ||
      (m.category && m.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    const cityMatch =
      selectedCity === "Barcha shaharlar" ||
      (m.address && m.address.toLowerCase().includes(selectedCity.toLowerCase())) ||
      (m.location && m.location.toLowerCase().includes(selectedCity.toLowerCase()));

    const searchMatch =
      !searchQuery.trim() ||
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return catMatch && cityMatch && searchMatch;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pt-24 min-h-screen">
      {/* Title & Header */}
      <div className="text-center space-y-3 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 p-6 md:p-8 rounded-3xl relative overflow-hidden">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
          <Trophy className="w-4 h-4" />
          <span>ENG YUQORI REYTINGLI USTALAR</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
          Top Ustalar Reytingi 🏆
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
          Mijozlar bahosi va sharhlari asosida eng saralangan professional ustalar ro'yxati.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface border border-border-color p-4 md:p-6 rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Usta ismi yoki sohasi bo'yicha qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border-color rounded-xl text-foreground text-sm outline-none focus:border-amber-500"
            />
          </div>

          {/* City Dropdown */}
          <div className="w-full sm:w-64">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border-color rounded-xl text-foreground text-sm outline-none focus:border-amber-500 font-medium cursor-pointer"
            >
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  📍 {region}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all",
                selectedCategory === cat.key
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                  : "bg-background border border-border-color text-foreground opacity-80 hover:opacity-100 hover:bg-surface-hover"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Masters List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-muted-foreground">Top ustalar ro'yxati yuklanmoqda...</p>
        </div>
      ) : filteredMasters.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border-color rounded-3xl p-6">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-bold text-foreground">Ayni vaqtda ustalar topilmadi</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Boshqa shahar yoki kategoriyani tanlab ko'ring.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMasters.map((m, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            const isPro = !!m.is_pro;

            return (
              <div
                key={m.id}
                className={cn(
                  "bg-surface border rounded-3xl p-5 md:p-6 transition-all duration-300 relative flex flex-col md:flex-row md:items-center justify-between gap-5 group",
                  isPro
                    ? "border-amber-500/40 shadow-lg shadow-amber-500/5 bg-gradient-to-r from-amber-500/5 via-surface to-surface"
                    : "border-border-color hover:border-slate-400"
                )}
              >
                {/* Rank Badge */}
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-md",
                      rank === 1
                        ? "bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 ring-4 ring-amber-400/20"
                        : rank === 2
                        ? "bg-gradient-to-tr from-slate-300 to-slate-400 text-slate-950"
                        : rank === 3
                        ? "bg-gradient-to-tr from-amber-700 to-amber-800 text-white"
                        : "bg-background text-muted-foreground border border-border-color"
                    )}
                  >
                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                  </div>

                  {/* Avatar */}
                  <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden bg-background border border-border-color shrink-0">
                    <AvatarImage
                      src={m.avatar_url || m.image}
                      alt={m.name || "Usta"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base md:text-lg font-bold text-foreground group-hover:text-amber-500 transition-colors flex items-center gap-1.5">
                        {m.name}
                        {isPro && <VerifiedBadge className="w-5 h-5" />}
                      </h3>

                      {isPro && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider">
                          PRO Usta
                        </span>
                      )}
                    </div>

                    <p className="text-xs md:text-sm font-semibold text-amber-500">
                      {m.category || "Usta"}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1 bg-background px-2.5 py-1 rounded-lg border border-border-color font-bold text-foreground">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {m.rating || "5.0"}
                      </span>

                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-500/70" />
                        {m.address || m.location || "Toshkent"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <Link
                    href={`/usta/${m.id}`}
                    className="px-4 py-2.5 bg-background hover:bg-surface-hover text-foreground border border-border-color rounded-xl text-xs font-bold transition-colors"
                  >
                    Profilni ko'rish
                  </Link>

                  {(() => {
                    const rawTg = m.telegram || m.telegram_username || "";
                    const cleanTg = rawTg.replace(/^@/, "").trim();
                    const tgUrl = cleanTg ? `https://t.me/${cleanTg}` : "https://t.me/UstaGo_pro_bot";
                    return (
                      <a
                        href={tgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Bog'lanish</span>
                      </a>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
