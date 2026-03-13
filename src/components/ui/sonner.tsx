'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const TOAST_COLORS = {
  background: '#765332',
  text: '#F5E8D6',
  border: '#47331F',
} as const;

const TOAST_VARIANTS = ['normal', 'success', 'error', 'warning', 'info'] as const;

function getToastStyleVariables(): React.CSSProperties {
  const variantStyles = TOAST_VARIANTS.reduce<Record<string, string>>((styles, variant) => {
    styles[`--${variant}-bg`] = TOAST_COLORS.background;
    styles[`--${variant}-text`] = TOAST_COLORS.text;
    styles[`--${variant}-border`] = TOAST_COLORS.border;
    return styles;
  }, {});

  return {
    ...variantStyles,
    '--border-radius': 'var(--radius)',
  } as React.CSSProperties;
}

const TOAST_ICON_CLASS = 'size-4 text-[#F5E8D6]';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className={TOAST_ICON_CLASS} />,
        info: <InfoIcon className={TOAST_ICON_CLASS} />,
        warning: <TriangleAlertIcon className={TOAST_ICON_CLASS} />,
        error: <OctagonXIcon className={TOAST_ICON_CLASS} />,
        loading: <Loader2Icon className={`${TOAST_ICON_CLASS} animate-spin`} />,
      }}
      style={getToastStyleVariables()}
      {...props}
    />
  );
};

export { Toaster };
