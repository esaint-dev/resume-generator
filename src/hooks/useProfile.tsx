import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/profile";

export function useProfile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user");

      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Get user metadata from auth
        const userMetadata = user.user_metadata;
        
        // Create initial profile with Google data if available
        const initialProfile = {
          id: user.id,
          display_name_preference: 'full_name',
          background_color: '#452095',
          full_name: userMetadata?.full_name || null,
          avatar_url: userMetadata?.avatar_url || null,
          email: user.email || null
        };

        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([initialProfile])
          .select()
          .maybeSingle();

        if (insertError) throw insertError;
        data = newProfile;
      }

      setProfile(data);
    } catch (error) {
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(updates: Partial<Profile>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  return {
    profile,
    loading,
    updateProfile
  };
}