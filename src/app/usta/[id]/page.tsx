import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, MapPin, CheckCircle2, Phone, MessageCircle, ChevronLeft } from "lucide-react";

export default async function UstaProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Mock data for master profile
  const master = {
    id,
    name: "Alisher Usta",
    category: "Santexnik",
    rating: 4.8,
    reviews: 124,
    experience: "8 yil",
    price: "50,000",
    verified: true,
    image: "https://i.pravatar.cc/150?u=alisher",
    location: "Toshkent, Yunusobod",
    about: "Assalomu alaykum! Men 8 yillik tajribaga ega santexnikman. Har qanday murakkablikdagi santexnika ishlarini tez va sifatli bajaraman.",
    portfolio: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1607472586893-edb57cb3b4e1?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400",
    ],
    services: [
      { name: "Kran almashtirish", price: "50,000" },
      { name: "Unitaz o'rnatish", price: "150,000" },
      { name: "Trubalarni tozalash", price: "100,000" },
      { name: "Suv isitgich (Ariston) o'rnatish", price: "250,000" },
    ]
  };

  return (
    <div className="max-w-3xl mx-auto bg-white min-h-screen pb-24 md:pb-8">
      {/* Mobile Back Header */}
      <div className="md:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center">
        <Link href="/" className="p-2 -ml-2 text-slate-600">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <span className="font-semibold text-slate-900 ml-2">Profil</span>
      </div>

      {/* Header Info */}
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-slate-50 flex-shrink-0 shadow-sm mx-auto md:mx-0">
            <Image
              src={master.image}
              alt={master.name}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{master.name}</h1>
              {master.verified && (
                <ShieldCheck className="w-6 h-6 text-green-500" />
              )}
            </div>
            
            <p className="text-lg text-slate-600 font-medium">{master.category}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 pt-1">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-slate-700">{master.rating}</span>
                <span>({master.reviews} ta sharh)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{master.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-slate-700">Tajriba:</span> {master.experience}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button className="flex-1 bg-[#EA580C] hover:bg-[#c2410c] text-white py-3.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
            <MessageCircle className="w-5 h-5" />
            Telegram orqali bog'lanish
          </button>
          <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
            <Phone className="w-5 h-5" />
            Qo'ng'iroq qilish
          </button>
        </div>

        {/* About */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Usta haqida</h2>
          <p className="text-slate-600 leading-relaxed text-sm md:text-base">
            {master.about}
          </p>
        </div>

        {/* Portfolio */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Bajargan ishlari</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
            {master.portfolio.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                <Image src={img} alt="Portfolio" fill className="object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Price List */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Xizmat narxlari</h2>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
            {master.services.map((service, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="font-medium text-slate-700 text-sm md:text-base">{service.name}</span>
                </div>
                <span className="font-bold text-slate-900">{service.price} so'm</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
