import type { MercadoInterval } from './mercado-context';

export interface IntervalStall {
  interval: MercadoInterval;
  label: string;
  image: string;
}

export const INTERVAL_STALLS: IntervalStall[] = [
  { interval: 'weekly', label: 'Weekly', image: '/mercado/stall-weekly.png' },
  { interval: 'monthly', label: 'Monthly', image: '/mercado/stall-monthly.png' },
  { interval: 'yearly', label: 'Yearly', image: '/mercado/stall-yearly.png' },
];

export const STALL_HOVER_GLOW_CLASS =
  'h-44 w-44 sm:h-56 sm:w-56 md:h-64 md:w-64 rounded-full bg-[#F4B925]/45 blur-3xl opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-110 group-active:opacity-100';
