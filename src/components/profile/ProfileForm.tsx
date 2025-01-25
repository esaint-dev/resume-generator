import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/types/profile";

interface ProfileFormProps {
  profile: Profile;
  onSubmit: (formData: FormData) => void;
}

export default function ProfileForm({ profile, onSubmit }: ProfileFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
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
  );
}