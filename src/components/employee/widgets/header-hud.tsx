'use client';

import { Card, CardContent } from '@/components/ui/card';
import PointsIcon from './points-widget';
import LevelIcon from './level-widget';
import { ProfilePic } from './user-profile';
import { ConditionalNotifications } from '../conditional-notifications';
import XPProgress from '../attendance/xp-points';
import ProfileLevelCard from '../attendance/profile-level';

export default function HeaderHUD() {
  return (
    <div className="flex h-24 min-w-300 bg-linear-to-b from-muted-foreground/50 to-amber-900/0 font-jersey">
      {/* Left column: 20%, justify-start */}
      <Card className="w-[20%] flex items-center justify-start bg-transparent shadow-none border-none">
        <CardContent className="flex items-center justify-start p-0">
          <ProfileLevelCard />
        </CardContent>
      </Card>

      {/* Middle column: 60%, centered */}
      <Card className="w-[60%] flex items-center justify-center p-4 bg-transparent shadow-none border-none">
        <CardContent className="flex items-center justify-center">
          <XPProgress />
        </CardContent>
      </Card>

      <Card className="w-[10%] flex items-center justify-center p-4 bg-transparent shadow-none border-none">
        <CardContent className="flex items-center justify-center">
          <ConditionalNotifications hideOnMercado />
        </CardContent>
      </Card>
      {/* Right column: 20%, justify-end */}
      <Card className="w-[10%] flex items-center justify-end p-4 bg-transparent shadow-none border-none">
        <CardContent className="flex items-center justify-end">
          <ProfilePic />
        </CardContent>
      </Card>
    </div>
  );
}
