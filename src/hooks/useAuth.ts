"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { downgradeMasterIfExpired } from "@/lib/proService";

export interface UserProfile {
  id: string | number;
  name: string;
  phone?: string;
  category?: string;
  is_pro?: boolean;
  pro_plan?: string;
  pro_expires_at?: string;
  avatar_url?: string;
  image?: string;
  [key: string]: any;
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      try {
        const localMaster = localStorage.getItem("usta_current_master");
        if (localMaster) {
          let parsed = JSON.parse(localMaster);

          // Check if local data is expired
          parsed = await downgradeMasterIfExpired(parsed);
          setUser(parsed);

          if (parsed.id) {
            const { data: dbData } = await supabase
              .from("ustalar")
              .select("*")
              .eq("id", parsed.id)
              .maybeSingle();

            if (dbData) {
              const updatedData = await downgradeMasterIfExpired(dbData);
              setUser(updatedData);
              localStorage.setItem("usta_current_master", JSON.stringify(updatedData));
            }
          }
        }
      } catch (err) {
        console.error("useAuth init error:", err);
      } finally {
        setLoading(false);
      }
    };

    initUser();

    const handleStorageChange = () => initUser();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth_changed", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth_changed", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-realtime-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ustalar",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Realtime status updated:", payload.new);
          setUser((prev) => {
            if (!prev) return (payload.new as UserProfile) || null;
            const updated: UserProfile = { ...prev, ...payload.new };
            localStorage.setItem("usta_current_master", JSON.stringify(updated));
            window.dispatchEvent(new Event("auth_changed"));
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { user, setUser, loading };
}
