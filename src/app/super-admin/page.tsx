"use client";

import { useState } from "react";
import { Users, UserPlus, Activity, Search, Shield, Trash2, Edit2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const MOCK_MASTERS = [
  { id: 1, name: "Aziz Rakhimov", category: "Santexnik", phone: "+998 90 123 45 67", status: "active" },
  { id: 2, name: "Sardor Aliyev", category: "Elektrik", phone: "+998 93 987 65 43", status: "active" },
];

const MOCK_ACTIVITY = [
  { id: 1, client: "Jasur", phone: "+998991112233", category: "Santexnik", time: "10 min oldin" },
  { id: 2, client: "Malika", phone: "+998904445566", category: "Remont", time: "1 soat oldin" },
];

export default function SuperAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'masters' | 'add' | 'activity'>('masters');

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-amber-500" />
              Super Admin Panel
            </h1>
            <p className="text-stone-400 mt-1">Platformani boshqarish markazi</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-stone-400 hover:text-white px-4 py-2 rounded-xl bg-[#1A1614] hover:bg-[#231F1C] border border-stone-800 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Chiqish
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap bg-[#231F1C] p-1 rounded-2xl mb-8 border border-stone-800 w-fit">
          <button 
            onClick={() => setActiveTab('masters')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all",
              activeTab === 'masters' ? "bg-[#1A1614] text-white shadow-sm border border-stone-800" : "text-stone-500 hover:text-white"
            )}
          >
            <Users className="w-4 h-4" /> Ustalar ro'yxati
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all",
              activeTab === 'add' ? "bg-[#1A1614] text-white shadow-sm border border-stone-800" : "text-stone-500 hover:text-white"
            )}
          >
            <UserPlus className="w-4 h-4" /> Yangi usta qo'shish
          </button>
          <button 
            onClick={() => setActiveTab('activity')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all",
              activeTab === 'activity' ? "bg-[#1A1614] text-white shadow-sm border border-stone-800" : "text-stone-500 hover:text-white"
            )}
          >
            <Activity className="w-4 h-4" /> Buyurtmalar
          </button>
        </div>

        {/* Content */}
        <div className="bg-[#1A1614] border border-stone-800 rounded-3xl p-6 md:p-8 shadow-2xl">
          
          {/* TAB: Masters List */}
          {activeTab === 'masters' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Barcha ustalar</h2>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input type="text" placeholder="Qidirish..." className="w-full bg-[#181513] border border-stone-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400 text-sm">
                      <th className="pb-3 font-medium">Ism-Familiya</th>
                      <th className="pb-3 font-medium">Kategoriya</th>
                      <th className="pb-3 font-medium">Telefon</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Harakatlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_MASTERS.map(master => (
                      <tr key={master.id} className="border-b border-stone-800/50">
                        <td className="py-4 text-white font-medium">{master.name}</td>
                        <td className="py-4 text-stone-400">{master.category}</td>
                        <td className="py-4 text-stone-400">{master.phone}</td>
                        <td className="py-4">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Faol
                          </span>
                        </td>
                        <td className="py-4 flex justify-end gap-2">
                          <button className="p-2 bg-[#231F1C] hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-red-950/20 hover:bg-red-900/40 rounded-lg text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: Add New Master */}
          {activeTab === 'add' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-white mb-6">Yangi usta ro'yxatdan o'tkazish</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1.5">To'liq ism-familiya</label>
                    <input type="text" className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="Masalan: Alisher Vahobov" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1.5">Kategoriya</label>
                    <select className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 appearance-none">
                      <option value="">Tanlang...</option>
                      <option value="santexnik">Santexnik</option>
                      <option value="elektrik">Elektrik</option>
                      <option value="mebelchi">Mebel ustasi</option>
                      <option value="remont">Remont va pardozlash</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1.5">Telefon raqam</label>
                    <input type="tel" className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="+998" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1.5">Telegram Username</label>
                    <input type="text" className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="@username" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1.5">Manzil / Tuman</label>
                    <input type="text" className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="Chilonzor tumani" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1.5">Boshlang'ich narx (so'm)</label>
                    <input type="number" className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="100 000" />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-800">
                  <h3 className="text-lg font-bold text-white mb-4">Kirish ma'lumotlari (Usta uchun)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-400 mb-1.5">Login</label>
                      <input type="text" className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="Login yarating" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-400 mb-1.5">Parol</label>
                      <input type="text" className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="Parol yarating" />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-orange-500/25">
                    Ustaniki ro'yxatdan o'tkazish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Global Activity */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Platformadagi so'nggi buyurtmalar</h2>
              <div className="grid gap-4">
                {MOCK_ACTIVITY.map(act => (
                  <div key={act.id} className="bg-[#181513] border border-stone-700/50 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                        <Activity className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{act.category} ustasi kerak</h4>
                        <p className="text-sm text-stone-400">Mijoz: {act.client} • {act.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-stone-500">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
