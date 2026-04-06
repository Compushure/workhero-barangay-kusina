import type { MercadoInterval } from './mercado-context';

export interface IntervalStall {
  interval: MercadoInterval;
  label: string;
  description: string;
  image: string;
  imageAdjustClassName?: string;
}

export const INTERVAL_STALLS: IntervalStall[] = [
  {
    interval: 'weekly',
    label: 'Weekly',
    description: 'Available items to redeem for this week',
    image: '/mercado/weeklystall.png',
    // Weekly art has slightly more transparent padding; scale it up a bit for visual parity.
    imageAdjustClassName: 'scale-105',
  },
  {
    interval: 'monthly',
    label: 'Monthly',
    description: 'Available items to redeem for this month',
    image: '/mercado/monthlystall.png',
    imageAdjustClassName: 'scale-100',
  },
  {
    interval: 'yearly',
    label: 'Yearly',
    description: 'Available items to redeem for this year',
    image: '/mercado/yearlystall.png',
    imageAdjustClassName: 'scale-100',
  },
];

export const STALL_HOVER_GLOW_CLASS =
  'h-44 w-44 sm:h-56 sm:w-56 md:h-64 md:w-64 rounded-full bg-[#F4B925]/45 blur-3xl opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-110 group-active:opacity-100';
