'use client';

import { CTASection } from './cta-section';
import { FeatureGrid } from './feature-grid';
import { Footer } from './footer';
import { HeroSection } from './hero-section';
import { PlatformSection } from './platform-section';

export function HomepagePage() {
  return (
    <main className="homepage-theme overflow-hidden bg-background text-foreground">
      <HeroSection />
      <FeatureGrid />
      <PlatformSection />
      <CTASection />
      <Footer />
    </main>
  );
}
