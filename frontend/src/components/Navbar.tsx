'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Orbit, Menu, X, ArrowUpRight } from 'lucide-react';
import { playSubtleHover, playClickSfx } from '@/utils/sfx';
import { TypewriterText } from '@/components/TypewriterText';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About RAMS', href: '/about' },
    { name: 'Milestone Journey', href: '/journey' },
    { name: 'Services', href: '/services' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Live Projects', href: '/live-project' },
    { name: 'Solution Simulator', href: '/simulator' },
    { name: 'Insights', href: '/blog' },
  ];

  return (
    <nav
      className={`fixed inset-x-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-40 transition-all duration-300 ${
        scrolled ? 'top-11' : 'top-10'
      }`}
    >
      <div className="glass-panel rounded-2xl px-5 py-3.5 flex items-center justify-between border border-white/10 shadow-cyber-card">
        {/* Brand Logo */}
        <Link
          href="/"
          onMouseEnter={playSubtleHover}
          onClick={playClickSfx}
          className="flex items-center gap-3 group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-space-900 border border-neon-cyan/40 group-hover:border-neon-cyan transition-all group-hover:shadow-neon-cyan overflow-hidden p-1.5">
            <img
              src="/logo.png"
              alt="RAMS Logo"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.svg';
              }}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 rounded-xl bg-neon-cyan/10 animate-pulse-slow"></div>
          </div>
          <div>
            <div className="font-bold tracking-wider text-lg text-white flex items-center gap-1.5 font-mono">
              RAMS
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan font-normal uppercase">
                Enterprise
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-tight min-h-[14px]">
              <TypewriterText text="PT. Ragam Manfaat Sinergi" />
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onMouseEnter={playSubtleHover}
                onClick={playClickSfx}
                className={`transition-colors font-sans text-xs tracking-wide relative py-1 ${
                  isActive
                    ? 'text-neon-cyan font-bold'
                    : 'text-slate-300 hover:text-neon-cyan'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan rounded-full shadow-neon-cyan"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/contact"
            onMouseEnter={playSubtleHover}
            onClick={playClickSfx}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-violet text-space-950 font-bold text-xs hover:opacity-90 transition-all shadow-neon-cyan hover:scale-[1.02]"
          >
            <span>Hubungi RAMS</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => {
            playClickSfx();
            setMobileMenuOpen(!mobileMenuOpen);
          }}
          className="lg:hidden p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 glass-panel rounded-2xl p-5 border border-white/10 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => {
                playClickSfx();
                setMobileMenuOpen(false);
              }}
              className={`py-2 text-sm font-medium border-b border-white/5 ${
                pathname === link.href ? 'text-neon-cyan font-bold' : 'text-slate-200 hover:text-neon-cyan'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => {
              playClickSfx();
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-cyan text-space-950 font-bold text-sm"
          >
            <span>Hubungi RAMS</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </nav>
  );
};
