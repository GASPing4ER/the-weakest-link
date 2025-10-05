"use server";
// app/actions/auth.ts
import { createClient } from "@/utils/supabase/server";

interface RegisterProps {
  email: string;
  password: string;
  name: string;
}

export async function register({ email, password, name }: RegisterProps) {
  const supabase = await createClient();

  // 1. Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  const userId = data.user?.id;
  if (!userId) throw new Error("Failed to create user");

  // 2. Insert profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    email,
    name,
    status: "waitlist",
    joined_at: new Date().toISOString(),
  });

  if (profileError) throw profileError;

  // 3. Auto sign in after registration
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) throw signInError;

  return { id: userId, email, name };
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  // Fetch full profile from your "profiles" table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError) throw profileError;

  return profile;
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
