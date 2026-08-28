"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Activity, Search, Shield, Trash2, Edit2, LogOut, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const INITIAL_MASTERS: any[] = [];
const MOCK_ACTIVITY: any[] = [];

export default function SuperAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'masters' | 'add' | 'activity'>('masters');
  
  const [mastersList, setMastersList] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState("");

  const [editingMaster, setEditingMaster] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "", category: "", phone: "", telegram: "", address: "", price: "", login: "", password: ""
  });

  useEffect(() => {
    const stored = localStorage.getItem("usta_masters");
    if (stored) {
      setMastersList(JSON.parse(stored));
    } else {
      localStorage.setItem("usta_masters", JSON.stringify(INITIAL_MASTERS));
      setMastersList(INITIAL_MASTERS);
    }
  }, []);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = () => {
    router.push("/");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAddMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.phone || !formData.login || !formData.password) {
      alert("Iltimos, barcha majburiy maydonlarni to'ldiring!");
      return;
    }

    setIsUploading(true);
    let avatarUrl = "";

    try {
      if (avatarFile) {
        const fileName = `avatars/${Date.now()}_${avatarFile.name.replace(/\s+/g, '_')}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('ustago-media')
          .upload(fileName, avatarFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('ustago-media')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }
    } catch (error: any) {
      console.error("Storage upload error:", error);
      alert('Rasm yuklashda xatolik yuz berdi!');
      setIsUploading(false);
      return;
    }

    const newMaster = {
      id: Date.now(),
      ...formData,
      image: avatarUrl || undefined,
      status: "active",
      rating: 5.0
    };

    const updatedMasters = [...mastersList, newMaster];
    setMastersList(updatedMasters);
    localStorage.setItem("usta_masters", JSON.stringify(updatedMasters));
    
    // Simulate Supabase global event (if we were using realtime)
    window.dispatchEvent(new Event("storage"));

    setFormData({ name: "", category: "", phone: "", telegram: "", address: "", price: "", login: "", password: "" });
    setAvatarFile(null);
    setToastMessage("Usta muvaffaqiyatli qo'shildi!");
    setIsUploading(false);
    
    setTimeout(() => {
      setToastMessage("");
      setActiveTab("masters");
    }, 2000);
  };

  const handleDeleteMaster = (id: number) => {
    if (confirm("Ushbu ustani o'chirishni xohlaysizmi?")) {
      const updated = mastersList.filter(m => m.id !== id);
      setMastersList(updated);
      localStorage.setItem("usta_masters", JSON.stringify(updated));
    }
  };

  const handleEditClick = (master: any) => {
    setEditingMaster({ ...master }); // Eski ma'lumotlarni to'liq nusxalash
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaster || !editingMaster.id) {
      console.error("PUT Xatolik: Ustaning ID'si topilmadi (undefined)");
      return;
    }

    try {
      // 1. Bazani yangilash (Bu yerda localStorage ishlatilyapti)
      const updatedList = mastersList.map(m => m.id === editingMaster.id ? editingMaster : m);
      
      // 2. State va LocalStorage ni re-fetch / update qilish
      setMastersList(updatedList);
      localStorage.setItem("usta_masters", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("storage"));

      // 3. UI modalni yopish va Toas xabar chiqarish
      setIsEditModalOpen(false);
      setEditingMaster(null);
      setToastMessage("Ma'lumotlar muvaffaqiyatli yangilandi!");
      setTimeout(() => setToastMessage(""), 2000);
    } catch (error) {
      console.error("Super Admin Edit (PUT) xatoligi:", error);
      alert("Ma'lumotlarni yangilashda xatolik yuz berdi!");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-8 bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 z-50">
          <CheckCircle2 className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

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
                <h2 className="text-xl font-bold text-white">Barcha ustalar ({mastersList.length})</h2>
                <div className="relative w-64 hidden sm:block">
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
                      <th className="pb-3 font-medium">Login</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Harakatlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mastersList.map(master => (
                      <tr key={master.id} className="border-b border-stone-800/50">
                        <td className="py-4 text-white font-medium">{master.name}</td>
                        <td className="py-4 text-stone-400 capitalize">{master.category}</td>
                        <td className="py-4 text-stone-400">{master.phone}</td>
                        <td className="py-4 text-stone-500 font-mono">{master.login}</td>
                        <td className="py-4">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Faol
                          </span>
                        </td>
                        <td className="py-4 flex justify-end gap-2">
                          <button onClick={() => handleEditClick(master)} className="p-2 bg-[#231F1C] hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteMaster(master.id)} className="p-2 bg-red-950/20 hover:bg-red-900/40 rounded-lg text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {mastersList.length === 0 && (
                  <div className="text-center py-8 text-stone-500">Ustalar yo'q. Yangi qo'shing.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Add New Master */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddMaster} className="max-w-2xl">
              <h2 className="text-xl font-bold text-white mb-6">Yangi usta ro'yxatdan o'tkazish</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1.5">Usta Rasmi (Avatar)</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-2 text-white focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600 transition-all cursor-pointer" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1.5">To'liq ism-familiya *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="Masalan: Alisher Vahobov" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1.5">Kategoriya *</label>
                    <select required name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 appearance-none">
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
                    <label className="block text-sm font-medium text-stone-400 mb-1.5">Telefon raqam *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="+998" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1.5">Telegram Username</label>
                    <input type="text" name="telegram" value={formData.telegram} onChange={handleInputChange} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="@username" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1.5">Manzil / Tuman</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="Chilonzor tumani" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1.5">Boshlang'ich narx (so'm)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="100 000" />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-800">
                  <h3 className="text-lg font-bold text-white mb-4">Kirish ma'lumotlari (Usta uchun) *</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-400 mb-1.5">Login *</label>
                      <input required type="text" name="login" value={formData.login} onChange={handleInputChange} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="Login yarating" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-400 mb-1.5">Parol *</label>
                      <input required type="text" name="password" value={formData.password} onChange={handleInputChange} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" placeholder="Parol yarating" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button disabled={isUploading} type="submit" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    {isUploading ? "Yuklanmoqda..." : "Ustaniki ro'yxatdan o'tkazish"}
                  </button>
                </div>
              </div>
            </form>
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

      {/* Tahrirlash (Edit) Modali */}
      {isEditModalOpen && editingMaster && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1A1614] border border-stone-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-white mb-6">Usta ma'lumotlarini tahrirlash</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1.5">To'liq ism *</label>
                  <input type="text" name="name" required value={editingMaster.name || ''} onChange={e => setEditingMaster({ ...editingMaster, name: e.target.value })} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1.5">Kategoriya *</label>
                  <select required name="category" value={editingMaster.category || ''} onChange={e => setEditingMaster({ ...editingMaster, category: e.target.value })} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 appearance-none">
                    <option value="santexnik">Santexnik</option>
                    <option value="elektrik">Elektrik</option>
                    <option value="mebelchi">Mebel ustasi</option>
                    <option value="remont">Remont va pardozlash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1.5">Telefon raqam *</label>
                  <input type="tel" name="phone" required value={editingMaster.phone || ''} onChange={e => setEditingMaster({ ...editingMaster, phone: e.target.value })} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1.5">Telegram Username</label>
                  <input type="text" name="telegram" value={editingMaster.telegram || ''} onChange={e => setEditingMaster({ ...editingMaster, telegram: e.target.value })} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1.5">Manzil / Tuman</label>
                  <input type="text" name="address" value={editingMaster.address || ''} onChange={e => setEditingMaster({ ...editingMaster, address: e.target.value })} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1.5">Boshlang'ich narx</label>
                  <input type="number" name="price" value={editingMaster.price || ''} onChange={e => setEditingMaster({ ...editingMaster, price: e.target.value })} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1.5">Login *</label>
                  <input type="text" name="login" required value={editingMaster.login || ''} onChange={e => setEditingMaster({ ...editingMaster, login: e.target.value })} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-1.5">Parol *</label>
                  <input type="text" name="password" required value={editingMaster.password || ''} onChange={e => setEditingMaster({ ...editingMaster, password: e.target.value })} className="w-full bg-[#181513] border border-stone-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              
              <div className="pt-6 mt-6 border-t border-stone-800 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingMaster(null); }} className="px-6 py-3 rounded-xl font-bold text-stone-400 hover:text-white bg-[#231F1C] hover:bg-stone-800 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-orange-500/25">
                  Saqlash (PUT)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
