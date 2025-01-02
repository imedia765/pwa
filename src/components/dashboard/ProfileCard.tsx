import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Profile } from "@/integrations/supabase/types";

interface ProfileCardProps {
  profile: Profile | null;
  isLoading: boolean;
}

export const ProfileCard = ({ profile, isLoading }: ProfileCardProps) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No profile data found</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback>
              {profile.full_name?.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">{profile.full_name}</h2>
            <Badge variant={profile.status === 'active' ? 'success' : 'secondary'}>
              {profile.status || 'Inactive'}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Member Number</p>
            <p className="font-medium">{profile.member_number}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{profile.email || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{profile.phone || '—'}</p>
          </div>
          {profile.address && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">
                {profile.address}
                {profile.town && `, ${profile.town}`}
                {profile.postcode && ` ${profile.postcode}`}
              </p>
            </div>
          )}
          {profile.membership_type && (
            <div>
              <p className="text-sm text-muted-foreground">Membership Type</p>
              <p className="font-medium capitalize">{profile.membership_type}</p>
            </div>
          )}
          {profile.date_of_birth && (
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">
                {new Date(profile.date_of_birth).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};