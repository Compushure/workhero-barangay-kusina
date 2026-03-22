import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <Image
        src="/assets/home/hero-bg.png"
        alt="Barangay Kusina village"
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/75" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-24 text-center sm:px-6 md:grid-cols-[minmax(0,1.1fr)_minmax(280px,420px)] md:px-8 md:text-left">
        <motion.div
          className="space-y-5 md:space-y-7"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-pixel text-[10px] tracking-[0.35em] text-cooking-orange md:text-xs">
            WORK HERO
          </p>

          <div className="space-y-4">
            <h1 className="font-pixel text-[clamp(1.55rem,4vw,3.2rem)] leading-[1.2] text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.35)]">
              Barangay Kusina
            </h1>

            <p className="mx-auto max-w-xl font-pixel-body text-[clamp(1.7rem,4vw,3.2rem)] leading-[1.02] text-white/92 md:mx-0">
              Work or Play? Why not both, be a{' '}
              <span className="text-cooking-orange">KusinHero</span>
            </p>

            <p className="mx-auto max-w-2xl font-pixel-body text-[clamp(1.25rem,2.2vw,2rem)] leading-[1.15] text-white/72 md:mx-0">
              Turn your workplace into a game. Complete tasks, earn points, unlock
              rewards, and climb the leaderboard.
            </p>
          </div>

          <motion.div
            className="pt-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45 }}
          >
            <Link
              href="/auth/login"
              className="game-btn inline-flex min-h-12 items-center justify-center px-7 py-3 text-[10px] md:text-xs"
            >
              Start Cooking
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="mx-auto w-full max-w-[420px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="relative mx-auto aspect-[5/6] w-full max-w-[420px]">
            <Image
              src="/assets/home/landing-chef-hero.png"
              alt="KusinHero chefs"
              fill
              priority
              sizes="(min-width: 768px) 420px, 72vw"
              className="float-animation object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="font-pixel text-[8px] text-white/60">SCROLL</span>
      </motion.div>
    </section>
  );
}

