import { useState } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/profile";

interface ProfileHeaderProps {
  profile: Profile;
  onProfileUpdate: (updates: Partial<Profile>) => Promise<void>;
}

export default function ProfileHeader({ profile, onProfileUpdate }: ProfileHeaderProps) {
  const { toast } = useToast();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploadingAvatar(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user");
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("profiles")
        .getPublicUrl(filePath);

      await onProfileUpdate({ avatar_url: publicUrl });
    } catch (error) {
      toast({
        title: "Error uploading avatar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function uploadBackground(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploadingBackground(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user");
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/background.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("profiles")
        .getPublicUrl(filePath);

      await onProfileUpdate({ background_image: publicUrl });
    } catch (error) {
      toast({
        title: "Error uploading background",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingBackground(false);
    }
  }

  return (
    <>
      <div
        className="relative rounded-lg overflow-hidden mb-8 h-64 bg-cover bg-center"
        style={{
          backgroundImage: profile?.background_image
            ? `url(${profile.background_image})`
            : undefined,
          backgroundColor: profile?.background_color || "#452095",
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-4 right-4">
          <Input
            type="file"
            accept="image/*"
            onChange={uploadBackground}
            className="hidden"
            id="background-upload"
            disabled={uploadingBackground}
          />
          <Label htmlFor="background-upload">
            <div className="glass-card cursor-pointer p-2 rounded-full">
              <Camera className="h-6 w-6" />
            </div>
          </Label>
        </div>
      </div>

      <div className="relative -mt-20 mb-8 flex justify-center">
        <div className="relative">
          <Avatar className="h-32 w-32 ring-4 ring-background">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <Input
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            className="hidden"
            id="avatar-upload"
            disabled={uploadingAvatar}
          />
          <Label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 glass-card cursor-pointer p-2 rounded-full"
          >
            <Camera className="h-4 w-4" />
          </Label>
        </div>
      </div>
    </>
  );
}