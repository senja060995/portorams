'use client';

import React from 'react';
import { CommandCenterBar } from '@/components/CommandCenterBar';
import { SpaceCanvas } from '@/components/SpaceCanvas';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LiveTopologySection } from '@/components/LiveTopologySection';

export default function LiveProjectPage() {
  return (
    <main className="relative min-h-screen bg-space-950 text-slate-100 selection:bg-neon-cyan selection:text-space-950 pt-28">
      <CommandCenterBar />
      <SpaceCanvas />
      <Navbar />

      {/* Main Live Active Projects & Infrastructure Topology Section */}
      <LiveTopologySection />

      <Footer />
    </main>
  );
}
