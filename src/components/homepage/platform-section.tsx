import { motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  ClipboardCheck,
  Shield,
  ShoppingBag,
  Users,
} from 'lucide-react';

const platformFeatures = [
  {
    icon: Shield,
    title: 'Role-Based Views',
    description: 'Superadmin, manager, HR, and employee dashboards.',
  },
  {
    icon: Users,
    title: 'Employee Management',
    description: 'Advanced filtering, search, and user management tools.',
  },
  {
    icon: ClipboardCheck,
    title: 'Task Verification',
    description: 'Assign, track, and verify work with manager workflows.',
  },
  {
    icon: Bell,
    title: 'Real-time Notifications',
    description: 'Live updates that keep the whole team in sync.',
  },
  {
    icon: ShoppingBag,
    title: 'Mercado Marketplace',
    description: 'A built-in reward redemption experience for employees.',
  },
  {
    icon: BarChart3,
    title: 'Type-Safe and Tested',
    description: 'A TypeScript-first platform with testing support.',
  },
];

export function PlatformSection() {
  return (
    <section
      id="platform"
      className="relative bg-gradient-to-b from-[#382116] via-[#281910] to-[#1f140d] px-4 py-16 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto mb-12 max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-pixel text-[9px] tracking-[0.3em] text-gold md:text-[10px]">
            UNDER THE HOOD
          </p>
          <h2 className="mt-3 font-pixel text-sm text-foreground md:text-lg">
            Powerful Platform
          </h2>
          <p className="mt-4 font-pixel-body text-[1.55rem] leading-[1.02] text-muted-foreground md:text-[1.9rem]">
            A comprehensive employee management and gamification system with role-based
            access, integrated task assignment, badge systems, attendance tracking, and
            reward redemption.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {platformFeatures.map((feature, index) => (
            <motion.article
              key={feature.title}
              className="wood-panel rounded-2xl p-5"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cooking-orange/16 ring-1 ring-cooking-orange/20">
                  <feature.icon className="h-5 w-5 text-cooking-orange" />
                </div>

                <div>
                  <h3 className="font-pixel text-[8px] leading-relaxed text-foreground md:text-[9px]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 font-pixel-body text-[1.35rem] leading-[1.02] text-muted-foreground md:text-[1.55rem]">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

