"use client";

import React from "react";
import { XCircle, FileText } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface TermsModalProps {
  onClose: () => void;
}

export default function TermsModal({ onClose }: TermsModalProps) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 border border-stone-800/80 rounded-3xl w-full max-w-3xl p-6 md:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors bg-zinc-900 rounded-full p-2"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">{t.terms?.title || "Ommaviy Oferta va Shartlar"}</h2>
        </div>

        <div className="text-stone-300 space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <section>
            <h3 className="text-lg font-bold text-white mb-2">1. Umumiy qoidalar</h3>
            <p className="text-sm leading-relaxed text-stone-400">
              Ushbu Ommaviy Oferta (keyingi o'rinlarda "Oferta") UstaGo platformasi (keyingi o'rinlarda "Platforma") va foydalanuvchilar o'rtasidagi munosabatlarni tartibga soladi. Platformadan foydalanish, jumladan PRO xizmatlarini xarid qilish orqali siz ushbu shartlarga to'liq rozi bo'lasiz.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-2">2. Xizmat mohiyati va PRO tarif</h3>
            <p className="text-sm leading-relaxed text-stone-400 mb-2">
              PRO tarif ustaning Platformadagi reytingi va qidiruv natijalaridagi o'rnini oshirish, profilingizni moslashtirish kabi qo'shimcha imkoniyatlarni taqdim etadi. Platforma bevosita mijoz va usta o'rtasidagi shartnomaviy munosabatlarga aralashmaydi.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-2">3. To'lov va qaytarib berish tartibi</h3>
            <p className="text-sm leading-relaxed text-stone-400">
              PRO xizmati to'lov amalga oshirilgandan so'ng 5-15 daqiqa ichida faollashtiriladi. Xizmat darhol ko'rsatilishi (raqamli obuna) sababli, faollashtirilgan muddat uchun to'langan mablag'lar foydalanuvchiga qaytarilmaydi. Usta istalgan vaqtda keyingi obuna muddatini uzaytirmaslik huquqiga ega.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-2">4. Javobgarlikni cheklash</h3>
            <p className="text-sm leading-relaxed text-stone-400">
              Platforma usta tomonidan taqdim etilgan xizmatlar sifati, xavfsizligi yoki qonuniyligi uchun bevosita javobgar emas. Mijoz va Usta bajarilgan ishlar va to'lovlar borasida mustaqil kelishuvga erishadilar.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-2">5. Obunani bekor qilish</h3>
            <p className="text-sm leading-relaxed text-stone-400">
              Obunani bekor qilish ustaning shaxsiy kabinetida (Master Dashboard) amalga oshirilishi mumkin. Bekor qilingan taqdirda, joriy davr oxirigacha PRO imtiyozlari saqlanib qoladi (agar boshqacha kelishilmagan bo'lsa).
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-medium transition-colors"
          >
            Tushunarli, Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
