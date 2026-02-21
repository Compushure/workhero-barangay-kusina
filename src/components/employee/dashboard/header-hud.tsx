'use client';

import { Card, CardContent } from '@/components/ui/card';
import PointsIcon from './points-widget';
import LevelIcon from './level-widget';
import { ProfilePic } from './user-profile';

export default function HeaderHUD() {
  return (
    <div className="flex h-24 min-w-160 bg-linear-to-b from-muted-foreground/50 to-amber-900/0">
      {/* Left column: 20%, justify-start */}
      <Card className="w-[20%] flex items-center justify-start bg-transparent shadow-none border-none">
        <CardContent className="flex items-center justify-start p-0">
          <PointsIcon />
        </CardContent>
      </Card>

      {/* Middle column: 60%, centered */}
      <Card className="w-[60%] flex items-center justify-center p-4 bg-transparent shadow-none border-none">
        <CardContent className="flex items-center justify-center">
          <LevelIcon />
        </CardContent>
      </Card>

      {/* Right column: 20%, justify-end */}
      <Card className="w-[20%] flex items-center justify-end p-4 bg-transparent shadow-none border-none">
        <CardContent className="flex items-center justify-end">
          <ProfilePic />
        </CardContent>
      </Card>
    </div>
  );
}
