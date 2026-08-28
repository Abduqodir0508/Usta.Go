"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, ShieldCheck, MapPin, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { supabase } from "@/lib/supabase";

export default function SearchPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [mastersList, setMastersList] = useState<any[]>([]);
  
  useEffect(() => {
    const loadMasters = async () => {
      const { data, error } = await supabase
        .from('ustalar')
        .select('*')
        .eq('is_banned', false)
        .order('is_pro', { ascending: false })
        .order('id', { ascending: false });

      if (data && !error) {
        const categoryMapping: Record<string, string> = {
          "santexnik": "plumber",
          "elektrik": "electrician",
          "mebelchi": "furniture",
          "remont": "renovation"
        };
        const formatted = data.map((m: any) => ({
          id: m.id.toString(),
          name: m.name,
          categoryKey: categoryMapping[m.category] || m.category,
          rating: m.rating || 5.0,
          reviews: 0,
          price: m.price ? parseInt(m.price) : 50000,
          verified: m.is_pro,
          image: m.avatar_url || "https://i.pravatar.cc/150?u=" + m.id,
          location: m.address || "Toshkent",
          rawCategory: m.category,
          is_pro: m.is_pro
        }));
        setMastersList(formatted);
      }
    };
    
    loadMasters();
  }, []);

  const CATEGORIES = [
    { key: "all", label: t.categories.all },
    { key: "plumber", label: t.categories.plumber },
    { key: "electrician", label: t.categories.electrician },
    { key: "furniture", label: t.categories.furniture },
    { key: "renovation", label: t.categories.renovation },
    { key: "mover", label: t.categories.mover },
  ];

  // Filter masters
  const filteredMasters = mastersList.filter((master) => {
    // We get the translated string for the master's category
    const masterCategoryLabel = t.categories[master.categoryKey as keyof typeof t.categories] || master.categoryKey;
    
    const matchesSearch = master.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          masterCategoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || master.categoryKey === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 pt-24 min-h-screen">
      
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t.search.title}</h1>
          <p className="text-sm text-muted-foreground">{t.search.placeholder}</p>
        </div>
      </div>

      {/* Search Input & Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-background border border-border-color text-foreground rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-muted-foreground/50 transition-all"
            placeholder={t.search.placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-3 border border-border-color rounded-2xl flex items-center justify-center transition-colors",
            showFilters ? "bg-amber-500 text-white border-amber-500" : "bg-surface text-foreground hover:bg-surface-hover"
          )}
        >
          {showFilters ? <X className="w-6 h-6" /> : <Filter className="w-6 h-6" />}
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
              activeCategory === cat.key 
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20" 
                : "bg-surface border border-border-color text-foreground opacity-80 hover:opacity-100 hover:bg-surface-hover"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="mt-8">
        <p className="text-sm font-medium text-muted-foreground mb-4">
          {filteredMasters.length} {t.search.results}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMasters.map((master) => (
            <Link
              key={master.id}
              href={`/usta/${master.id}`}
              className="bg-surface border border-border-color rounded-2xl p-5 hover:shadow-lg hover:border-amber-500/30 transition-all group flex flex-col"
            >
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-background flex-shrink-0 border border-border-color">
                  <Image
                    src={master.image}
                    alt={master.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-foreground truncate group-hover:text-amber-500 transition-colors">
                      {master.name}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t.categories[master.categoryKey as keyof typeof t.categories]}
                  </p>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 bg-background px-2 py-0.5 rounded-md border border-border-color">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-foreground">{master.rating}</span>
                      <span className="text-muted-foreground text-xs">({master.reviews})</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border-color flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 text-amber-500/70" />
                  <span className="truncate max-w-[120px] text-xs">{master.location}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t.search.startingPrice}</p>
                  <p className="font-bold text-foreground">
                    {master.price.toLocaleString()} so'm
                  </p>
                </div>
              </div>
            </Link>
          ))}
          
          {filteredMasters.length === 0 && (
            <div className="col-span-full py-12 text-center bg-surface border border-border-color rounded-2xl">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-border-color">
                <Search className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{t.search.noResults}</h3>
              <p className="text-muted-foreground text-sm">Boshqa so'z bilan qidirib ko'ring yoki toifalarni o'zgartiring.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
