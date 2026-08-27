"use client";

import { useState } from "react";
import { ClipboardList, User, Image as ImageIcon, CheckCircle2, Phone, MessageCircle, XCircle, Plus, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "orders", label: "Buyurtmalar", icon: ClipboardList },
  { id: "profile", label: "Profil", icon: User },
  { id: "portfolio", label: "Portfolio", icon: ImageIcon },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [hasInstagram, setHasInstagram] = useState(false);

  // Mock Orders
  const [orders, setOrders] = useState([
    { id: 1, client: "Sardor", phone: "+998901234567", issue: "Kran oqmoqda, zudlik bilan", status: "new", date: "Bugun, 10:30" },
    { id: 2, client: "Malika", phone: "+998939876543", issue: "Unitaz o'rnatish kerak", status: "in_progress", date: "Kecha, 15:00" },
    { id: 3, client: "Aziz", phone: "+998991112233", issue: "Trubalarni almashtirish", status: "completed", date: "24-Avg, 09:15" },
  ]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Boshqaruv Paneli</h1>
          <p className="text-sm text-slate-500">UstaGo profilingizni va buyurtmalarni boshqaring.</p>
        </div>
        <div className="bg-[#1E40AF]/10 text-[#1E40AF] px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 w-fit">
          <CheckCircle2 className="w-4 h-4" />
          Tarif: Faol (12 kun qoldi)
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 min-h-[400px]">
        
        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Mijozlar buyurtmalari</h2>
            {orders.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                Hozircha yangi buyurtmalar yo'q.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between hover:border-blue-100 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{order.client}</h3>
                        <span className="text-xs text-slate-400">{order.date}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{order.issue}</p>
                      
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
                          order.status === "new" && "bg-orange-100 text-orange-700",
                          order.status === "in_progress" && "bg-blue-100 text-blue-700",
                          order.status === "completed" && "bg-green-100 text-green-700"
                        )}>
                          {order.status === "new" ? "Yangi" : order.status === "in_progress" ? "Jarayonda" : "Yakunlangan"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a href={`tel:${order.phone}`} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                        <Phone className="w-4 h-4" />
                      </a>
                      <button className="px-4 py-2 bg-[#EA580C] hover:bg-[#c2410c] text-white text-sm font-medium rounded-lg transition-colors">
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
            <h2 className="text-lg font-bold text-slate-900">Shaxsiy ma'lumotlar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Ism va Familiya</label>
                <input type="text" defaultValue="Alisher Usta" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E40AF]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Mutaxassislik</label>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E40AF]">
                  <option>Santexnik</option>
                  <option>Elektrik</option>
                  <option>Mebelchi</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">O'zingiz haqingizda</label>
              <textarea rows={4} defaultValue="Assalomu alaykum! Men 8 yillik tajribaga ega santexnikman." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Telefon raqam</label>
                <input type="tel" defaultValue="+998901234567" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E40AF]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Telegram Username</label>
                <input type="text" defaultValue="@alisher_usta" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E40AF]" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                    checked={hasInstagram}
                    onChange={(e) => setHasInstagram(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1E40AF]"></div>
                </div>
                <span className="text-sm font-medium text-slate-700">Instagram sahifani ulash</span>
              </label>
              
              {hasInstagram && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <input type="url" placeholder="https://instagram.com/..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E40AF]" />
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button className="bg-[#1E40AF] hover:bg-blue-800 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
                Saqlash
              </button>
            </div>
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Bajargan ishlar rasmlari</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:text-[#1E40AF] hover:border-[#1E40AF] hover:bg-blue-50 transition-colors group">
                <UploadCloud className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Rasm yuklash</span>
              </button>
              
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-slate-100 relative group overflow-hidden border border-slate-200">
                  <img src={`https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400`} alt="portfolio" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white/90 text-red-500 p-2 rounded-full hover:bg-white hover:text-red-600 transition-colors">
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
