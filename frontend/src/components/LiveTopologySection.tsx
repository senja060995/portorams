'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Layers, Cpu, ShoppingCart, Users, Globe, MessageSquare, Database, Smartphone, Monitor, CheckCircle2, Clock, Play, Activity } from 'lucide-react';
import { playSubtleHover, playClickSfx } from '@/utils/sfx';

export interface TopologyNodeData {
  id: string | number;
  name: string;
  subtitle?: string;
  type: string;
  status: string;
  badge: string;
  parentId?: string;
  connected_to?: number;
  node_name?: string;
  node_type?: string;
  pos_x?: number;
  x?: number;
  pos_y?: number;
  y?: number;
  icon?: string;
}

export interface LiveProject {
  id: number;
  title: string;
  slug: string;
  category: string;
  status: string;
  progress: number;
  target_date: string;
  client: string;
  description: string;
  nodes: TopologyNodeData[];
}

interface Point {
  x: number;
  y: number;
}

interface NodeBounds {
  top: Point;
  bottom: Point;
  left: Point;
  right: Point;
}

export const LiveTopologySection: React.FC = () => {
  const [projects, setProjects] = useState<LiveProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [nodeCoords, setNodeCoords] = useState<Record<string, NodeBounds>>({});

  const defaultProjects: LiveProject[] = [
    {
      id: 1,
      title: 'EKOSISTEM SUPERAPP MULTI TENAN ERP',
      slug: 'ekosistem-superapp-multi-tenant-erp',
      category: 'Enterprise Superapp',
      status: 'Development & Staging Active',
      progress: 85,
      target_date: 'Q3 2026',
      client: 'PT. RAMS Enterprise Ecosystem',
      description: 'Topologi arsitektur sistem RAMS terintegrasi real-time antara ERP, POS, Marketplace, HR, Gudang, dan Akuntansi dengan penanda modul LIVE & IN PROGRESS.',
      nodes: [
        { id: 'rams-tech', name: 'RAMS TECH', subtitle: 'Platform Tenant Ekosistem', type: 'root', status: 'LIVE', badge: 'Core Hub' },
        { id: 'sifin', name: 'SIFIN', subtitle: 'Accounting (Admin Panel)', type: 'core', status: 'LIVE', parentId: 'rams-tech', badge: 'Real-time Ledger' },
        { id: 'sidra', name: 'SIDRA', subtitle: 'Enterprise Resource Planning', type: 'core', status: 'LIVE', parentId: 'rams-tech', badge: 'ERP Engine' },
        { id: 'sigud', name: 'SIGUD', subtitle: 'Management Gudang (Admin Panel)', type: 'core', status: 'LIVE', parentId: 'rams-tech', badge: 'Stock Engine' },
        { id: 'sipos', name: 'SIPOS', subtitle: 'Aplikasi Pos Cashier', type: 'app', status: 'LIVE', parentId: 'sidra', badge: 'Offline-First' },
        { id: 'sihar', name: 'SIHAR', subtitle: 'Aplikasi Human Resource', type: 'app', status: 'IN_PROGRESS', parentId: 'sidra', badge: 'Testing Staging' },
        { id: 'siweb', name: 'SIWEB', subtitle: 'Aplikasi Web Porto (Admin)', type: 'app', status: 'LIVE', parentId: 'sidra', badge: 'CMS Portal' },
        { id: 'simar', name: 'SIMAR', subtitle: 'Aplikasi Marketplace (Admin)', type: 'app', status: 'IN_PROGRESS', parentId: 'sidra', badge: 'Sprint Development' },
        { id: 'sihub', name: 'SIHUB', subtitle: 'Aplikasi CRM (Admin Panel)', type: 'app', status: 'LIVE', parentId: 'sidra', badge: 'WA Cloud Bot' },

        // Endpoints
        { id: 'sipos-ios', name: 'Apk iOS', subtitle: 'Pos Cashier', type: 'client', status: 'LIVE', parentId: 'sipos', badge: 'LIVE' },
        { id: 'sipos-android', name: 'Apk Android', subtitle: 'Pos Cashier', type: 'client', status: 'LIVE', parentId: 'sipos', badge: 'LIVE' },
        { id: 'sipos-windows', name: 'Apk Windows', subtitle: 'Pos Cashier', type: 'client', status: 'LIVE', parentId: 'sipos', badge: 'LIVE' },

        { id: 'sihar-android', name: 'Apk Android', subtitle: 'Absensi Karyawan', type: 'client', status: 'IN_PROGRESS', parentId: 'sihar', badge: 'IN PROGRESS' },
        { id: 'sihar-ios', name: 'Apk iOS', subtitle: 'Absensi Karyawan', type: 'client', status: 'IN_PROGRESS', parentId: 'sihar', badge: 'IN PROGRESS' },

        { id: 'siweb-web', name: 'WEB Aplikasi', subtitle: 'Blog Portfolio', type: 'client', status: 'LIVE', parentId: 'siweb', badge: 'LIVE' },

        { id: 'simar-web', name: 'WEB Aplikasi', subtitle: 'Marketplace User', type: 'client', status: 'IN_PROGRESS', parentId: 'simar', badge: 'IN PROGRESS' },
        { id: 'simar-android', name: 'Apk Android', subtitle: 'Marketplace User', type: 'client', status: 'IN_PROGRESS', parentId: 'simar', badge: 'IN PROGRESS' },
        { id: 'simar-ios', name: 'APK iOS', subtitle: 'Marketplace User', type: 'client', status: 'IN_PROGRESS', parentId: 'simar', badge: 'IN PROGRESS' },

        { id: 'sihub-web', name: 'WEB Aplikasi', subtitle: 'CRM User', type: 'client', status: 'LIVE', parentId: 'sihub', badge: 'LIVE' },
        { id: 'sihub-android', name: 'Apk Android', subtitle: 'CRM User', type: 'client', status: 'LIVE', parentId: 'sihub', badge: 'LIVE' },
        { id: 'sihub-ios', name: 'APK iOS', subtitle: 'CRM User', type: 'client', status: 'LIVE', parentId: 'sihub', badge: 'LIVE' },
      ],
    },
    {
      id: 2,
      title: 'TIXNOVA CONCERT TICKETING SAAS PLATFORM',
      slug: 'tixnova-concert-ticketing-saas-platform',
      category: 'Event & High-Throughput Ticketing',
      status: 'Production Ready & Active Scaling',
      progress: 92,
      target_date: 'Active 2026',
      client: 'TixNova Concert & Event Infrastructure',
      description: 'Arsitektur platform ticketing konser SaaS multi-tenant dengan Nginx Load Balancer, Laravel 12 API, Redis Waiting Room 150.000 TPS, Payment Gateway, dan QR Scanner Gate Real-time.',
      nodes: [
        { id: 'tixnova-gateway', name: 'TIXNOVA GATEWAY', subtitle: 'Nginx SSL & Load Balancer', type: 'root', status: 'LIVE', badge: 'Phase 1 - Ingress Hub' },
        { id: 'tixnova-api', name: 'LARAVEL 12 API', subtitle: 'Sanctum Auth & Core Logic', type: 'core', status: 'LIVE', parentId: 'tixnova-gateway', badge: 'Phase 1 - REST Engine' },
        { id: 'tixnova-redis', name: 'REDIS 7 QUEUE', subtitle: 'Waiting Room (150k TPS)', type: 'core', status: 'LIVE', parentId: 'tixnova-gateway', badge: 'Phase 1 - Traffic Buffer' },
        { id: 'tixnova-db', name: 'MYSQL 8 CLUSTER', subtitle: 'MySQL / Postgres Data Core', type: 'core', status: 'LIVE', parentId: 'tixnova-api', badge: 'Phase 1 - ACID Storage' },
        { id: 'tixnova-worker', name: 'HORIZON WORKER', subtitle: 'Email & WA Notif Engine', type: 'core', status: 'LIVE', parentId: 'tixnova-redis', badge: 'Phase 2 - Mail & WA Queue' },
        { id: 'tixnova-pay', name: 'MIDTRANS & XENDIT', subtitle: 'Multi-Payment Auto-Settlement', type: 'app', status: 'LIVE', parentId: 'tixnova-api', badge: 'Phase 1 & 2 - Payment' },
        { id: 'tixnova-public', name: 'BUYER WEB PORTAL', subtitle: 'Next.js 14 War Ticket Site', type: 'app', status: 'LIVE', parentId: 'tixnova-api', badge: 'Phase 1 - Public Site' },
        { id: 'tixnova-promotor', name: 'PROMOTOR DASHBOARD', subtitle: 'Event & Ticket Inventory Admin', type: 'app', status: 'LIVE', parentId: 'tixnova-api', badge: 'Phase 1 - Tenant Admin' },
        { id: 'tixnova-scanner', name: 'QR GATE SCANNER', subtitle: 'PWA Concert Gate QR Validator', type: 'app', status: 'IN_PROGRESS', parentId: 'tixnova-api', badge: 'Phase 2 - Gate App' },
        { id: 'tixnova-vouchers', name: 'VOUCHER & DISCOUNTS', subtitle: 'Promo & Discount Engine', type: 'app', status: 'IN_PROGRESS', parentId: 'tixnova-api', badge: 'Phase 2 - Marketing' },
        { id: 'tixnova-seatmap', name: 'SEAT MAP BUILDER', subtitle: 'Interactive Seat Layout Engine', type: 'app', status: 'IN_PROGRESS', parentId: 'tixnova-api', badge: 'Phase 3 - Seat Selection' },
        { id: 'tixnova-affiliate', name: 'REFERRAL & AFFILIATE', subtitle: 'Commission & Referral Tracking', type: 'app', status: 'IN_PROGRESS', parentId: 'tixnova-api', badge: 'Phase 3 - Growth Engine' },
        { id: 'tixnova-refund', name: 'REFUND & RESCHEDULE', subtitle: 'Automated Refund Queue Engine', type: 'app', status: 'IN_PROGRESS', parentId: 'tixnova-api', badge: 'Phase 3 - Ticket Policy' },
        { id: 'tixnova-nft', name: 'NFT WEB3 TICKETS', subtitle: 'Blockchain Ticket Authentication', type: 'app', status: 'IN_PROGRESS', parentId: 'tixnova-api', badge: 'Phase 4 - Web3 Scale' },
        { id: 'tixnova-resale', name: 'TICKET RESALE MARKET', subtitle: 'Verified Secondary Ticket Market', type: 'app', status: 'IN_PROGRESS', parentId: 'tixnova-api', badge: 'Phase 4 - Resale Market' },
        { id: 'tixnova-b2b', name: 'B2B CORPORATE API', subtitle: 'Open Enterprise API Gateway', type: 'app', status: 'IN_PROGRESS', parentId: 'tixnova-api', badge: 'Phase 4 - Open API' },
      ],
    },
  ];

  useEffect(() => {
    fetch('http://localhost:8080/api/live-projects')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const parsed = data.map((p: any) => {
            let parsedNodes = null;
            if (typeof p.nodes_json === 'string' && p.nodes_json.trim().startsWith('[')) {
              try {
                parsedNodes = JSON.parse(p.nodes_json);
              } catch (e) {
                parsedNodes = null;
              }
            }
            const fallbackMatch = defaultProjects.find((dp) => dp.id === p.id || dp.slug === p.slug);
            const fallbackNodes = fallbackMatch ? fallbackMatch.nodes : defaultProjects[0].nodes;
            return {
              ...p,
              nodes: Array.isArray(parsedNodes) && parsedNodes.length > 0 ? parsedNodes : fallbackNodes,
            };
          });
          setProjects(parsed);
        } else {
          setProjects(defaultProjects);
        }
      })
      .catch(() => setProjects(defaultProjects));
  }, []);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || defaultProjects[0];

  // Recalculate exact pixel coordinates of box anchors relative to the container
  const updateCoordinates = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newCoords: Record<string, NodeBounds> = {};

    const elements = containerRef.current.querySelectorAll<HTMLElement>('[data-node-id]');
    elements.forEach((el) => {
      const id = el.getAttribute('data-node-id');
      if (!id) return;
      const rect = el.getBoundingClientRect();

      const relLeft = rect.left - containerRect.left;
      const relTop = rect.top - containerRect.top;
      const width = rect.width;
      const height = rect.height;

      newCoords[id] = {
        top: { x: relLeft + width / 2, y: relTop },
        bottom: { x: relLeft + width / 2, y: relTop + height },
        left: { x: relLeft, y: relTop + height / 2 },
        right: { x: relLeft + width, y: relTop + height / 2 },
      };
    });

    setNodeCoords(newCoords);
  };

  useEffect(() => {
    updateCoordinates();
    const timer = setTimeout(updateCoordinates, 300);
    window.addEventListener('resize', updateCoordinates);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCoordinates);
    };
  }, [selectedProjectId]);

  // Dynamic Connection links between nodes based on active project topology
  const getProjectConnections = () => {
    if (!activeProject || !activeProject.nodes) return [];
    const links: { from: string | number; fromAnchor: string; to: string | number; toAnchor: string; color: string }[] = [];

    activeProject.nodes.forEach((node) => {
      if (node.parentId) {
        const parent = activeProject.nodes.find((n) => n.id === node.parentId);
        if (parent) {
          const color = node.status === 'LIVE' ? '#10b981' : '#f59e0b';
          links.push({
            from: parent.id,
            fromAnchor: 'bottom',
            to: node.id,
            toAnchor: 'top',
            color: color,
          });
        }
      }
    });

    // Add inter-core horizontal link between SIFIN, SIDRA, SIGUD if they exist
    if (activeProject.nodes.some((n) => n.id === 'sifin') && activeProject.nodes.some((n) => n.id === 'sidra')) {
      links.push({ from: 'sifin', fromAnchor: 'right', to: 'sidra', toAnchor: 'left', color: '#06b6d4' });
    }
    if (activeProject.nodes.some((n) => n.id === 'sidra') && activeProject.nodes.some((n) => n.id === 'sigud')) {
      links.push({ from: 'sidra', fromAnchor: 'right', to: 'sigud', toAnchor: 'left', color: '#06b6d4' });
    }

    return links;
  };

  const drawPath = (start: Point, end: Point) => {
    const midY = start.y + (end.y - start.y) / 2;
    return `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
  };

  return (
    <section className="pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative bg-space-950">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header & Telemetry Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neon-cyan text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
              <span>LIVE SYSTEM ARCHITECTURE & TOPOLOGY</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Topologi Proyek Active & Interoperabilitas
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Pilih proyek di bawah ini untuk melihat status modul <span className="text-emerald-400 font-bold">LIVE (Selesai)</span> dan <span className="text-amber-400 font-bold">IN PROGRESS (Sedang Dikerjakan)</span>
            </p>
          </div>

          {/* Status Badges Legend */}
          <div className="flex items-center gap-4 text-xs font-mono bg-space-900/90 px-4 py-2.5 rounded-2xl border border-white/10 shadow-cyber-card">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500"></span>
              <span className="text-emerald-400 font-bold">LIVE (Selesai Deploy)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500"></span>
              <span className="text-amber-400 font-bold">IN PROGRESS (Sedang Dikembangkan)</span>
            </div>
          </div>
        </div>

        {/* Live Projects Selector Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {projects.map((proj) => {
            const isSelected = proj.id === selectedProjectId;
            return (
              <button
                key={proj.id}
                onClick={() => {
                  playClickSfx();
                  setSelectedProjectId(proj.id);
                }}
                onMouseEnter={playSubtleHover}
                className={`px-4 py-3 rounded-2xl border text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-3 ${
                  isSelected
                    ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-blue/20 border-neon-cyan text-white shadow-neon-cyan'
                    : 'bg-space-900/60 hover:bg-space-900 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-neon-cyan animate-pulse' : 'bg-slate-500'}`}></div>
                <div className="text-left">
                  <div className="text-white text-xs">{proj.title}</div>
                  <div className="text-[10px] text-neon-blue font-normal">{proj.progress}% Progress • {proj.status}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Project Summary Card */}
        {activeProject && (
          <div className="glass-panel rounded-2xl p-5 border border-white/10 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan font-bold">{activeProject.category}</span>
                <span className="text-emerald-400 font-bold">{activeProject.status}</span>
                <span className="text-slate-400">Target: {activeProject.target_date}</span>
              </div>
              <h3 className="text-base font-bold text-white">{activeProject.title}</h3>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                {activeProject.description}
              </p>
            </div>

            {/* Progress Gauge */}
            <div className="w-full sm:w-64 space-y-1.5 font-mono">
              <div className="flex justify-between text-xs text-slate-300">
                <span>PROGRESS OVERALL</span>
                <span className="text-neon-cyan font-bold">{activeProject.progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-space-900 border border-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-violet transition-all duration-700"
                  style={{ width: `${activeProject.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Clean Structured Hierarchy Tree Container */}
        <div
          ref={containerRef}
          className="relative w-full bg-space-900/90 rounded-3xl p-6 sm:p-10 border border-white/10 space-grid-bg shadow-cyber-card overflow-x-auto min-h-[720px]"
        >
          {/* SVG Animated Dynamic Connections Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {getProjectConnections().map((link, idx) => {
              const startCoords = nodeCoords[link.from];
              const endCoords = nodeCoords[link.to];
              if (!startCoords || !endCoords) return null;

              const startPoint = (startCoords as any)[link.fromAnchor];
              const endPoint = (endCoords as any)[link.toAnchor];
              if (!startPoint || !endPoint) return null;

              const pathStr = drawPath(startPoint, endPoint);
              const isHovered = hoveredNodeId === link.from || hoveredNodeId === link.to;

              return (
                <g key={`conn-${idx}`}>
                  <path
                    d={pathStr}
                    fill="none"
                    stroke={isHovered ? '#06b6d4' : link.color}
                    strokeWidth={isHovered ? '3' : '2'}
                    strokeDasharray="6,6"
                    opacity={isHovered ? '1' : '0.85'}
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="24"
                      to="0"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </path>
                </g>
              );
            })}
          </svg>
          {/* DYNAMIC NODE CARDS GRID FOR ACTIVE PROJECT */}
          <div className="min-w-[980px] space-y-12 relative z-10">
            {(() => {
              const currentNodes = activeProject?.nodes || [];
              const rootNodes = currentNodes.filter((n) => n.type === 'root' || !n.parentId);
              const coreNodes = currentNodes.filter((n) => n.type === 'core');
              const appNodes = currentNodes.filter((n) => n.type === 'app');
              const clientNodes = currentNodes.filter((n) => n.type === 'client');

              return (
                <>
                  {/* LEVEL 1: ROOT HUB NODES */}
                  {rootNodes.length > 0 && (
                    <div className="flex justify-center gap-6">
                      {rootNodes.map((node) => (
                        <div
                          key={node.id}
                          data-node-id={node.id}
                          onMouseEnter={() => {
                            playSubtleHover();
                            setHoveredNodeId(String(node.id));
                          }}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          className={`glass-panel p-5 rounded-2xl border-2 transition-all cursor-pointer text-center relative group w-80 shadow-cyber-card ${
                            node.status === 'LIVE'
                              ? 'border-neon-cyan/80 bg-space-950/95 shadow-neon-cyan'
                              : 'border-amber-500/80 bg-space-950/95 shadow-amber-500/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan font-bold uppercase tracking-wider">
                              {node.badge || node.type}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border flex items-center gap-1 ${
                                node.status === 'LIVE'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  node.status === 'LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                                }`}
                              ></span>
                              {node.status === 'LIVE' ? 'LIVE' : 'IN PROGRESS'}
                            </span>
                          </div>
                          <h3 className="text-2xl font-extrabold text-white tracking-wider font-mono">
                            {node.name || node.node_name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 font-mono">{node.subtitle || node.node_type}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* LEVEL 2: CORE NODES */}
                  {coreNodes.length > 0 && (
                    <div
                      className={`grid gap-6 max-w-5xl mx-auto ${
                        coreNodes.length <= 3 ? 'grid-cols-3' : 'grid-cols-4'
                      }`}
                    >
                      {coreNodes.map((node) => (
                        <div
                          key={node.id}
                          data-node-id={node.id}
                          onMouseEnter={() => {
                            playSubtleHover();
                            setHoveredNodeId(String(node.id));
                          }}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer text-center relative ${
                            hoveredNodeId === String(node.id)
                              ? 'border-neon-cyan bg-space-950 scale-105 shadow-neon-cyan'
                              : node.status === 'LIVE'
                              ? 'border-white/20 bg-space-950/90 hover:border-neon-cyan'
                              : 'border-amber-500/30 bg-space-950/90 hover:border-amber-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono font-bold text-neon-cyan">
                              {node.name || node.node_name}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                node.status === 'LIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {node.status === 'LIVE' ? 'LIVE' : 'IN PROGRESS'}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-white">{node.subtitle || node.node_type}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">{node.badge}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* LEVEL 3: APP MODULES */}
                  {appNodes.length > 0 && (
                    <div
                      className={`grid gap-4 ${
                        appNodes.length <= 3
                          ? 'grid-cols-3 max-w-4xl mx-auto'
                          : appNodes.length <= 5
                          ? 'grid-cols-5'
                          : 'grid-cols-4'
                      }`}
                    >
                      {appNodes.map((node) => (
                        <div
                          key={node.id}
                          data-node-id={node.id}
                          onMouseEnter={() => {
                            playSubtleHover();
                            setHoveredNodeId(String(node.id));
                          }}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          className={`glass-panel p-3.5 rounded-2xl border transition-all cursor-pointer text-center relative ${
                            hoveredNodeId === String(node.id)
                              ? 'border-neon-blue bg-space-950 scale-105 shadow-neon-blue'
                              : node.status === 'LIVE'
                              ? 'border-white/15 bg-space-950/90 hover:border-neon-cyan'
                              : 'border-amber-500/30 bg-space-950/90 hover:border-amber-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono font-bold text-neon-blue">
                              {node.name || node.node_name}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                node.status === 'LIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {node.status === 'LIVE' ? 'LIVE' : 'IN PROGRESS'}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white">{node.subtitle || node.node_type}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">{node.badge}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* LEVEL 4: CLIENT ENDPOINTS */}
                  {clientNodes.length > 0 && (
                    <div
                      className={`grid gap-3 ${
                        clientNodes.length <= 4 ? 'grid-cols-4 max-w-4xl mx-auto' : 'grid-cols-6'
                      }`}
                    >
                      {clientNodes.map((node) => (
                        <div
                          key={node.id}
                          data-node-id={node.id}
                          onMouseEnter={() => {
                            playSubtleHover();
                            setHoveredNodeId(String(node.id));
                          }}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          className={`glass-panel p-2.5 rounded-xl border transition-all cursor-pointer text-center relative ${
                            node.status === 'LIVE' ? 'border-white/10 bg-space-950/80' : 'border-amber-500/20 bg-space-950/80'
                          }`}
                        >
                          <div className="text-[11px] font-bold text-white">{node.name}</div>
                          <div className="text-[9px] text-slate-400 font-mono">{node.subtitle}</div>
                          <span
                            className={`inline-block mt-1 text-[8px] font-mono px-1 rounded ${
                              node.status === 'LIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {node.status === 'LIVE' ? 'LIVE' : 'DEV'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

      </div>
    </section>
  );
};
