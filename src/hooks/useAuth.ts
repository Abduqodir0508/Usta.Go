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
    let isMounted = true;

    const initUser = async () => {
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("usta_current_master") : null;
        if (stored) {
          let parsedData: any = null;
          try {
            parsedData = JSON.parse(stored);
          } catch (e) {
            parsedData = null;
          }

          if (parsedData && parsedData.id) {
            const userObj: UserProfile = await downgradeMasterIfExpired(parsedData);
            if (isMounted) setUser(userObj);

            // Fetch fresh data from Supabase
            let dbData: any = null;
            const { data: d1 } = await supabase
              .from("ustalar")
              .select("*")
              .eq("id", userObj.id)
              .maybeSingle();

            dbData = d1;

            if (!dbData && !isNaN(Number(userObj.id))) {
              const { data: d2 } = await supabase
                .from("ustalar")
                .select("*")
                .eq("id", Number(userObj.id))
                .maybeSingle();
              dbData = d2;
            }

            if (dbData && isMounted) {
              const updatedData: UserProfile = await downgradeMasterIfExpired(dbData);
              setUser(updatedData);
              localStorage.setItem("usta_current_master", JSON.stringify(updatedData));
            }
          }
        } else {
          if (isMounted) setUser(null);
        }
      } catch (err) {
        console.error("useAuth init error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initUser();

    const handleStorageChange = () => {
      initUser();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth_changed", handleStorageChange);

    return () => {
      isMounted = false;
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
        async (payload) => {
          if (payload.new) {
            console.log("Realtime status updated:", payload.new);
            const freshData: any = await downgradeMasterIfExpired(payload.new);
            setUser((prev) => {
              if (!prev) return (freshData as UserProfile) || null;
              const updated: UserProfile = { ...prev, ...freshData };
              localStorage.setItem("usta_current_master", JSON.stringify(updated));
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { user, setUser, loading };
}
