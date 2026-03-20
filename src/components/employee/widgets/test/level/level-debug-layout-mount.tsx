'use client';

import LevelXPDebuggerPanel from './level-xp-debugger-panel';

export default function LevelDebugLayoutMount() {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return <LevelXPDebuggerPanel />;
}
