"use client";

import { useState, useEffect } from "react";
import { ClipboardList, User, Image as ImageIcon, CheckCircle2, Phone, MessageCircle, XCircle, Plus, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const TABS = [
  { id: "orders", label: "Buyurtmalar", icon: ClipboardList },
  { id: "profile", label: "Profil", icon: User },
  { id: "portfolio", label: "Portfolio", icon: ImageIcon },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [hasInstagram, setHasInstagram] = useState(false);
  const [currentMaster, setCurrentMaster] = useState<any>(null);
  
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ustago-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ustago-media')
        .getPublicUrl(filePath);

      const updatedPortfolio = [...portfolioImages, publicUrl];
      setPortfolioImages(updatedPortfolio);
      
      const updatedMaster = { ...currentMaster, portfolio: updatedPortfolio };
      setCurrentMaster(updatedMaster);
      localStorage.setItem("usta_current_master", JSON.stringify(updatedMaster));
      
      // Update global masters array
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
            Boshqaruv Paneli {currentMaster ? `- ${currentMaster.name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">UstaGo profilingizni va buyurtmalarni boshqaring.</p>
        </div>
        <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 w-fit">
          <CheckCircle2 className="w-4 h-4" />
          Tarif: Faol (12 kun qoldi)
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-hover p-1 rounded-2xl overflow-x-auto scrollbar-hide border border-border-color">
        {TABS.map((tab) => (
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
            <h2 className="text-lg font-bold text-foreground mb-4">Mijozlar buyurtmalari</h2>
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
                          {order.status === "new" ? "Yangi" : order.status === "in_progress" ? "Jarayonda" : "Yakunlangan"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a href={`tel:${order.phone}`} className="p-2.5 bg-surface hover:bg-surface-hover text-foreground border border-border-color rounded-lg transition-colors">
                        <Phone className="w-4 h-4" />
                      </a>
                      <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-orange-500/20">
                        Qabul qilish
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
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-bold text-foreground">Shaxsiy ma'lumotlar</h2>
            
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <p className="text-sm text-amber-500/90 leading-relaxed">
                  Ism yoki kategoriyani o'zgartirish uchun admin bilan bog'laning.
                </p>
              </div>
              <a 
                href="https://t.me/A_Husanboyev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Admin bilan bog'lanish
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Ism va Familiya</label>
                <input type="text" readOnly defaultValue={currentMaster?.name || "Alisher Usta"} className="w-full px-4 py-2.5 bg-background border border-border-color text-foreground rounded-xl opacity-70 cursor-not-allowed focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Mutaxassislik</label>
                <input type="text" readOnly defaultValue={currentMaster?.category || "Santexnik"} className="w-full px-4 py-2.5 bg-background border border-border-color text-foreground rounded-xl opacity-70 cursor-not-allowed focus:outline-none capitalize" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">O'zingiz haqingizda</label>
              <textarea rows={4} readOnly defaultValue="Assalomu alaykum! Men o'z ishimning ustasiman." className="w-full px-4 py-2.5 bg-background border border-border-color text-foreground rounded-xl opacity-70 cursor-not-allowed focus:outline-none"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Telefon raqam</label>
                <input type="tel" readOnly defaultValue={currentMaster?.phone || "+998901234567"} className="w-full px-4 py-2.5 bg-background border border-border-color text-foreground rounded-xl opacity-70 cursor-not-allowed focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Telegram Username</label>
                <input type="text" readOnly defaultValue={currentMaster?.telegram || "@alisher_usta"} className="w-full px-4 py-2.5 bg-background border border-border-color text-foreground rounded-xl opacity-70 cursor-not-allowed focus:outline-none" />
              </div>
            </div>

            <div className="pt-4 border-t border-border-color">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                    checked={hasInstagram}
                    onChange={(e) => setHasInstagram(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-hover border border-border-color peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </div>
                <span className="text-sm font-medium text-foreground">Instagram sahifani ulash</span>
              </label>
              
              {hasInstagram && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <input type="url" placeholder="https://instagram.com/..." className="w-full px-4 py-2.5 bg-background border border-border-color text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              )}
            </div>
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
    </div>
  );
}
