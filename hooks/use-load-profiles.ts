import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { getProfiles } from "@/lib/supabase-actions";

export function useLoadProfiles() {
  const { setProfiles } = useAppStore();

  useEffect(() => {
    async function fetchData() {
      const { data: profilesData, error: profilesError } = await getProfiles();
      if (profilesData) setProfiles(profilesData);

      console.log("Profiles:", profilesData);
    }

    fetchData();
  }, [setProfiles]);
}
