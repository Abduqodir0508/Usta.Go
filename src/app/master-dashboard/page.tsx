"use client";

import { useState, useEffect } from "react";
import { ClipboardList, User, Image as ImageIcon, CheckCircle2, Phone, MessageCircle, XCircle, Plus, UploadCloud, MapPin, Star, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/providers/LanguageProvider";
import CropModal from "@/components/modals/CropModal";
import ProPricingModal from "@/components/modals/ProPricingModal";

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

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("usta_current_master");
    if (stored) {
      const master = JSON.parse(stored);
      setCurrentMaster(master);
      setPortfolioImages(master.portfolio || []);
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
  }, []);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentMaster) return;
    
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
      const fileName = `portfolio/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

      const { error: uploadError } = await supabase.storage
        .from('ustago-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ustago-media')
        .getPublicUrl(fileName);

      const updatedPortfolio = [...portfolioImages, publicUrl];
      setPortfolioImages(updatedPortfolio);
      
      const updatedMaster = { ...currentMaster, portfolio: updatedPortfolio };
      setCurrentMaster(updatedMaster);
      localStorage.setItem("usta_current_master", JSON.stringify(updatedMaster));
      
      const allMasters = JSON.parse(localStorage.getItem("usta_masters") || "[]");
      const updatedAll = allMasters.map((m: any) => m.id === currentMaster.id ? updatedMaster : m);
      localStorage.setItem("usta_masters", JSON.stringify(updatedAll));
      
      window.dispatchEvent(new Event("storage"));
      
    } catch (error) {
      console.error('Error uploading portfolio image:', error);
      alert('Rasm yuklashda xatolik yuz berdi!');
    } finally {
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
      const fileName = `avatars/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ustago-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ustago-media')
        .getPublicUrl(fileName);

      const updatedMaster = { ...currentMaster, avatar_url: publicUrl, image: publicUrl };
      setCurrentMaster(updatedMaster);
      localStorage.setItem("usta_current_master", JSON.stringify(updatedMaster));
      
      const allMasters = JSON.parse(localStorage.getItem("usta_masters") || "[]");
      const updatedAll = allMasters.map((m: any) => m.id === currentMaster.id ? updatedMaster : m);
      localStorage.setItem("usta_masters", JSON.stringify(updatedAll));
      
      window.dispatchEvent(new Event("storage"));
      
    } catch (error: any) {
      console.error("Storage upload error:", error);
      alert('Avatar yuklashda xatolik yuz berdi!');
    }
  };

  const handleDeleteImage = (urlToRemove: string) => {
    if (!confirm("Ushbu rasmni o'chirishni xohlaysizmi?")) return;
    
    const updatedPortfolio = portfolioImages.filter(url => url !== urlToRemove);
    setPortfolioImages(updatedPortfolio);
    
    if (currentMaster) {
      const updatedMaster = { ...currentMaster, portfolio: updatedPortfolio };
      setCurrentMaster(updatedMaster);
      localStorage.setItem("usta_current_master", JSON.stringify(updatedMaster));
      
      const allMasters = JSON.parse(localStorage.getItem("usta_masters") || "[]");
      const updatedAll = allMasters.map((m: any) => m.id === currentMaster.id ? updatedMaster : m);
      localStorage.setItem("usta_masters", JSON.stringify(updatedAll));
      
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleCancelPro = () => {
    if (confirm("Rostdan ham PRO obunani bekor qilmoqchimisiz? To'langan mablag' qaytarib berilmaydi!")) {
      const updatedMaster = { ...currentMaster, is_pro: false, pro_plan: null, pro_expires_at: null };
      setCurrentMaster(updatedMaster);
      localStorage.setItem("usta_current_master", JSON.stringify(updatedMaster));
      
      const allMasters = JSON.parse(localStorage.getItem("usta_masters") || "[]");
      const updatedAll = allMasters.map((m: any) => m.id === currentMaster.id ? updatedMaster : m);
      localStorage.setItem("usta_masters", JSON.stringify(updatedAll));
      
      window.dispatchEvent(new Event("storage"));
      alert("PRO obunangiz bekor qilindi.");
    }
  };

  const handlePurchaseSuccess = (planName: string) => {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // Test mock

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
    alert(`${planName} muvaffaqiyatli faollashtirildi!`);
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
                <div className="h-20 bg-gradient-to-r from-stone-800 to-stone-900"></div>
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
                      <div className="w-20 h-20 rounded-full border-4 border-background bg-surface flex items-center justify-center overflow-hidden relative">
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
                        <span title="Tasdiqlangan PRO usta" className="flex items-center">
                          <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                        </span>
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
            {currentMaster?.is_pro ? (
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3">
                  <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                    FAOL
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">PRO obunangiz faol</h4>
                      <p className="text-sm text-muted-foreground mt-1 max-w-[90%]">
                        Joriy tarif: {currentMaster.pro_plan}. Siz barcha imtiyozlardan foydalanishingiz mumkin.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleCancelPro}
                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold py-2 px-4 rounded-lg text-sm transition-colors w-full sm:w-auto shrink-0"
                  >
                    Obunani bekor qilish
                  </button>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Bajargan ishlar rasmlari</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="aspect-square rounded-2xl border-2 border-dashed border-border-color bg-background flex flex-col items-center justify-center text-muted-foreground hover:text-amber-500 hover:border-amber-500 transition-colors group relative cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleUploadImage} 
                  disabled={isUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                />
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-sm font-medium">Yuklanmoqda...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Rasm yuklash</span>
                  </>
                )}
              </div>
              
              {portfolioImages.map((url, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-background relative group overflow-hidden border border-border-color">
                  <img src={url} alt={`Portfolio ${i+1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => handleDeleteImage(url)}
                      className="bg-surface/90 text-red-500 p-2 rounded-full hover:bg-surface hover:text-red-600 transition-colors shadow-lg"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
