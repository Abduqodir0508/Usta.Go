"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  ChevronLeft,
  Send,
  MessageSquare
} from "lucide-react";
import { useParams, notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AvatarImage } from "@/components/ui/AvatarImage";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

export default function UstaProfile() {
  const params = useParams();
  const id = params.id as string;
  const [master, setMaster] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Reviews state (Talab 4)
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newClientName, setNewClientName] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchMasterAndReviews = async () => {
    try {
      // 1. Fetch Master Data
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

      // 2. Fetch Reviews from Supabase
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('master_id', id)
        .order('created_at', { ascending: false });

      const currentReviews = reviewsData || [];

      // Calculate rating average if reviews exist
      let avgRating = found.rating || 5.0;
      if (currentReviews.length > 0) {
        const sum = currentReviews.reduce((acc: number, item: any) => acc + (item.rating || 5), 0);
        avgRating = Number((sum / currentReviews.length).toFixed(1));
      }

      setMaster({
        ...found,
        rating: avgRating,
        reviewsCount: currentReviews.length,
        experience: found.experience || "1 yil+",
        about: found.bio || "Assalomu alaykum! Men o'z ishimning ustasiman. Har qanday murakkablikdagi ishlarni tez va sifatli bajaraman.",
        image: found.avatar_url || found.image || null,
        portfolio: portfolioList,
        services: [
          { name: "Asosiy xizmat", price: found.price ? `${found.price}` : "Kelishuv asosida" },
        ]
      });

      setReviewsList(currentReviews);
    } catch (e) {
      console.error("Fetch profile error:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterAndReviews();
  }, [id]);

  // Sharh qoldirish funksiyasi (Talab 4)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setReviewMessage({ type: 'error', text: "Iltimos, sharh matnini kiriting!" });
      return;
    }

    setIsSubmittingReview(true);
    setReviewMessage(null);

    const clientName = newClientName.trim() || "Mijoz";

    try {
      // 1. Insert review into Supabase `reviews` table
      const { error: insertErr } = await supabase
        .from('reviews')
        .insert([
          {
            master_id: id,
            client_name: clientName,
            rating: newRating,
            comment: newComment.trim(),
            created_at: new Date().toISOString()
          }
        ]);

      if (insertErr) throw insertErr;

      // 2. Recalculate average rating
      const updatedReviews = [
        { client_name: clientName, rating: newRating, comment: newComment.trim(), created_at: new Date().toISOString() },
        ...reviewsList
      ];
      const newSum = updatedReviews.reduce((acc, item) => acc + item.rating, 0);
      const newAvg = Number((newSum / updatedReviews.length).toFixed(1));

      // 3. Update master rating in `ustalar` table
      await supabase.from('ustalar').update({
        rating: newAvg,
        reviews_count: updatedReviews.length
      }).eq('id', id);

      setReviewsList(updatedReviews);
      setMaster((prev: any) => ({
        ...prev,
        rating: newAvg,
        reviewsCount: updatedReviews.length
      }));

      setNewComment("");
      setNewClientName("");
      setNewRating(5);
      setReviewMessage({ type: 'success', text: "Sharhingiz muvaffaqiyatli saqlandi! Rahmat." });
    } catch (err: any) {
      console.error("Review submit error:", err);
      setReviewMessage({ type: 'error', text: "Sharh saqlashda xatolik yuz berdi: " + (err.message || err) });
    } finally {
      setIsSubmittingReview(false);
    }
  };

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

      {/* Banner (PRO Masters Custom Banner) */}
      <div className="w-full h-32 md:h-48 rounded-b-3xl relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">
        {master.banner_url ? (
          <img src={master.banner_url} alt="Banner" className="w-full h-full object-cover" />
        ) : master.banner_color ? (
          <div className={`w-full h-full ${master.banner_color}`} />
        ) : null}
      </div>

      {/* Header Info */}
      <div className="p-4 md:p-8 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-background bg-surface flex-shrink-0 shadow-2xl mx-auto md:mx-0 flex items-center justify-center">
            <AvatarImage
              src={master.image}
              alt={master.name || "Usta"}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2 pt-2 md:pt-14">
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-1.5">
                {master.name}
                {master.is_pro && <VerifiedBadge className="w-6 h-6" />}
              </h1>
              {master.is_pro && (
                <span className="bg-orange-500/20 text-orange-500 text-xs font-bold px-2.5 py-0.5 rounded-full border border-orange-500/30 uppercase tracking-wider">
                  PRO
                </span>
              )}
            </div>
            
            <p className="text-lg text-amber-500 font-medium">{master.category}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-1 bg-surface px-3 py-1 rounded-full border border-border-color shadow-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-foreground">{master.rating}</span>
                <span>({master.reviewsCount || reviewsList.length} ta sharh)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-amber-500/70" />
                <span>{master.address || master.location || "Toshkent"}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-foreground">Tajriba:</span> {master.experience || "1 yil+"}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          {(() => {
            const rawTg = master.telegram || master.telegram_username || "";
            const cleanTg = rawTg.replace(/^@/, "").trim();
            const tgUrl = cleanTg ? `https://t.me/${cleanTg}` : "https://t.me/UstaGo_pro_bot";
            return (
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20"
              >
                <MessageCircle className="w-5 h-5" />
                Telegram orqali bog'lanish
              </a>
            );
          })()}
          <a href={`tel:${master.phone || master.phone_number || ''}`} className="flex-1 bg-surface-hover hover:bg-slate-200 dark:hover:bg-slate-800 border border-border-color text-foreground py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors">
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
            <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border-color pb-2 flex items-center justify-between">
              <span>Bajargan ishlari</span>
              <span className="text-xs font-normal text-muted-foreground">{master.portfolio.length} ta rasm</span>
            </h2>
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

        {/* REVIEWS & RATING SECTION (Talab 4) */}
        <div className="mt-12 pt-8 border-t border-border-color space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                Sharhlar va Baholar ⭐
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Foydalanuvchilarning ushbu usta haqidagi otziv va baholari
              </p>
            </div>

            <div className="flex items-center gap-3 bg-surface p-3.5 rounded-2xl border border-border-color shrink-0">
              <div className="text-3xl font-extrabold text-amber-500">
                {master.rating}
              </div>
              <div className="space-y-0.5">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(master.rating) ? "fill-amber-400" : "text-slate-600"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {reviewsList.length} ta sharh asosida
                </p>
              </div>
            </div>
          </div>

          {/* Add Review Form */}
          <div className="bg-surface border border-border-color p-5 sm:p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              Sharh qoldirish
            </h3>

            {reviewMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold ${
                  reviewMessage.type === 'success'
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {reviewMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Bahoingizni tanlang:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= newRating ? "fill-amber-400 text-amber-400" : "text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-amber-400 ml-2">{newRating} yulduz</span>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Ismingiz (ixtiyoriy)"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border-color rounded-xl text-foreground text-sm outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder="Ustanining xizmat sifati haqida sharhingizni yozing..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border-color rounded-xl text-foreground text-sm outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Sharhni yuborish</span>
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviewsList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Hali sharhlar qoldirilmagan. Birinchi bo'lib sharh qoldiring!
              </p>
            ) : (
              reviewsList.map((rev, idx) => (
                <div key={idx} className="bg-surface border border-border-color p-4 sm:p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground text-sm">
                      {rev.client_name || "Mijoz"}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString("uz-UZ") : "Yaqinda"}
                    </span>
                  </div>

                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= (rev.rating || 5) ? "fill-amber-400" : "text-slate-600"}`}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
