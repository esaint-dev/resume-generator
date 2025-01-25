import type { Json } from "@/integrations/supabase/types";

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  phone: string | null;
  social_links: Json | null;
  background_image: string | null;
  background_color: string | null;
  display_name_preference: string;
  pinned_content: Json | null;
  collections: Json | null;
  created_at: string;
  updated_at: string;
}