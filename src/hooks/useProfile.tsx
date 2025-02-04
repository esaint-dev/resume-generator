import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Profile } from "@/types/profile";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
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
          username: user.email?.split('@')[0] || null // Create a username from email
        };

        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([initialProfile])
          .select()
          .maybeSingle();

        if (insertError) throw insertError;

        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error fetching profile",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return {
    profile,
    loading,
    updateProfile,
  };
}