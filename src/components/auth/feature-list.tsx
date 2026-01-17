import { Shield, Users, Lock, Zap } from 'lucide-react';

const features = [
  {
    icon: <Users className="w-6 h-6 text-[#1D4ED8]" />,
    title: 'User Management',
    desc: 'Control access and permissions across your organization.',
  },
  {
    icon: <Lock className="w-6 h-6 text-[#1D4ED8]" />,
    title: 'Enterprise Security',
    desc: 'Advanced encryption and security protocols for your data.',
  },
  {
    icon: <Zap className="w-6 h-6 text-[#1D4ED8]" />,
    title: 'Real-Time Insights',
    desc: 'Monitor system performance and analytics instantly — stay in control.',
  },
];

export function FeatureList() {
  return (
    <div className="hidden md:flex flex-col justify-center space-y-10 animate-slideInLeft text-foreground">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg animate-float">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-extrabold text-foreground">
            COMPUSHURE <br />
            <span className="text-primary">Admin</span>
          </h1>
        </div>
        <p className="text-foreground/70 text-lg mt-2">
          Secure Access to Your Dashboard
        </p>
      </div>

      <div className="space-y-8">
        {features.map(({ icon, title, desc }, i) => (
          <div
            key={title}
            className="flex gap-4 items-start animate-fadeInUp"
            style={{ animationDelay: `${0.1 * (i + 1)}s` }}
          >
            <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-foreground/70">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-10">
        <div className="inline-flex items-center gap-3 px-5 py-3 bg-card rounded-full shadow-md">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          <span className="text-sm text-foreground/70">Trusted by 500+ organizations</span>
        </div>
      </div>
    </div>
  );
}
