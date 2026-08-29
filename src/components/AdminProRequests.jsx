"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  Send, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle,
  Sparkles 
} from "lucide-react";
import { 
  getPendingProRequests, 
  approveProRequest, 
  rejectProRequest, 
  subscribeToPendingRequests 
} from "@/lib/proService";

export default function AdminProRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  // Custom Toast xabarnomasini ko'rsatish
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // So'rovlarni Supabase-dan yuklash
  const fetchRequests = async () => {
    setLoading(true);
    const result = await getPendingProRequests();
    if (result.success) {
      setRequests(result.data || []);
    } else {
      showToast("error", result.error || "So'rovlarni yuklashda xatolik yuz berdi.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    // Realtime tinglovchini yoqish - Admin sahifada o'tirganda yangi so me so'rov tushsa avto yangilanadi
    const unsubscribe = subscribeToPendingRequests(() => {
      fetchRequests();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Admin "Tasdiqlash" (Approve) tugmasini bosganda
  const handleApprove = async (req) => {
    if (!req || !req.id || !req.user_id) {
      showToast("error", "So'rov ma'lumotlari to'liq emas!");
      return;
    }

    setProcessingId(req.id);

    try {
      // 30 kunlik PRO status berish
      const res = await approveProRequest({
        requestId: req.id,
        userId: req.user_id,
        durationDays: 30,
      });

      if (res.success) {
        showToast("success", res.message || "PRO status muvaffaqiyatli tasdiqlandi!");
        // Ro'yxatdan olib tashlash
        setRequests((prev) => prev.filter((item) => item.id !== req.id));
      } else {
        showToast("error", res.error || "Tasdiqlashda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error("Tasdiqlash xatosi:", err);
      showToast("error", "Kutilmagan xatolik yuz berdi: " + (err.message || err));
    } finally {
      setProcessingId(null);
    }
  };

  // Admin "Rad etish" (Reject) tugmasini bosganda
  const handleReject = async (requestId) => {
    if (!requestId) return;

    setProcessingId(requestId);

    try {
      const res = await rejectProRequest({ requestId });
      if (res.success) {
        showToast("success", "So'rov rad etildi.");
        setRequests((prev) => prev.filter((item) => item.id !== requestId));
      } else {
        showToast("error", res.error || "Rad etishda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error("Rad etish xatosi:", err);
      showToast("error", "Xatolik yuz berdi: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center space-x-3 px-5 py-3.5 rounded-xl shadow-2xl transition-all duration-300 text-white font-medium ${
            toast.type === "success"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400/30"
              : "bg-gradient-to-r from-rose-600 to-red-600 border border-rose-400/30"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-6 h-6 text-white shrink-0 animate-bounce" />
          ) : (
            <AlertCircle className="w-6 h-6 text-white shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl backdrop-blur-md shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-xl text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              PRO So'rovlarni Boshqarish
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                Admin Approval
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Foydalanuvchilardan kelib tushgan PRO obuna so'rovlarini ko'rish va bir bosingda tasdiqlash
            </p>
          </div>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/80">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-3" />
          <p className="text-slate-400 text-sm font-medium">So'rovlar yuklanmoqda...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/80 text-center px-4">
          <div className="w-14 h-14 bg-slate-800/60 rounded-full flex items-center justify-center text-slate-500 mb-4 border border-slate-700/50">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">Kutilayotgan so'rovlar yo'q</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            Ayni paytda tasdiqlanishi kerak bo'lgan PRO so'rovlari mavjud emas. Yangi so'rovlar tushsa avtomatik ko'rinadi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => {
            const profile = req.profiles || {};
            const isProcessing = processingId === req.id;
            const createdAtDate = req.created_at
              ? new Date(req.created_at).toLocaleString("uz-UZ", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Yaqinda";

            return (
              <div
                key={req.id}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* User Info */}
                <div className="flex items-start space-x-4">
                  <div className="relative shrink-0">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || "User"}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold text-lg">
                        {(profile.full_name || profile.email || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-slate-900" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-semibold text-white">
                        {profile.full_name || "Ismsiz foydalanuvchi"}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                        Pending
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center space-x-2">
                      <span>{profile.email || "Email yo'q"}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-500">ID: {req.user_id}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                      {req.telegram_username && (
                        <a
                          href={`https://t.me/${req.telegram_username.replace("@", "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>@{req.telegram_username.replace("@", "")}</span>
                        </a>
                      )}
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{createdAtDate}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={isProcessing}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-300 text-sm font-medium transition border border-slate-700 hover:border-red-500/30 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rad etish</span>
                  </button>

                  <button
                    onClick={() => handleApprove(req)}
                    disabled={isProcessing}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:transform-none"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    )}
                    <span>Tasdiqlash (+30 kun)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
