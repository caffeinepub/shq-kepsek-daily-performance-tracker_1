import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { School, MapPin, User } from 'lucide-react';
import type { UserProfile } from '../../backend';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm text-muted-foreground">Principal Name</p>
                <p className="text-lg font-semibold">{profile.displayName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm text-muted-foreground">School Name</p>
                <p className="text-lg font-semibold">{profile.schoolName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm text-muted-foreground">Region (Wilayah)</p>
                <Badge variant="secondary" className="mt-1">
                  {profile.region.name} ({profile.region.code})
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
