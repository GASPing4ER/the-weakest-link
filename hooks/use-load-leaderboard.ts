import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { getLeaderboard, getProfiles } from "@/lib/supabase-actions";

export function useLoadLeaderboardAndProfiles() {
  const { setLeaderboard, setProfiles } = useAppStore();

  useEffect(() => {
    async function fetchData() {
      const { data: leaderboardData, error: lbError } = await getLeaderboard();
      if (leaderboardData) setLeaderboard(leaderboardData);

      const { data: profilesData, error: profilesError } = await getProfiles();
      if (profilesData) setProfiles(profilesData);

      console.log("Leaderboard:", leaderboardData);
      console.log("Profiles:", profilesData);
    }

    fetchData();
  }, [setLeaderboard, setProfiles]);
}
