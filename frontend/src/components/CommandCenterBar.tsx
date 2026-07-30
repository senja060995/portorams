'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ShieldCheck, Activity, Lock } from 'lucide-react';
import { toggleMute, getMuteState, playClickSfx } from '@/utils/sfx';

export const CommandCenterBar: React.FC = () => {
  const [muted, setMuted] = useState(true);
  const [latency, setLatency] = useState(14);
  const [uptime] = useState('99.98%');

  useEffect(() => {
    setMuted(getMuteState());
    const interval = setInterval(() => {
      setLatency(Math.floor(10 + Math.random() * 8));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSoundToggle = () => {
    const newState = toggleMute();
    setMuted(newState);
    if (!newState) playClickSfx();
  };

  return (
    <div className="fixed top-0 left-0 right-0 w-full bg-space-950/95 border-b border-white/10 px-3 sm:px-6 py-1.5 text-xs text-slate-400 backdrop-blur-xl flex items-center justify-between gap-2 z-50 shadow-md">
      {/* Left: System Status Telemetry */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 text-emerald-400 font-mono shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wider uppercase font-semibold text-[10px] sm:text-xs">RAMS COMMAND CENTER: ONLINE</span>
        </div>

        {/* Telemetry Metrics Always Visible */}
        <div className="flex items-center gap-2.5 sm:gap-4 text-[10px] sm:text-[11px] font-mono border-l border-white/10 pl-2.5 sm:pl-4 shrink-0">
          <span className="flex items-center gap-1 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
            LATENCY: <span className="text-neon-cyan font-bold">{latency}ms</span>
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-neon-violet shrink-0" />
            UPTIME: <span className="text-neon-violet font-bold">{uptime}</span>
          </span>
        </div>
      </div>

      {/* Right: Audio SFX Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
        <button
          onClick={handleSoundToggle}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-neon-cyan transition-all text-[10px] sm:text-[11px]"
          title="Toggle Cyber SFX"
        >
          {muted ? <VolumeX className="w-3 h-3 text-slate-500" /> : <Volume2 className="w-3 h-3 text-neon-cyan" />}
          <span className="font-mono hidden sm:inline">{muted ? 'SFX: MUTED' : 'SFX: ON'}</span>
        </button>
      </div>
    </div>
  );
};
