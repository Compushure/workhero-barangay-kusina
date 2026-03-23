'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { cn } from '@/lib/utils';

const TOAST_VARIANTS = ['normal', 'success', 'error', 'warning', 'info'] as const;
type ToastVariant = (typeof TOAST_VARIANTS)[number];
type ToastView = 'default' | 'employee';

type VariantColors = {
  bg: string;
  text: string;
  border: string;
  icon?: string;
};

type ToastViewContextValue = {
  view: ToastView;
  setView: (view: ToastView) => void;
};

const DEFAULT_TOAST_VIEW: ToastView = 'default';
const DEFAULT_BG = 'var(--card)';
const DEFAULT_TEXT = 'var(--primary)';
const EMPLOYEE_BG = 'linear-gradient(180deg, var(--wood-light) 0%, var(--wood) 100%)';
const EMPLOYEE_TEXT = 'var(--card)';

// Each view shares a surface/text pairing but customizes border + icon accents per variant.
const TOAST_VIEW_STYLES: Record<ToastView, Record<ToastVariant, VariantColors>> = {
  default: {
    normal: { bg: DEFAULT_BG, text: DEFAULT_TEXT, border: 'var(--border)', icon: DEFAULT_TEXT },
    success: { bg: DEFAULT_BG, text: DEFAULT_TEXT, border: '#22c55e', icon: '#16a34a' },
    error: { bg: DEFAULT_BG, text: DEFAULT_TEXT, border: '#dc2626', icon: '#f87171' },
    warning: { bg: DEFAULT_BG, text: DEFAULT_TEXT, border: '#d97706', icon: '#fbbf24' },
    info: { bg: DEFAULT_BG, text: DEFAULT_TEXT, border: '#2563eb', icon: '#60a5fa' },
  },
  employee: {
    normal: {
      bg: EMPLOYEE_BG,
      text: EMPLOYEE_TEXT,
      border: 'var(--pixel-border)',
      icon: EMPLOYEE_TEXT,
    },
    success: { bg: EMPLOYEE_BG, text: EMPLOYEE_TEXT, border: '#39c65a', icon: '#7ddf7e' },
    error: { bg: EMPLOYEE_BG, text: EMPLOYEE_TEXT, border: '#ff3333', icon: '#e60000' },
    warning: { bg: EMPLOYEE_BG, text: EMPLOYEE_TEXT, border: '#b86a1a', icon: '#ffd277' },
    info: { bg: EMPLOYEE_BG, text: EMPLOYEE_TEXT, border: '#5b6fa5', icon: '#c1d4ff' },
  },
};

const ToastViewContext = createContext<ToastViewContextValue | undefined>(undefined);

function useToastViewContext() {
  const context = useContext(ToastViewContext);
  if (!context) {
    throw new Error('ToastViewContext is missing. Wrap the app with ToastViewRootProvider.');
  }
  return context;
}

function getPalette(view: ToastView) {
  return TOAST_VIEW_STYLES[view] ?? TOAST_VIEW_STYLES[DEFAULT_TOAST_VIEW];
}

function getToastStyleVariables(view: ToastView): CSSProperties {
  const palette = getPalette(view);
  const variantStyles = TOAST_VARIANTS.reduce<Record<string, string>>((styles, variant) => {
    const colors = palette[variant];
    styles[`--${variant}-bg`] = colors.bg;
    styles[`--${variant}-text`] = colors.text;
    styles[`--${variant}-border`] = colors.border;
    return styles;
  }, {});

  return {
    ...variantStyles,
    '--border-radius': 'var(--radius)',
  } as CSSProperties;
}

const TOAST_ICON_BASE_CLASS = 'size-5 mr-2';

function getToastIcons(view: ToastView) {
  const palette = getPalette(view);
  const withColor = (variant: ToastVariant) => ({
    color: palette[variant].icon ?? palette[variant].text,
  });

  return {
    success: <CircleCheckIcon className={TOAST_ICON_BASE_CLASS} style={withColor('success')} />,
    info: <InfoIcon className={TOAST_ICON_BASE_CLASS} style={withColor('info')} />,
    warning: <TriangleAlertIcon className={TOAST_ICON_BASE_CLASS} style={withColor('warning')} />,
    error: <OctagonXIcon className={TOAST_ICON_BASE_CLASS} style={withColor('error')} />,
    loading: (
      <Loader2Icon className={`${TOAST_ICON_BASE_CLASS} animate-spin`} style={withColor('info')} />
    ),
  };
}

const DEFAULT_TOAST_CLASS = 'font-medium';
const BORDER_WIDTH = '2px';

const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();
  const { view } = useToastViewContext();
  const style = useMemo(() => getToastStyleVariables(view), [view]);
  const icons = useMemo(() => getToastIcons(view), [view]);
  const mergedToastOptions = useMemo<ToasterProps['toastOptions']>(() => {
    return {
      ...toastOptions,
      className: cn(
        DEFAULT_TOAST_CLASS,
        view === 'employee' ? 'font-jersey text-base tracking-[0.02em]' : null,
        toastOptions?.className
      ),
      style: {
        borderWidth: BORDER_WIDTH,
        ...toastOptions?.style,
      },
    };
  }, [toastOptions]);

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={icons}
      toastOptions={mergedToastOptions}
      style={style}
      {...props}
    />
  );
};

function ToastViewRootProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ToastView>(DEFAULT_TOAST_VIEW);
  const value = useMemo(() => ({ view, setView }), [setView, view]);

  return <ToastViewContext.Provider value={value}>{children}</ToastViewContext.Provider>;
}

function ToastViewSync({ view }: { view: ToastView }) {
  const { setView } = useToastViewContext();

  useEffect(() => {
    setView(view);
    return () => setView(DEFAULT_TOAST_VIEW);
  }, [setView, view]);

  return null;
}

export { Toaster, ToastViewRootProvider, ToastViewSync };
