import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Image
        src="/assets/home/landing-chef-hero.png"
        alt="Barangay Kusina landing background"
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover object-[62%_center] md:object-center"
      />

      <div className="absolute inset-0 bg-linear-to-r from-black/65 via-black/45 to-black/20" />
      <div className="absolute inset-0 bg-black/15" />

      <section className="relative z-10 flex min-h-screen w-full items-center px-4 pt-6 pb-4 max-[380px]:px-3 max-[380px]:pt-5 sm:px-8 sm:pt-8 md:px-16 md:pt-8">
        <div className="flex min-h-[88svh] w-full max-w-full flex-col text-[#F7EFE4] sm:min-h-0 sm:max-w-xl md:max-w-2xl">
          <p className="font-pixel text-[10px] tracking-wider text-[#F4B31A] max-[380px]:text-[9px] sm:text-xs md:text-base">
            WORK HERO
          </p>

          <h1 className="mt-3 font-pixel text-2xl leading-tight max-[380px]:text-[22px] sm:mt-4 sm:text-4xl md:text-5xl">
            Barangay Kusina
          </h1>

          <p className="mt-4 max-w-full font-pixel text-[11px] leading-5 text-[#F3E6D6] max-[380px]:text-[10px] sm:mt-6 sm:max-w-lg sm:text-sm sm:leading-7 md:max-w-xl md:text-base md:leading-8">
            Work or Play? Why not do it both and be a KusinHero
          </p>

          <ul className="mt-4 space-y-1.5 font-pixel text-[11px] leading-snug text-[#F6EFE8] max-[380px]:text-[10px] sm:mt-6 sm:space-y-2.5 sm:text-sm md:mt-8 md:space-y-3 md:text-lg">
            <li>- Complete tasks</li>
            <li>- Earn Points</li>
            <li>- Unlock Rewards</li>
            <li>- Achieve badges</li>
            <li>- Climb the leaderboard</li>
          </ul>

          <div className="mt-auto pt-5 sm:mt-8 sm:pt-0 md:mt-10">
            <Link
              href="/auth/login"
              className="inline-flex w-full max-w-full items-center justify-center gap-1.5 rounded-md border-2 border-[#B37216] bg-[#E2A528] px-4 py-2.5 font-pixel text-[11px] text-[#1D1B17] shadow-[0_4px_0_#A9680E] transition-transform hover:-translate-y-0.5 hover:bg-[#EEAF30] active:translate-y-0 active:shadow-[0_2px_0_#A9680E] max-[380px]:px-3.5 max-[380px]:py-2 max-[380px]:text-[10px] sm:w-auto sm:max-w-none sm:gap-2 sm:px-6 sm:py-3.5 sm:text-sm md:text-base"
            >
              Start Cooking
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
