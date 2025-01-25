import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Camera, Link as LinkIcon, Edit, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Json } from "@/integrations/supabase/types";

interface Profile {
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

export default function Profile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);

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
        // Create a new profile if none exists
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([
            { 
              id: user.id,
              display_name_preference: 'full_name',
              background_color: '#452095'
            }
          ])
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

  async function updateProfile(updates: Partial<Profile>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => ({ ...prev, ...updates }));
      toast({
        title: "Profile updated successfully",
      });
      setEditing(false);
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  }

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

      await updateProfile({ avatar_url: publicUrl });
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

      await updateProfile({ background_image: publicUrl });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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

      <Tabs defaultValue="profile" className="max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="pinned">Pinned Content</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your public profile information
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setEditing(!editing)}
                className="shrink-0"
              >
                <Edit className="h-4 w-4 mr-2" />
                {editing ? "Cancel" : "Edit Profile"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {editing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    updateProfile({
                      username: formData.get("username") as string,
                      full_name: formData.get("full_name") as string,
                      bio: formData.get("bio") as string,
                      website: formData.get("website") as string,
                      phone: formData.get("phone") as string,
                      display_name_preference: formData.get(
                        "display_name_preference"
                      ) as string,
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        defaultValue={profile?.username || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        defaultValue={profile?.full_name || ""}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      defaultValue={profile?.bio || ""}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        defaultValue={profile?.website || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        defaultValue={profile?.phone || ""}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_name_preference">
                      Display Name Preference
                    </Label>
                    <select
                      id="display_name_preference"
                      name="display_name_preference"
                      defaultValue={profile?.display_name_preference || "full_name"}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="full_name">Full Name</option>
                      <option value="first_name">First Name Only</option>
                      <option value="username">Username Only</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full">
                    Save Changes
                  </Button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">
                      {profile?.full_name || "No name set"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      @{profile?.username || "username"}
                    </p>
                  </div>

                  {profile?.bio && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Bio</h4>
                      <p className="text-sm text-muted-foreground">
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    {profile?.website && (
                      <div className="flex items-center space-x-2">
                        <LinkIcon className="h-4 w-4" />
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                    {profile?.phone && (
                      <div className="flex items-center space-x-2">
                        <LinkIcon className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">
                          {profile.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections">
          <Card>
            <CardHeader>
              <CardTitle>Collections</CardTitle>
              <CardDescription>
                Organize your content into collections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Collections feature coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pinned">
          <Card>
            <CardHeader>
              <CardTitle>Pinned Content</CardTitle>
              <CardDescription>
                Highlight your important content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pinned content feature coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}