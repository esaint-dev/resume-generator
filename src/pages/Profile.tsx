import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Profile } from "@/types/profile";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileView from "@/components/profile/ProfileView";
import CollectionsTab from "@/components/profile/CollectionsTab";
import PinnedContentTab from "@/components/profile/PinnedContentTab";

export default function ProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);

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

      setProfile((prev) => prev ? { ...prev, ...updates } : null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No profile found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader profile={profile} onProfileUpdate={updateProfile} />

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
            <CardContent>
              {editing ? (
                <ProfileForm
                  profile={profile}
                  onSubmit={(formData) => {
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
                />
              ) : (
                <ProfileView profile={profile} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections">
          <CollectionsTab />
        </TabsContent>

        <TabsContent value="pinned">
          <PinnedContentTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}