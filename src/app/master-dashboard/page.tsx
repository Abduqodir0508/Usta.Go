"use client";

import { useState, useEffect } from "react";
import { ClipboardList, User, Image as ImageIcon, CheckCircle2, Phone, MessageCircle, XCircle, Plus, UploadCloud, MapPin, Star, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/providers/LanguageProvider";
import CropModal from "@/components/modals/CropModal";
import ProPricingModal from "@/components/modals/ProPricingModal";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

export default function Dashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("orders");
  const [hasInstagram, setHasInstagram] = useState(false);
  const [currentMaster, setCurrentMaster] = useState<any>(null);
  
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Crop Modal state
  const [cropConfig, setCropConfig] = useState<{ src: string; type: 'avatar' | 'portfolio' } | null>(null);

  // PRO Pricing Modal state
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  useEffect(() => {
    const fetchMasterData = async () => {
      const stored = localStorage.getItem("usta_current_master");
      if (stored) {
        const localMaster = JSON.parse(stored);
        
        // Agar Supabase da ID bo'lsa fetch qilamiz
        if (localMaster.id) {
          const { data, error } = await supabase.from('ustalar').select('*').eq('id', localMaster.id).single();
          if (data && !error) {
            let updatedData = { ...data };
            if (data.is_pro && data.pro_expires_at && !data.pro_expires_at.startsWith('2099')) {
               const diff = new Date(data.pro_expires_at).getTime() - new Date().getTime();
               const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
               if (days <= 0) {
                 await supabase.from('ustalar').update({ is_pro: false, pro_plan: null, pro_expires_at: null }).eq('id', data.id);
                 updatedData.is_pro = false;
                 updatedData.pro_plan = null;
                 updatedData.pro_expires_at = null;
               }
            }
            setCurrentMaster(updatedData);
            setPortfolioImages(updatedData.portfolio || []);
            localStorage.setItem("usta_current_master", JSON.stringify(updatedData));
          } else {
            setCurrentMaster(localMaster);
            setPortfolioImages(localMaster.portfolio || []);
          }
        } else {
          setCurrentMaster(localMaster);
          setPortfolioImages(localMaster.portfolio || []);
        }
      } else {
        // Default fallback for preview
        setCurrentMaster({
          name: "Alisher Usta",
          category: "Santexnik",
          phone: "+998901234567",
          telegram: "@alisher_usta",
          portfolio: []
        });
      }
    };
    fetchMasterData();
  }, []);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentMaster) return;

    const maxImages = currentMaster.is_pro ? 15 : 5;
    if (portfolioImages.length >= maxImages) {
      if (!currentMaster.is_pro) {
        alert("Oddiy foydalanuvchilar portfolioga ko'pi bilan 5 ta rasm yuklay oladi. 15 tagacha rasm yuklash uchun PRO tarifga o'ting!");
      } else {
        alert("Siz portfolioga maksimal 15 ta rasm yukladingiz!");
      }
      e.target.value = '';
      return;
    }
    
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setCropConfig({ src: reader.result as string, type: 'portfolio' });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset input
  };

  const uploadPortfolioCropped = async (file: File) => {
    setIsUploading(true);
    setCropConfig(null);
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Str = reader.result as string;
        const updatedPortfolio = [...portfolioImages, base64Str];
        
        if (currentMaster.id) {
          await supabase.from('ustalar').update({ portfolio: updatedPortfolio }).eq('id', currentMaster.id);
        }
        
        setPortfolioImages(updatedPortfolio);
        const updatedMaster = { ...currentMaster, portfolio: updatedPortfolio };
        setCurrentMaster(updatedMaster);
        localStorage.setItem("usta_current_master", JSON.stringify(updatedMaster));
        window.dispatchEvent(new Event("storage"));
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert("Rasmni o'qishda xatolik yuz berdi!");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading portfolio image:', error);
      alert('Rasm yuklashda xatolik yuz berdi!');
      setIsUploading(false);
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentMaster) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setCropConfig({ src: reader.result as string, type: 'avatar' });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset input
  };

  const uploadAvatarCropped = async (file: File) => {
    setCropConfig(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Str = reader.result as string;
        
        if (currentMaster.id) {
          await supabase.from('ustalar').update({ avatar_url: base64Str }).eq('id', currentMaster.id);
        }

        const updatedMaster = { ...currentMaster, avatar_url: base64Str, image: base64Str };
        setCurrentMaster(updatedMaster);
        localStorage.setItem("usta_current_master", JSON.stringify(updatedMaster));
        window.dispatchEvent(new Event("storage"));
      };
      reader.onerror = () => {
        alert("Avatar rasmini o'qishda xatolik yuz berdi!");
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Avatar Base64 upload error:", error);
      alert('Avatar yuklashda xatolik yuz berdi!');
    }
  };

  const handleDeleteImage = async (urlToRemove: string) => {
    if (!confirm("Ushbu rasmni o'chirishni xohlaysizmi?")) return;
    
    const updatedPortfolio = portfolioImages.filter(url => url !== urlToRemove);
    
    if (currentMaster?.id) {
      await supabase.from('ustalar').update({ portfolio: updatedPortfolio }).eq('id', currentMaster.id);
    }
    
    setPortfolioImages(updatedPortfolio);
    
    if (currentMaster) {
      const updatedMaster = { ...currentMaster, portfolio: updatedPortfolio };
      setCurrentMaster(updatedMaster);
      localStorage.setItem("usta_current_master", JSON.stringify(updatedMaster));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleCancelPro = async () => {
    if (confirm(t.proWidget?.cancelConfirm || "Rostdan ham PRO obunani bekor qilmoqchimisiz? To'langan mablag' qaytarib berilmaydi!")) {
      
      if (currentMaster?.id) {
        await supabase.from('ustalar').update({ 
          is_pro: false, 
          pro_plan: null, 
          pro_expires_at: null 
        }).eq('id', currentMaster.id);
      }

      const updatedMaster = { ...currentMaster, is_pro: false, pro_plan: null, pro_expires_at: null };
      setCurrentMaster(updatedMaster);
      localStorage.setItem("usta_current_master", JSON.stringify(updatedMaster));
      window.dispatchEvent(new Event("storage"));
      alert(t.proWidget?.cancelSuccess || "PRO obunangiz bekor qilindi.");
    }
  };

  const handlePurchaseSuccess = (planName: string) => {
    // Endi bot orqali tasdiqlanadi, shuning uchun bu shunchaki modalni yopish uchun
    setIsPricingModalOpen(false);
    alert("Chek muvaffaqiyatli yuborildi! Admin tasdiqlashini kuting.");
  };

  // Mock Orders
  const [orders, setOrders] = useState([
    { id: 1, client: "Sardor", phone: "+998901234567", issue: "Kran oqmoqda, zudlik bilan", status: "new", date: "Bugun, 10:30" },
    { id: 2, client: "Malika", phone: "+998939876543", issue: "Unitaz o'rnatish kerak", status: "in_progress", date: "Kecha, 15:00" },
    { id: 3, client: "Aziz", phone: "+998991112233", issue: "Trubalarni almashtirish", status: "completed", date: "24-Avg, 09:15" },
  ]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 pt-24 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t.dashboard.title} {currentMaster ? `- ${currentMaster.name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">UstaGo profilingizni va buyurtmalarni boshqaring.</p>
        </div>
        <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 w-fit">
          <CheckCircle2 className="w-4 h-4" />
          {t.dashboard.planActive}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-hover p-1 rounded-2xl overflow-x-auto scrollbar-hide border border-border-color">
        {[
          { id: "orders", label: t.dashboard.ordersTab, icon: ClipboardList },
          { id: "profile", label: t.dashboard.profileTab, icon: User },
          { id: "portfolio", label: t.dashboard.portfolioTab, icon: ImageIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-surface text-foreground shadow-sm border border-border-color"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-surface border border-border-color rounded-2xl p-6 min-h-[400px]">
        
        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-4">{t.dashboard.ordersTitle}</h2>
            {orders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                Hozircha yangi buyurtmalar yo'q.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="border border-border-color rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between hover:border-amber-500/30 bg-background transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">{order.client}</h3>
                        <span className="text-xs text-muted-foreground">{order.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{order.issue}</p>
                      
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
                          order.status === "new" && "bg-orange-500/20 text-orange-500",
                          order.status === "in_progress" && "bg-blue-500/20 text-blue-500",
                          order.status === "completed" && "bg-green-500/20 text-green-500"
                        )}>
                          {order.status === "new" ? t.dashboard.statusNew : order.status === "in_progress" ? t.dashboard.statusInProgress : t.dashboard.statusCompleted}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a href={`tel:${order.phone}`} className="p-2.5 bg-surface hover:bg-surface-hover text-foreground border border-border-color rounded-lg transition-colors">
                        <Phone className="w-4 h-4" />
                      </a>
                      <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-orange-500/20">
                        {t.dashboard.accept}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="space-y-8 max-w-2xl">
            {/* Live Preview Card */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">{t.dashboard?.profilePreview || "Profil ko'rinishi (Mijozlar uchun)"}</h2>
              <div className="bg-background border border-border-color rounded-2xl overflow-hidden max-w-sm shadow-sm relative">
                <div className={cn(
                  "h-24 relative transition-all duration-300 overflow-hidden",
                  currentMaster?.banner_color || "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700"
                )}>
                  {currentMaster?.banner_url && (
                    <img src={currentMaster.banner_url} alt="Banner" className="w-full h-full object-cover" />
                  )}
                  {currentMaster?.is_pro && (
                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                      <VerifiedBadge className="w-3 h-3 text-blue-400" />
                      <span>PRO BANNER</span>
                    </div>
                  )}
                </div>
                <div className="px-5 pb-5">
                  <div className="flex justify-between items-start -mt-10 mb-3">
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleUploadAvatar} 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-20 h-20 rounded-full" 
                        title="Rasmni o'zgartirish"
                      />
                      <div className="w-20 h-20 rounded-full border-4 border-background bg-surface flex items-center justify-center overflow-hidden relative shadow-md">
                        {currentMaster?.avatar_url ? (
                          <img src={currentMaster.avatar_url} alt={currentMaster?.name} className="w-full h-full object-cover group-hover:opacity-70 transition-opacity" />
                        ) : (
                          <User className="w-10 h-10 text-muted-foreground group-hover:scale-110 transition-transform" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <UploadCloud className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-surface px-2.5 py-1 rounded-full border border-border-color flex items-center gap-1.5 shadow-sm mt-10">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-sm font-bold">5.0</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      {currentMaster?.name || "Ism familiya"}
                      {currentMaster?.is_pro && (
                        <VerifiedBadge className="w-5 h-5" />
                      )}
                    </h3>
                    <p className="text-amber-500 font-medium text-sm">{currentMaster?.category || "Mutaxassislik"}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {currentMaster?.bio || "Assalomu alaykum! Men o'z ishimning ustasiman. Sifatli va tezkor xizmat ko'rsataman."}
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-xs font-medium text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" /> Chilonzor tumani
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Sozlamalari (PRO Usta uchun) */}
            <div className="bg-surface border border-border-color rounded-2xl p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-500" />
                  <span>Profil Banneri va Fon Ranglari</span>
                </h3>
                {currentMaster?.is_pro ? (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    PRO Faol ✨
                  </span>
                ) : (
                  <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <Lock className="w-3 h-3" /> PRO Imkoniyat
                  </span>
                )}
              </div>

              {currentMaster?.is_pro ? (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Profilingiz tepasidagi banner rangini tanlang yoki rasm havolasini (URL) kiriting:
                  </p>
                  
                  {/* Preset Gradients */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: "Oltin / Qizil", class: "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700" },
                      { name: "Ko'k / Siyohrang", class: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700" },
                      { name: "Zumrad / Yashil", class: "bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700" },
                      { name: "Tungi Premium", class: "bg-gradient-to-r from-zinc-800 via-stone-900 to-black" },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={async () => {
                          const updated = { ...currentMaster, banner_color: preset.class, banner_url: null };
                          setCurrentMaster(updated);
                          localStorage.setItem("usta_current_master", JSON.stringify(updated));
                          window.dispatchEvent(new Event("storage"));
                          if (currentMaster?.id) {
                            await supabase.from("ustalar").update({ banner_color: preset.class, banner_url: null }).eq("id", currentMaster.id);
                            await supabase.from("profiles").update({ banner_color: preset.class, banner_url: null }).eq("id", currentMaster.id);
                          }
                        }}
                        className={cn(
                          "h-12 rounded-xl p-2 text-[11px] font-bold text-white flex items-center justify-center text-center shadow-sm border border-white/10 transition-transform hover:scale-105 cursor-pointer",
                          preset.class
                        )}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  {/* Banner Image URL Input */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Custom Banner Rasm URL (Ixtiyoriy)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/banner.jpg"
                        value={currentMaster?.banner_url || ""}
                        onChange={(e) => {
                          const url = e.target.value;
                          setCurrentMaster((prev: any) => ({ ...prev, banner_url: url }));
                        }}
                        className="flex-1 px-3.5 py-2 bg-background border border-border-color rounded-xl text-xs text-foreground outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={async () => {
                          if (!currentMaster?.id) return;
                          try {
                            await supabase.from("ustalar").update({ banner_url: currentMaster.banner_url || null }).eq("id", currentMaster.id);
                            await supabase.from("profiles").update({ banner_url: currentMaster.banner_url || null }).eq("id", currentMaster.id);
                            localStorage.setItem("usta_current_master", JSON.stringify(currentMaster));
                            window.dispatchEvent(new Event("storage"));
                            alert("Banner rasm URL saqlandi!");
                          } catch (e) {
                            alert("Saqlashda xatolik!");
                          }
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Saqlash
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-background/60 p-4 rounded-xl border border-dashed border-amber-500/30 text-center space-y-2">
                  <p className="text-xs text-stone-400">
                    PRO usta bo'ling va profilingiz banner rangi hamda rasmini brendingizga mos ravishda erkin o'zgartiring!
                  </p>
                  <button
                    onClick={() => setIsPricingModalOpen(true)}
                    className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
                  >
                    ⭐ PRO versiyaga o'tish →
                  </button>
                </div>
              )}
            </div>

            {/* Read-only Name/Phone & Editable Bio Form (Talab 3) */}
            <div className="bg-surface border border-border-color rounded-2xl p-5 md:p-6 space-y-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                <span>Shaxsiy Ma'lumotlar va Biografiya</span>
              </h3>

              {/* Read Only Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center justify-between">
                    <span>Ism-Familiya</span>
                    <span className="text-[10px] text-amber-500 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Read-only
                    </span>
                  </label>
                  <input
                    type="text"
                    value={currentMaster?.name || ""}
                    readOnly
                    disabled
                    className="w-full px-4 py-2.5 bg-background/50 border border-border-color rounded-xl text-muted-foreground font-medium text-sm cursor-not-allowed select-none opacity-80"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">Faqat Admin o'zgartira oladi</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center justify-between">
                    <span>Telefon Raqam</span>
                    <span className="text-[10px] text-amber-500 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Read-only
                    </span>
                  </label>
                  <input
                    type="text"
                    value={currentMaster?.phone || ""}
                    readOnly
                    disabled
                    className="w-full px-4 py-2.5 bg-background/50 border border-border-color rounded-xl text-muted-foreground font-medium text-sm cursor-not-allowed select-none opacity-80"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">Faqat Admin o'zgartira oladi</p>
                </div>
              </div>

              {/* Bio Textarea with 250 limit */}
              <div className="space-y-2 pt-2 border-t border-border-color">
                <label className="block text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Biografiya / Opisaniye (Max 250 belgi)</span>
                  <span className={cn(
                    "text-xs font-bold font-mono",
                    (currentMaster?.bio?.length || 0) >= 240 ? "text-red-500" : "text-amber-500"
                  )}>
                    {(currentMaster?.bio?.length || 0)} / 250
                  </span>
                </label>

                <textarea
                  rows={4}
                  maxLength={250}
                  value={currentMaster?.bio || ""}
                  onChange={(e) => {
                    const text = e.target.value.slice(0, 250);
                    setCurrentMaster((prev: any) => ({ ...prev, bio: text }));
                  }}
                  placeholder="O'zingiz va xizmatlaringiz haqida qisqacha ma'lumot yozing (masalan: 10 yillik tajribaga ega santexnik ustaman...)"
                  className="w-full px-4 py-3 bg-background border border-border-color focus:border-amber-500 rounded-xl text-foreground text-sm outline-none transition"
                />

                <div className="flex justify-end pt-1">
                  <button
                    onClick={async () => {
                      if (!currentMaster?.id) return;
                      const bioText = (currentMaster.bio || "").slice(0, 250);
                      
                      try {
                        await supabase.from("ustalar").update({ bio: bioText }).eq("id", currentMaster.id);
                        await supabase.from("profiles").update({ bio: bioText }).eq("id", currentMaster.id);
                        
                        localStorage.setItem("usta_current_master", JSON.stringify(currentMaster));
                        window.dispatchEvent(new Event("storage"));
                        alert("Biografiya muvaffaqiyatli saqlandi!");
                      } catch (err) {
                        alert("Saqlashda xatolik yuz berdi!");
                      }
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Biografiyani saqlash
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Edit Lock Notice */}
            <div className="bg-surface-hover border border-border-color rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{t.dashboard?.editNoticeTitle || "Ma'lumotlarni o'zgartirish"}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {t.dashboard?.editNoticeDesc || "Ma'lumotlarni o'zgartirish uchun adminga murojaat qiling"}
                  </p>
                </div>
              </div>
              <a 
                href="https://t.me/A_Husanboyev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
              >
                {t.dashboard?.editNoticeBtn || "Adminga yozish"}
              </a>
            </div>

            {/* PRO Customization Teaser / Status */}
            {(() => {
              if (currentMaster?.is_pro) {
                let remainingDays = 0;
                let isLifetime = false;
                if (currentMaster.pro_expires_at) {
                  if (currentMaster.pro_expires_at.startsWith('2099')) {
                    isLifetime = true;
                  } else {
                    const diff = new Date(currentMaster.pro_expires_at).getTime() - new Date().getTime();
                    remainingDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
                  }
                }

                let statusColor = "green";
                if (!isLifetime) {
                  if (remainingDays <= 5 && remainingDays > 1) statusColor = "yellow";
                  if (remainingDays === 1) statusColor = "red";
                }

                const gradientMap: any = {
                  green: "from-green-500/10 to-emerald-600/10 border-green-500/20",
                  yellow: "from-yellow-500/10 to-amber-600/10 border-yellow-500/20",
                  red: "from-red-500/10 to-rose-600/10 border-red-500/20",
                };
                const iconBgMap: any = {
                  green: "from-green-500 to-emerald-600 shadow-green-500/20",
                  yellow: "from-yellow-500 to-amber-600 shadow-yellow-500/20",
                  red: "from-red-500 to-rose-600 shadow-red-500/20",
                };
                const badgeColorMap: any = {
                  green: "bg-green-500",
                  yellow: "bg-yellow-500",
                  red: "bg-red-500",
                };

                return (
                  <div className={`bg-gradient-to-br ${gradientMap[statusColor]} border rounded-xl p-5 relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-3">
                      <span className={`${badgeColorMap[statusColor]} text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm`}>
                        FAOL
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconBgMap[statusColor]} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          {isLifetime ? (
                            <h4 className="font-bold text-foreground">{t.proWidget?.lifetime || "⭐ Umrbod PRO (Cheksiz muddat)"}</h4>
                          ) : (
                            <h4 className="font-bold text-foreground">
                              {statusColor === "red" 
                                ? (t.proWidget?.lastDay || "🚨 Bugun PRO obunangizning oxirgi kuni!")
                                : statusColor === "yellow"
                                ? (t.proWidget?.warningLeft?.replace('{days}', remainingDays.toString()) || `⚠️ PRO obunangiz tugashiga ${remainingDays} kun qoldi! Imkoniyatlarni saqlab qolish uchun yangilang.`)
                                : (t.proWidget?.activeDaysLeft?.replace('{days}', remainingDays.toString()) || `⭐ PRO obuna faol: ${remainingDays} kun qoldi`)}
                            </h4>
                          )}
                          {!isLifetime && (
                            <p className="text-sm text-muted-foreground mt-1 max-w-[90%]">
                              {t.proWidget?.expiresAt?.replace('{date}', new Date(currentMaster.pro_expires_at).toLocaleDateString()) || `(Tugash sanasi: ${new Date(currentMaster.pro_expires_at).toLocaleDateString()})`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                        {(statusColor === "yellow" || statusColor === "red") && (
                          <button 
                            onClick={() => setIsPricingModalOpen(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                          >
                            {t.proWidget?.renewBtn || "Yangilash"}
                          </button>
                        )}
                        <button 
                          onClick={handleCancelPro}
                          className="bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                        >
                          {t.proWidget?.cancelBtn || "Obunani bekor qilish"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3">
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                        PRO
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{t.dashboard?.proTeaserTitle || "Profil dizaynini sozlash"}</h4>
                        <p className="text-sm text-muted-foreground mt-1 max-w-[90%]">
                          {t.dashboard?.proTeaserDesc || "PRO tarifida profil ranglari va foni dizaynini o'zgartirish imkoniyati mavjud. O'z profilingizni ajratib ko'rsating!"}
                        </p>
                        <button 
                          onClick={() => setIsPricingModalOpen(true)}
                          className="mt-3 text-sm font-semibold text-amber-500 group-hover:text-amber-600 transition-colors flex items-center gap-1"
                        >
                          {t.dashboard?.proTeaserBtn || "Tarifni yangilash →"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            })()}
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            {(() => {
              const maxImages = currentMaster?.is_pro ? 15 : 5;
              const isLimitReached = portfolioImages.length >= maxImages;
              const isFreeLimit = !currentMaster?.is_pro && portfolioImages.length >= 5;

              return (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-color pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">
                        Bajargan ishlar rasmlari (Portfolio)
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Mijozlarga bajargan ishlaringiz sifatini ko'rsating.
                      </p>
                    </div>

                    {/* Counter Badge */}
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold border",
                        isLimitReached
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : currentMaster?.is_pro
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-surface-hover text-foreground border-border-color"
                      )}>
                        {portfolioImages.length} / {maxImages} rasm
                      </span>
                      {currentMaster?.is_pro ? (
                        <span className="bg-orange-500/20 text-orange-500 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                          PRO (Max 15)
                        </span>
                      ) : (
                        <span className="bg-stone-500/20 text-stone-400 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          Oddiy (Max 5)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* PRO Upgrade Offer Banner for Free Users at Limit */}
                  {isFreeLimit && (
                    <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                      <div className="space-y-1">
                        <h4 className="font-bold text-amber-400 text-sm sm:text-base flex items-center gap-2">
                          ⭐ Ko'proq (15 tagacha) rasm yuklash uchun PRO versiyaga o'ting!
                        </h4>
                        <p className="text-xs text-stone-300">
                          PRO ustalar portfoliosiga 15 tagacha rasm yuklay oladi va qidiruvda TOP 1-o'rinda ko'rinadi.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsPricingModalOpen(true)}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all shrink-0 cursor-pointer"
                      >
                        PRO Tarifga O'tish →
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Upload Box */}
                    <div className={cn(
                      "aspect-square rounded-2xl border-2 border-dashed transition-colors group relative flex flex-col items-center justify-center p-3 text-center",
                      isLimitReached || isUploading
                        ? "border-stone-700/50 bg-stone-900/30 text-stone-600 cursor-not-allowed"
                        : "border-border-color bg-background text-muted-foreground hover:text-amber-500 hover:border-amber-500 cursor-pointer"
                    )}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleUploadImage} 
                        disabled={isUploading || isLimitReached}
                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                          <span className="text-xs font-medium">Yuklanmoqda...</span>
                        </div>
                      ) : isLimitReached ? (
                        <div className="flex flex-col items-center space-y-1">
                          <Lock className="w-8 h-8 text-stone-600 mb-1" />
                          <span className="text-xs font-bold text-stone-500">Limitga yetdi ({maxImages}/{maxImages})</span>
                          {!currentMaster?.is_pro && (
                            <span className="text-[10px] text-amber-500 font-semibold underline">PRO'ga o'ting</span>
                          )}
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform text-amber-500" />
                          <span className="text-xs font-bold text-foreground">Rasm yuklash</span>
                          <span className="text-[10px] text-stone-400 mt-0.5">({portfolioImages.length}/{maxImages})</span>
                        </>
                      )}
                    </div>

                    {/* Portfolio Images List */}
                    {portfolioImages.map((url, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-background relative group overflow-hidden border border-border-color shadow-sm">
                        <img src={url} alt={`Portfolio ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => handleDeleteImage(url)}
                            className="bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Rasmni o'chirish"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

      </div>
      
      {cropConfig && (
        <CropModal
          imageSrc={cropConfig.src}
          shape={cropConfig.type === 'avatar' ? 'round' : 'rect'}
          aspect={cropConfig.type === 'avatar' ? 1 : 4/3}
          onClose={() => setCropConfig(null)}
          onCropCompleteAction={cropConfig.type === 'avatar' ? uploadAvatarCropped : uploadPortfolioCropped}
        />
      )}

      {/* Pricing Modal */}
      {isPricingModalOpen && (
        <ProPricingModal
          onClose={() => setIsPricingModalOpen(false)}
          onSuccess={handlePurchaseSuccess}
          masterData={currentMaster}
        />
      )}
    </div>
  );
}
