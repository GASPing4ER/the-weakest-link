// lib/hooks/useWaitlist.ts
"use client";

import { getWaitlistProfiles } from "@/lib/supabase-actions";
import { Profile } from "@/lib/types";
import { useEffect, useState } from "react";

export function useWaitlist() {
  const [waitlist, setWaitlist] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchWaitlist() {
      setLoading(true);
      const { data, error } = await getWaitlistProfiles();
      if (isMounted) {
        if (error) {
          setError(error);
        } else {
          setWaitlist(data || []);
        }
        setLoading(false);
      }
    }

    fetchWaitlist();

    return () => {
      isMounted = false;
    };
  }, []);

  return { waitlist, loading, error };
}
