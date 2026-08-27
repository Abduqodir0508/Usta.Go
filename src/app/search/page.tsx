"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, ShieldCheck, MapPin, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Barchasi", "Santexnik", "Elektrik", "Mebelchi", "Gruzchik", "Remont"];

const MOCK_MASTERS = [
  { id: "1", name: "Alisher Usta", category: "Santexnik", rating: 4.8, reviews: 124, price: 50000, verified: true, image: "https://i.pravatar.cc/150?u=alisher", location: "Toshkent, Yunusobod" },
  { id: "2", name: "Sanjar Elektrik", category: "Elektrik", rating: 4.9, reviews: 89, price: 70000, verified: true, image: "https://i.pravatar.cc/150?u=sanjar", location: "Toshkent, Chilonzor" },
  { id: "3", name: "Mebelchi Jasur", category: "Mebelchi", rating: 4.6, reviews: 45, price: 150000, verified: false, image: "https://i.pravatar.cc/150?u=jasur", location: "Toshkent, Mirzo Ulug'bek" },
  { id: "4", name: "Umid Santexnik", category: "Santexnik", rating: 4.5, reviews: 23, price: 60000, verified: true, image: "https://i.pravatar.cc/150?u=umid", location: "Toshkent, Yakkasaroy" },
  { id: "5", name: "Remontchi Sherzod", category: "Remont", rating: 5.0, reviews: 12, price: 200000, verified: true, image: "https://i.pravatar.cc/150?u=sherzod", location: "Toshkent, Sergeli" },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Barchasi");
  const [showFilters, setShowFilters] = useState(false);

  // Filter masters
  const filteredMasters = MOCK_MASTERS.filter((master) => {
    const matchesSearch = master.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          master.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Barchasi" || master.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Ustalarni qidirish</h1>
          <p className="text-sm text-slate-500">O'zingizga kerakli mutaxassisni toping</p>
        </div>
      </div>

      {/* Search Input & Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
            placeholder="Kimi qidiryapsiz?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-3 border rounded-2xl flex items-center justify-center transition-colors",
            showFilters ? "bg-[#1E40AF] text-white border-[#1E40AF]" : "bg-white text-slate-700 border-slate-200"
          )}
        >
          {showFilters ? <X className="w-6 h-6" /> : <Filter className="w-6 h-6" />}
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
              activeCategory === cat 
                ? "bg-[#1E40AF] text-white" 
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="mt-8">
        <p className="text-sm font-medium text-slate-500 mb-4">
          {filteredMasters.length} ta natija topildi
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMasters.map((master) => (
            <Link
              key={master.id}
              href={`/usta/${master.id}`}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow group flex flex-col"
            >
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                  <Image
                    src={master.image}
                    alt={master.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 truncate group-hover:text-[#1E40AF] transition-colors">
                      {master.name}
                    </h3>
                    {master.verified && (
                      <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-2">{master.category}</p>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-slate-700">{master.rating}</span>
                      <span className="text-slate-400">({master.reviews})</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate max-w-[120px]">{master.location}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Boshlang'ich narx</p>
                  <p className="font-bold text-slate-900">
                    {master.price.toLocaleString("uz-UZ")} so'm
                  </p>
                </div>
              </div>
            </Link>
          ))}
          
          {filteredMasters.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Natija topilmadi</h3>
              <p className="text-slate-500">Boshqa so'z bilan qidirib ko'ring yoki toifalarni o'zgartiring.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
