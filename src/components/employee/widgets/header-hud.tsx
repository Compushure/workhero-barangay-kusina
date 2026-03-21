'use client';

import { ConditionalNotifications } from '../conditional-notifications';
import XPProgress from '../attendance/xp-points';
import ProfileLevelCard from '../attendance/profile-level';
import PointsCardWidget from './points-card-widget';

export default function HeaderHUD() {
  return (
    <div className="flex min-h-24 min-w-300 items-center gap-3 bg-linear-to-b from-muted-foreground/50 to-amber-900/0 px-5 font-jersey">
      <div className="shrink-0">
        <XPProgress />
      </div>

      <div className="min-w-0 flex-1">
        <PointsCardWidget />
      </div>

      <div className="shrink-0">
        <ConditionalNotifications hideOnMercado />
      </div>

      <div className="shrink-0">
        <ProfileLevelCard />
      </div>
    </div>
  );
}
