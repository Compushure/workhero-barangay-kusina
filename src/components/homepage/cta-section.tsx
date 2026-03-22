import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function CTASection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:py-28">
      <Image
        src="/assets/home/features-bg.png"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/60" />

      <motion.div
        className="relative z-10 mx-auto max-w-2xl text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-pixel text-[9px] tracking-[0.3em] text-cooking-orange md:text-[10px]">
          READY?
        </p>
        <h2 className="mt-3 font-pixel text-sm leading-relaxed text-white md:text-xl">
          Become a KusinHero Today
        </h2>
        <p className="mt-4 font-pixel-body text-[1.55rem] leading-[1.02] text-white/82 md:text-[1.9rem]">
          Join your barangay, cook up some tasks, and climb the leaderboard. Your
          kitchen adventure awaits.
        </p>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
          <Link
            href="/auth/login"
            className="game-btn mt-8 inline-flex min-h-12 items-center justify-center px-8 py-4 text-[10px] md:text-xs"
          >
            Start Cooking
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

