import { Utensils, Heart, Users } from "lucide-react"

export function LoginHero() {
  return (
    <div className="hidden md:flex flex-col justify-center space-y-10 animate-slideInLeft">
      {/* Logo and Title */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg animate-float">
            <Utensils className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-extrabold text-foreground">
            Barangay <br />
            <span className="text-primary">Potluck</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-lg mt-2">
          Gamified HR system inspired by community feasts
        </p>
      </div>

      {/* Gamified Features */}
      <div className="space-y-8">
        {/* Contribution Points */}
        <div
          className="flex gap-4 items-start animate-fadeInUp"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Earn Contribution Points</h3>
            <p className="text-sm text-muted-foreground">
              Every task completed adds a “dish” to the potluck and earns points.
            </p>
          </div>
        </div>

        {/* Team Feast Levels */}
        <div
          className="flex gap-4 items-start animate-fadeInUp"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Level Up Together</h3>
            <p className="text-sm text-muted-foreground">
              Teams unlock feast milestones when everyone contributes — collaboration is rewarded.
            </p>
          </div>
        </div>

        {/* Potluck Rewards */}
        <div
          className="flex gap-4 items-start animate-fadeInUp"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
            <Utensils className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Redeem Your Rewards</h3>
            <p className="text-sm text-muted-foreground">
              Earn Fiesta Points from completed tasks and redeem them for rewards — from team perks and community celebrations to vouchers, bonuses, and more.
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Gamified Element */}
      <div className="pt-10">
        <div className="inline-flex items-center gap-3 px-5 py-3 bg-primary/10 rounded-full shadow-md">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">
            🎉 500+ communities already sharing the feast
          </span>
        </div>
      </div>
    </div>
  )
}
