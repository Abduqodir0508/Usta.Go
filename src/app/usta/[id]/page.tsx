"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, MapPin, CheckCircle2, Phone, MessageCircle, ChevronLeft } from "lucide-react";
import { useParams, notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UstaProfile() {
  const params = useParams();
  const id = params.id as string;
  const [master, setMaster] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const { data: found, error: err } = await supabase
          .from('ustalar')
          .select('*')
          .eq('id', id)
          .single();

        if (err || !found) {
          setError(true);
          return;
        }

        const portfolioList = Array.isArray(found?.portfolio) 
          ? found.portfolio 
          : (typeof found?.portfolio === 'string' ? JSON.parse(found.portfolio || '[]') : []);

        setMaster({
          ...found,
          experience: "1 yil+", // Mock fallback for missing fields
          about: found.bio || "Assalomu alaykum! Men o'z ishimning ustasiman. Har qanday murakkablikdagi ishlarni tez va sifatli bajaraman.",
          image: found.avatar_url || found.image || null, // Updated for fallback logic below
          portfolio: portfolioList,
          services: [
            { name: "Asosiy xizmat", price: found.price ? `${found.price}` : "Kelishuv asosida" },
          ]
        });
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMaster();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !master) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
        <h2 className="text-2xl font-bold text-foreground">Usta topilmadi!</h2>
        <Link href="/katalog" className="bg-amber-500 text-white px-6 py-2 rounded-xl font-bold">
          Ortga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto min-h-screen pb-24 md:pb-8 pt-20">
      {/* Mobile Back Header */}
      <div className="md:hidden sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border-color px-4 py-3 flex items-center">
        <Link href="/katalog" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <span className="font-semibold text-foreground ml-2">Profil</span>
      </div>

      {/* Header Info */}
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-border-color bg-surface flex-shrink-0 shadow-xl mx-auto md:mx-0 flex items-center justify-center">
            {master.image ? (
              <Image
                src={master.image}
                alt={master.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-amber-500">{master.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{master.name}</h1>
            </div>
            
            <p className="text-lg text-amber-500 font-medium">{master.category}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-1 bg-surface px-3 py-1 rounded-full border border-border-color">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-foreground">{master.rating}</span>
                <span>({master.reviews} ta sharh)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-amber-500/70" />
                <span>{master.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-foreground">Tajriba:</span> {master.experience}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20">
            <MessageCircle className="w-5 h-5" />
            Telegram orqali bog'lanish
          </button>
          <a href={`tel:${master.phone}`} className="flex-1 bg-surface-hover hover:bg-slate-200 dark:hover:bg-slate-800 border border-border-color text-foreground py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors">
            <Phone className="w-5 h-5" />
            Qo'ng'iroq qilish
          </a>
        </div>

        {/* About */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border-color pb-2">Usta haqida</h2>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            {master.about}
          </p>
        </div>

        {/* Portfolio */}
        {master.portfolio && master.portfolio.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border-color pb-2">Bajargan ishlari</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {master.portfolio.map((img: string, i: number) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-surface border border-border-color cursor-pointer group">
                  <a href={img} target="_blank" rel="noopener noreferrer">
                    <img src={img} alt={`Portfolio ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price List */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border-color pb-2">Xizmat narxlari</h2>
          <div className="bg-surface border border-border-color rounded-2xl overflow-hidden">
            {master.services.map((service: any, i: number) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-4 border-b border-border-color last:border-0 hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span className="font-medium text-foreground text-sm md:text-base">{service.name}</span>
                </div>
                <span className="font-bold text-amber-500">{service.price} so'm</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
