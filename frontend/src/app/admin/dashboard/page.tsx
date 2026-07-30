'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Briefcase, MessageSquare, LogOut, Plus, Trash2, Edit3, Eye, CheckCircle, ShieldAlert, Sparkles, Orbit, Network, Activity, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { TopologyNodeData } from '@/components/LiveTopologySection';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  author: string;
  status: string;
  read_time: string;
}

interface Project {
  id: number;
  title: string;
  category: string;
  scale: string;
  scale_badge: string;
  client: string;
  year: string;
  problem: string;
  solution: string;
  impact: string;
  tech_stack: string;
}

interface LiveProject {
  id: number;
  title: string;
  slug: string;
  category: string;
  status: string;
  progress: number;
  target_date: string;
  client: string;
  description: string;
  nodes_json: string;
}

interface Inquiry {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'articles' | 'projects' | 'topology' | 'inquiries'>('topology');
  
  const [stats, setStats] = useState({
    total_projects: 4,
    total_articles: 2,
    total_inquiries: 3,
    unread_inquiries: 1,
  });

  const [articles, setArticles] = useState<Article[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [liveProjects, setLiveProjects] = useState<LiveProject[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedLiveProjId, setSelectedLiveProjId] = useState<number>(2); // Default to TixNova (id: 2)

  // Form states for creating article
  const [newArticle, setNewArticle] = useState({
    title: '',
    category: 'Technology Insight',
    excerpt: '',
    content: '',
    tags: 'Golang, Next.js, Architecture',
    author: 'Tim RAMS',
    status: 'published',
    read_time: '5 min read',
  });

  // Form states for topology node modal
  const [newNode, setNewNode] = useState({
    node_id: '',
    node_name: '',
    subtitle: '',
    node_type: 'app',
    status: 'LIVE',
    parentId: 'tixnova-api',
    badge: 'Phase 2',
  });

  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [nodeModalOpen, setNodeModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('rams_jwt_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Fetch initial data
    fetch('http://localhost:8080/api/articles')
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setArticles(data); });

    fetch('http://localhost:8080/api/projects')
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setProjects(data); });

    fetch('http://localhost:8080/api/live-projects')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLiveProjects(data);
          setSelectedLiveProjId(data[0].id);
        }
      });

    fetch('http://localhost:8080/api/admin/inquiries', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setInquiries(data); })
      .catch(() => {});
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('rams_jwt_token');
    localStorage.removeItem('rams_user');
    router.push('/admin/login');
  };

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Article = {
      id: Date.now(),
      ...newArticle,
    };
    setArticles([created, ...articles]);
    setArticleModalOpen(false);
    setNewArticle({
      title: '',
      category: 'Technology Insight',
      excerpt: '',
      content: '',
      tags: 'Golang, Next.js, Architecture',
      author: 'Tim RAMS',
      status: 'published',
      read_time: '5 min read',
    });
  };

  // Get active live project
  const activeLiveProject = liveProjects.find((p) => p.id === selectedLiveProjId) || liveProjects[0];

  // Parse active project nodes
  const getActiveNodes = (): TopologyNodeData[] => {
    if (!activeLiveProject) return [];
    try {
      if (typeof activeLiveProject.nodes_json === 'string' && activeLiveProject.nodes_json.trim().startsWith('[')) {
        return JSON.parse(activeLiveProject.nodes_json);
      }
    } catch (e) {
      console.log('Error parsing nodes_json', e);
    }
    return [];
  };

  // Save updated nodes to active project
  const saveNodesToProject = (updatedNodes: TopologyNodeData[]) => {
    if (!activeLiveProject) return;

    const updatedJson = JSON.stringify(updatedNodes);

    // Update local state
    const updatedProjects = liveProjects.map((p) =>
      p.id === activeLiveProject.id ? { ...p, nodes_json: updatedJson } : p
    );
    setLiveProjects(updatedProjects);

    // Send PUT request to backend
    fetch(`http://localhost:8080/api/admin/live-projects/${activeLiveProject.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('rams_jwt_token')}`,
      },
      body: JSON.stringify({
        ...activeLiveProject,
        nodes_json: updatedJson,
      }),
    }).catch((err) => console.log('Error updating project nodes via API', err));
  };

  // Toggle node status (LIVE <-> IN_PROGRESS)
  const toggleNodeStatus = (nodeId: string | number) => {
    const nodes = getActiveNodes();
    const updated = nodes.map((n) => {
      if (String(n.id) === String(nodeId)) {
        const nextStatus = n.status === 'LIVE' ? 'IN_PROGRESS' : 'LIVE';
        return { ...n, status: nextStatus };
      }
      return n;
    });
    saveNodesToProject(updated);
  };

  // Delete node
  const handleDeleteNode = (nodeId: string | number) => {
    const nodes = getActiveNodes();
    const updated = nodes.filter((n) => String(n.id) !== String(nodeId));
    saveNodesToProject(updated);
  };

  // Add new node modal submit
  const handleCreateTopologyNode = (e: React.FormEvent) => {
    e.preventDefault();
    const nodes = getActiveNodes();

    const nodeToAdd: TopologyNodeData = {
      id: newNode.node_id || `node-${Date.now()}`,
      name: newNode.node_name,
      subtitle: newNode.subtitle,
      type: newNode.node_type as any,
      status: newNode.status as any,
      badge: newNode.badge,
      parentId: newNode.parentId || undefined,
    };

    const updated = [...nodes, nodeToAdd];
    saveNodesToProject(updated);

    setNodeModalOpen(false);
    setNewNode({
      node_id: '',
      node_name: '',
      subtitle: '',
      node_type: 'app',
      status: 'LIVE',
      parentId: 'tixnova-api',
      badge: 'Phase 2',
    });
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-space-900 border-b border-white/10 px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center">
            <Orbit className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide font-mono">RAMS COMMAND CENTER CMS</h1>
            <p className="text-[11px] text-slate-400 font-mono">Admin Management & Architecture Topology Editor</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SYSTEM ONLINE</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 text-xs font-mono transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-5 py-2.5 rounded-2xl border text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === 'topology'
                ? 'bg-neon-cyan/20 border-neon-cyan text-white shadow-neon-cyan'
                : 'bg-space-900/60 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Network className="w-4 h-4 text-neon-cyan" />
            <span>Editor Topologi Proyek (CMS)</span>
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={`px-5 py-2.5 rounded-2xl border text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === 'articles'
                ? 'bg-neon-cyan/20 border-neon-cyan text-white shadow-neon-cyan'
                : 'bg-space-900/60 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-neon-blue" />
            <span>Kelola Artikel Insights ({articles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-5 py-2.5 rounded-2xl border text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'bg-neon-cyan/20 border-neon-cyan text-white shadow-neon-cyan'
                : 'bg-space-900/60 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4 text-neon-violet" />
            <span>Kelola Portfolio</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-5 py-2.5 rounded-2xl border text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === 'inquiries'
                ? 'bg-neon-cyan/20 border-neon-cyan text-white shadow-neon-cyan'
                : 'bg-space-900/60 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Pesan Kemitraan Klien</span>
          </button>
        </div>

        {/* TAB: TOPOLOGY MANAGER */}
        {activeTab === 'topology' && (
          <div className="space-y-6">
            
            {/* Live Project Selector in CMS */}
            <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-neon-cyan font-bold tracking-wider">CMS TOPOLOGY MANAGEMENT</span>
                <h2 className="text-xl font-bold text-white font-mono mt-1">Editor Modul & Topologi Proyek Live</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Kelola modul, ubah status <span className="text-emerald-400 font-bold">LIVE (Hijau)</span> / <span className="text-amber-400 font-bold">IN PROGRESS (Kuning)</span>, dan tambah modul baru.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNodeModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-neon-cyan text-space-950 font-bold text-xs flex items-center gap-2 shadow-neon-cyan hover:bg-cyan-400 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Modul Topologi</span>
                </button>
              </div>
            </div>

            {/* Select Live Project Bar */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {liveProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedLiveProjId(p.id)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all shrink-0 ${
                    selectedLiveProjId === p.id
                      ? 'bg-neon-cyan/20 border-neon-cyan text-white shadow-neon-cyan'
                      : 'bg-space-900/60 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{p.title}</span>
                </button>
              ))}
            </div>

            {/* Nodes Table Editor for Selected Project */}
            {activeLiveProject && (
              <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden space-y-4 p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">{activeLiveProject.title}</h3>
                    <p className="text-xs text-slate-400 font-mono">Total Modul: {getActiveNodes().length} Node</p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-bold">
                    {activeLiveProject.category}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-space-900 border-b border-white/10 text-slate-400">
                      <tr>
                        <th className="p-3">Nama Modul Node</th>
                        <th className="p-3">Subtitle / Deskripsi</th>
                        <th className="p-3">Tipe / Level</th>
                        <th className="p-3">Status Modul</th>
                        <th className="p-3">Parent Connection</th>
                        <th className="p-3">Badge Tag</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {getActiveNodes().map((node) => (
                        <tr key={node.id} className="hover:bg-white/5">
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            <Network className="w-4 h-4 text-neon-cyan" />
                            <span>{node.name || node.node_name}</span>
                          </td>
                          <td className="p-3 text-slate-300">{node.subtitle || '-'}</td>
                          <td className="p-3 text-neon-blue uppercase font-bold">{node.type}</td>
                          <td className="p-3">
                            <button
                              onClick={() => toggleNodeStatus(node.id)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                                node.status === 'LIVE'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
                              }`}
                              title="Klik untuk ubah status"
                            >
                              <span className={`w-2 h-2 rounded-full ${node.status === 'LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                              <span>{node.status === 'LIVE' ? 'LIVE (Selesai)' : 'IN PROGRESS'}</span>
                            </button>
                          </td>
                          <td className="p-3 text-slate-400 font-mono">{node.parentId || '-'}</td>
                          <td className="p-3 text-neon-cyan">{node.badge || '-'}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteNode(node.id)}
                              className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60"
                              title="Hapus Node Modul"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB: ARTICLES MANAGER */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white font-mono">Daftar Artikel Insights (CMS)</h2>
              <button
                onClick={() => setArticleModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-neon-cyan text-space-950 font-bold text-xs flex items-center gap-2 shadow-neon-cyan"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Artikel Baru</span>
              </button>
            </div>

            <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-space-900 border-b border-white/10 text-slate-400">
                  <tr>
                    <th className="p-4">Judul Artikel</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Penulis</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Estimasi Baca</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {articles.map((art) => (
                    <tr key={art.id} className="hover:bg-white/5">
                      <td className="p-4 font-bold text-white">{art.title}</td>
                      <td className="p-4 text-neon-cyan">{art.category}</td>
                      <td className="p-4">{art.author}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          {art.status}
                        </span>
                      </td>
                      <td className="p-4">{art.read_time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: PROJECTS MANAGER */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white font-mono">Daftar Portfolio Project (CMS)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div key={proj.id} className="glass-panel rounded-2xl p-6 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-neon-cyan">{proj.category}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-neon-violet/20 text-neon-violet">
                      Skala {proj.scale}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                  <div className="text-xs text-slate-400">Klien: {proj.client} • Tahun: {proj.year}</div>
                  <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl">
                    <strong className="text-neon-cyan">Impact: </strong>{proj.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: INQUIRIES READER */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white font-mono">Pesan Masuk Kemitraan Klien ({inquiries.length})</h2>
            </div>

            {inquiries.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 border border-white/10 text-center text-slate-400 font-mono text-xs">
                Belum ada pesan masuk dari Formulir Diskusi Proyek.
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="glass-panel rounded-2xl p-6 border border-white/10 space-y-3 hover:border-neon-cyan/40 transition-all">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="text-neon-cyan font-bold text-sm">
                        {inq.name} {inq.company ? `• ${inq.company}` : ''}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        {inq.status || 'NEW'}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-white font-mono">Subjek: {inq.subject}</div>

                    <div className="p-4 rounded-xl bg-space-950/80 border border-white/5 text-slate-200 text-xs leading-relaxed whitespace-pre-line">
                      "{inq.message}"
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                      <span>📧 Email: <strong className="text-white">{inq.email}</strong></span>
                      <span>📞 Phone/WA: <strong className="text-neon-cyan">{inq.phone || '-'}</strong></span>
                      <span className="ml-auto text-[11px] text-slate-500">
                        {new Date(inq.created_at || Date.now()).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modal Add Topology Node */}
      {nodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/90 backdrop-blur-xl">
          <div className="glass-panel rounded-3xl max-w-xl w-full border border-neon-cyan/40 p-6 sm:p-8 space-y-6 shadow-neon-cyan">
            <h3 className="text-xl font-bold text-white font-mono">Tambah Modul Topologi Baru</h3>

            <form onSubmit={handleCreateTopologyNode} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">ID Unique Node (e.g. tixnova-seatmap) *</label>
                  <input
                    type="text"
                    required
                    value={newNode.node_id}
                    onChange={(e) => setNewNode({ ...newNode, node_id: e.target.value })}
                    placeholder="tixnova-seatmap"
                    className="w-full p-3 rounded-xl bg-space-950 border border-white/10 text-white font-sans text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Nama Modul Node *</label>
                  <input
                    type="text"
                    required
                    value={newNode.node_name}
                    onChange={(e) => setNewNode({ ...newNode, node_name: e.target.value })}
                    placeholder="SEAT MAP BUILDER"
                    className="w-full p-3 rounded-xl bg-space-950 border border-white/10 text-white font-sans text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Subtitle / Deskripsi Modul *</label>
                <input
                  type="text"
                  required
                  value={newNode.subtitle}
                  onChange={(e) => setNewNode({ ...newNode, subtitle: e.target.value })}
                  placeholder="Interactive Seat Layout Engine"
                  className="w-full p-3 rounded-xl bg-space-950 border border-white/10 text-white font-sans text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Tipe / Level Node</label>
                  <select
                    value={newNode.node_type}
                    onChange={(e) => setNewNode({ ...newNode, node_type: e.target.value })}
                    className="w-full p-3 rounded-xl bg-space-950 border border-white/10 text-white font-sans text-xs"
                  >
                    <option value="root">Root Hub (Ingress / Core Hub)</option>
                    <option value="core">Core Engine (Core Level 2)</option>
                    <option value="app">App Module (Level 3 Service)</option>
                    <option value="client">Client Endpoint (Level 4 App)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Status Modul</label>
                  <select
                    value={newNode.status}
                    onChange={(e) => setNewNode({ ...newNode, status: e.target.value })}
                    className="w-full p-3 rounded-xl bg-space-950 border border-white/10 text-white font-sans text-xs"
                  >
                    <option value="LIVE">LIVE (Green Badge - Finished)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (Amber Badge - Active)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Parent Node Connection ID</label>
                  <input
                    type="text"
                    value={newNode.parentId}
                    onChange={(e) => setNewNode({ ...newNode, parentId: e.target.value })}
                    placeholder="tixnova-api"
                    className="w-full p-3 rounded-xl bg-space-950 border border-white/10 text-white font-sans text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={newNode.badge}
                    onChange={(e) => setNewNode({ ...newNode, badge: e.target.value })}
                    placeholder="Phase 3 - Seat Selection"
                    className="w-full p-3 rounded-xl bg-space-950 border border-white/10 text-white font-sans text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setNodeModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-neon-cyan text-space-950 font-bold shadow-neon-cyan"
                >
                  Simpan Modul Topologi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Article */}
      {articleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/90 backdrop-blur-xl">
          <div className="glass-panel rounded-3xl max-w-2xl w-full border border-neon-cyan/40 p-6 sm:p-8 space-y-6 shadow-neon-cyan">
            <h3 className="text-xl font-bold text-white font-mono">Buat Artikel Insights Baru</h3>
            <form onSubmit={handleCreateArticle} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">Judul Artikel *</label>
                <input
                  type="text"
                  required
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-space-950 border border-white/10 text-white font-sans text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setArticleModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-neon-cyan text-space-950 font-bold shadow-neon-cyan"
                >
                  Terbitkan Artikel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
