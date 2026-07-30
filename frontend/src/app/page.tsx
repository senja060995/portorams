'use client';

import React from 'react';
import { CommandCenterBar } from '@/components/CommandCenterBar';
import { SpaceCanvas } from '@/components/SpaceCanvas';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { JourneySection } from '@/components/JourneySection';
import { ServicesSection } from '@/components/ServicesSection';
import { PortfolioSection } from '@/components/PortfolioSection';
import { LiveTopologySection } from '@/components/LiveTopologySection';
import { SolutionSimulator } from '@/components/SolutionSimulator';
import { BlogSection } from '@/components/BlogSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-space-950 text-slate-100 selection:bg-neon-cyan selection:text-space-950">
      {/* Top Command Center Status Telemetry Bar */}
      <CommandCenterBar />

      {/* Dynamic 3D Parallax Space Canvas */}
      <SpaceCanvas />

      {/* Main Navbar with Multi-Page Routing */}
      <Navbar />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. About Section & Core Philosophy */}
      <AboutSection />

      {/* 3. Milestone Journey Timeline */}
      <JourneySection />

      {/* 4. Services & Tech Arsenal */}
      <ServicesSection />

      {/* 5. Portfolio & Case Studies */}
      <PortfolioSection />

      {/* 6. Live Active Project Infrastructure Topology */}
      <LiveTopologySection />

      {/* 7. RAMS Solution Blueprint Simulator */}
      <SolutionSimulator />

      {/* 8. Blog & Tech Insights */}
      <BlogSection />

      {/* 9. Contact & Partnership Form */}
      <ContactSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
