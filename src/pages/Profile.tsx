import { Loader2 } from "lucide-react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { useProfile } from "@/hooks/useProfile";

export default function ProfilePage() {
  const { profile, loading, updateProfile } = useProfile();

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
      <ProfileTabs profile={profile} onProfileUpdate={updateProfile} />
    </div>
  );
}