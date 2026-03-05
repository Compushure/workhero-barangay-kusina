import { useEffect, useMemo, useState } from 'react';

interface UseSidebarContentAreaOptions {
  sidebarSelector?: string;
}

export function useSidebarContentArea(options?: UseSidebarContentAreaOptions) {
  const sidebarSelector = options?.sidebarSelector ?? 'aside';
  const [sidebarWidth, setSidebarWidth] = useState(0);

  useEffect(() => {
    const sidebar = document.querySelector(sidebarSelector);
    if (!sidebar) return;

    const updateSidebarWidth = () => {
      setSidebarWidth(sidebar.getBoundingClientRect().width);
    };

    updateSidebarWidth();

    const resizeObserver = new ResizeObserver(updateSidebarWidth);
    resizeObserver.observe(sidebar);
    window.addEventListener('resize', updateSidebarWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSidebarWidth);
    };
  }, [sidebarSelector]);

  return useMemo(
    () => ({
      sidebarWidth,
      contentAreaStyle: {
        left: `${sidebarWidth}px`,
        width: `calc(100vw - ${sidebarWidth}px)`,
      } as const,
    }),
    [sidebarWidth]
  );
}
