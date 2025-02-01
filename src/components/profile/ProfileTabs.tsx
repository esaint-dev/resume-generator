import { useState } from "react";
import { Edit } from "lucide-react";
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
import ProfileForm from "./ProfileForm";
import ProfileView from "./ProfileView";
import CollectionsTab from "./CollectionsTab";
import PinnedContentTab from "./PinnedContentTab";

interface ProfileTabsProps {
  profile: Profile;
  onProfileUpdate: (updates: Partial<Profile>) => Promise<void>;
}

export default function ProfileTabs({ profile, onProfileUpdate }: ProfileTabsProps) {
  const [editing, setEditing] = useState(false);

  const handleFormSubmit = async (formData: FormData) => {
    const success = await onProfileUpdate({
      username: formData.get("username") as string,
      full_name: formData.get("full_name") as string,
      bio: formData.get("bio") as string,
      website: formData.get("website") as string,
      phone: formData.get("phone") as string,
      date_of_birth: formData.get("date_of_birth") as string,
      display_name_preference: formData.get(
        "display_name_preference"
      ) as string,
    });
    if (success) {
      setEditing(false);
    }
  };

  return (
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
                onSubmit={handleFormSubmit}
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
  );
}