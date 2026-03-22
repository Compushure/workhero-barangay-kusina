import Image from 'next/image';
import { motion } from 'framer-motion';

const features = [
  {
    icon: '/assets/home/icon-tasks.png',
    title: 'Complete Tasks',
    description:
      'Comprehensive task assignment to earn points and XP, level up, and unlock a better kitchen with up to 10 levels.',
  },
  {
    icon: '/assets/home/icon-badges.png',
    title: 'Earn Badges',
    description:
      'Collect badges simply by playing and gain additional points to spend on the Mercado.',
  },
  {
    icon: '/assets/home/icon-ranking.png',
    title: 'Rank Up',
    description:
      'Compete with your peers through a comprehensive leveling system and weekly rankings.',
  },
  {
    icon: '/assets/home/icon-food.png',
    title: 'Filipino Delicacies',
    description:
      'Discover Filipino foods as you complete tasks and uncover more of the kitchen journey.',
  },
  {
    icon: '/assets/home/icon-attendance.png',
    title: 'Attendance Tracking',
    description:
      'Keep track of breaks and attendance with a smoother, more engaging employee experience.',
  },
  {
    icon: '/assets/home/icon-gamify.png',
    title: 'Gamified Stats',
    description:
      'Bring gamification into the workplace with XP bars, level-ups, and real-time leaderboards.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.08,
      duration: 0.45,
      ease: 'easeOut' as const,
    },
  }),
};

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="relative bg-gradient-to-b from-[#26180f] via-[#2b1b11] to-[#382116] px-4 py-16 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-pixel text-[9px] tracking-[0.3em] text-cooking-orange md:text-[10px]">
            WHAT YOU CAN DO
          </p>
          <h2 className="mt-3 font-pixel text-sm text-foreground md:text-lg">
            KusinHero Features
          </h2>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              className="parchment-card rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(244,120,18,0.22)] md:p-6"
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={cardVariants}
            >
              <Image
                src={feature.icon}
                alt=""
                aria-hidden="true"
                width={80}
                height={80}
                className="mb-4 h-16 w-16 object-contain md:h-20 md:w-20"
              />

              <h3 className="font-pixel text-[9px] leading-relaxed text-parchment-foreground md:text-[10px]">
                {feature.title}
              </h3>

              <p className="mt-3 font-pixel-body text-[1.45rem] leading-[1.02] text-[rgba(59,42,26,0.82)] md:text-[1.65rem]">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
