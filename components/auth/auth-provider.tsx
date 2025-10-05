"use client";

import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useState,
} from "react";
import { useAppStore } from "@/lib/store";
import type { Profile } from "@/lib/types";
import {
  signInWithEmail,
  signOut as serverSignOut,
  register as serverRegister,
} from "@/actions/auth";
import { createClient } from "@/utils/supabase/client";

interface AuthContextType {
  user: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (props: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { currentProfile, setCurrentProfile, isLoading, setLoading } =
    useAppStore();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (profile) setCurrentProfile(profile);
      }
    } catch (err) {
      console.error("Failed to restore session:", err);
    } finally {
      setAuthLoading(false);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const profile = await signInWithEmail(email, password);
      setCurrentProfile(profile);
    } catch (err: any) {
      throw new Error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async ({
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name: string;
  }) => {
    setLoading(true);
    try {
      const profile = await serverRegister({ email, password, name });
      setCurrentProfile(profile);
    } catch (err: any) {
      throw new Error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await serverSignOut();
      setCurrentProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentProfile,
        signIn,
        register,
        signOut,
        isLoading: authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
