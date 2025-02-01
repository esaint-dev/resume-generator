import { LinkIcon, Calendar } from "lucide-react";
import type { Profile } from "@/types/profile";

interface ProfileViewProps {
  profile: Profile;
}

export default function ProfileView({ profile }: ProfileViewProps) {
  return (
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
        {profile?.date_of_birth && (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              {new Date(profile.date_of_birth).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}