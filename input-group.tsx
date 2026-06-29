'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Settings,
  Flame,
  Crosshair,
  Wifi,
  ChevronRight,
  Plus,
  Trash2,
  MousePointer,
  Tv,
  BarChart3,
  Star,
  CheckCircle2,
  X,
  Gauge,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { GAME_PRESETS, matchGamePreset } from '@/data/gamePresets';
import type { GamePreset } from '@/data/gamePresets';
import PlaystyleAnalyzer from '@/components/PlaystyleAnalyzer';

// ── Dark Design Tokens ──────────────────────────────────────────────────────
const BG = '#09090B';
const CARD = '#111115';
const BORDER = '#1E1E26';
const ACCENT = '#6D28D9'; // purple
const GLOW = 'rgba(109,40,217,0.35)';

// ── Reusable Dark Components ─────────────────────────────────────────────────
const DarkCard = ({
  children,
  className,
  glowing,
}: {
  children: React.ReactNode;
  className?: string;
  glowing?: boolean;
}) => (
  <div
    className={cn('rounded-2xl border', className)}
    style={{
      background: CARD,
      borderColor: BORDER,
      boxShadow: glowing ? `0 0 32px ${GLOW}` : 'none',
    }}
  >
    {children}
  </div>
);

const Tag = ({
  children,
  color = 'purple',
}: {
  children: React.ReactNode;
  color?: 'purple' | 'amber' | 'green' | 'gray';
}) => {
  const colors: Record<string, string> = {
    purple: 'bg-purple-900/40 text-purple-300 border-purple-800/60',
    amber: 'bg-amber-900/40 text-amber-300 border-amber-800/60',
    green: 'bg-green-900/40 text-green-300 border-green-800/60',
    gray: 'bg-white/5 text-gray-400 border-white/10',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        colors[color]
      )}
    >
      {children}
    </span>
  );
};

const Ring = ({
  pct,
  label,
  value,
  color,
}: {
  pct: number;
  label: string;
  value: string;
  color: string;
}) => {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r={r} stroke="#1E1E26" strokeWidth="4" fill="none" />
          <circle
            cx="25"
            cy="25"
            r={r}
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[11px] font-bold text-white">{value}</span>
      </div>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
  );
};

// ── Settings Modal ────────────────────────────────────────────────────────────
const SettingsModal = ({
  preset,
  gameName,
  onClose,
}: {
  preset: GamePreset | null;
  gameName: string;
  onClose: () => void;
}) => {
  const [tab, setTab] = useState<'sensitivity' | 'graphics' | 'network'>('sensitivity');

  const SettingRow = ({ label, value }: { label: string; value: string | number | boolean }) => (
    <div
      className="flex items-center justify-between py-2.5 border-b last:border-0"
      style={{ borderColor: BORDER }}
    >
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-white">{String(value)}</span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border overflow-hidden"
        style={{ background: '#0F0F14', borderColor: BORDER, maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: BORDER }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{preset?.icon ?? '🎮'}</span>
              <h2 className="text-xl font-bold text-white">{gameName}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Tag color="purple">{preset?.genre ?? 'Game'}</Tag>
              <Tag color="green">
                <Star size={10} />
                Pro Settings
              </Tag>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: BORDER }}>
          {(['sensitivity', 'graphics', 'network'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-3 text-sm font-semibold capitalize transition-all',
                tab === t
                  ? 'text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              {t === 'sensitivity'
                ? '🖱️ Sensitivity'
                : t === 'graphics'
                  ? '🖥️ Graphics'
                  : '📡 Network'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: '55vh' }}>
          {!preset ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2">No preset found for this game.</p>
              <p className="text-xs text-gray-600">
                Try popular games like CS2, Valorant, Fortnite, Apex Legends, etc.
              </p>
            </div>
          ) : tab === 'sensitivity' ? (
            <div className="space-y-1">
              {/* eDPI Highlight */}
              <div
                className="rounded-xl p-4 mb-5 flex items-center justify-between"
                style={{
                  background: 'rgba(109,40,217,0.15)',
                  border: `1px solid rgba(109,40,217,0.3)`,
                }}
              >
                <div>
                  <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-1">
                    Effective DPI (eDPI)
                  </p>
                  <p className="text-3xl font-black text-white">{preset.sensitivity.edpi}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Formula</p>
                  <p className="text-sm text-gray-300 font-mono">
                    {preset.sensitivity.dpi} × {preset.sensitivity.ingame}
                  </p>
                </div>
              </div>
              <SettingRow label="DPI" value={`${preset.sensitivity.dpi} DPI`} />
              <SettingRow label="In-Game Sensitivity" value={preset.sensitivity.ingame} />
              {preset.sensitivity.rawInput !== undefined && (
                <SettingRow
                  label="Raw Mouse Input"
                  value={preset.sensitivity.rawInput ? 'ON ✓' : 'OFF'}
                />
              )}
              {preset.sensitivity.scopedMultiplier !== undefined && (
                <SettingRow
                  label="Scoped / ADS Multiplier"
                  value={preset.sensitivity.scopedMultiplier}
                />
              )}
              {preset.sensitivity.adsMultiplier !== undefined && (
                <SettingRow label="ADS Sensitivity" value={preset.sensitivity.adsMultiplier} />
              )}
              <SettingRow label="Polling Rate" value={`${preset.sensitivity.polling ?? 1000} Hz`} />
              {preset.sensitivity.notes && (
                <div
                  className="mt-4 p-3 rounded-lg text-xs text-amber-300 leading-relaxed"
                  style={{
                    background: 'rgba(245,158,11,0.10)',
                    border: '1px solid rgba(245,158,11,0.2)',
                  }}
                >
                  💡 {preset.sensitivity.notes}
                </div>
              )}
            </div>
          ) : tab === 'graphics' ? (
            <div className="space-y-1">
              {/* FPS Cap Highlight */}
              <div
                className="rounded-xl p-4 mb-5 flex items-center justify-between"
                style={{
                  background: 'rgba(245,158,11,0.10)',
                  border: `1px solid rgba(245,158,11,0.25)`,
                }}
              >
                <div>
                  <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
                    FPS Cap
                  </p>
                  <p className="text-3xl font-black text-white">{preset.graphics.fpsCap}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">VSync</p>
                  <p
                    className={cn(
                      'text-sm font-bold',
                      preset.graphics.vsync ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    {preset.graphics.vsync ? 'ON' : 'OFF ✓'}
                  </p>
                </div>
              </div>
              <SettingRow label="Resolution" value={preset.graphics.resolution} />
              <SettingRow label="Aspect Ratio" value={preset.graphics.aspectRatio} />
              <SettingRow label="Anti-Aliasing" value={preset.graphics.antiAliasing} />
              <SettingRow label="Shadow Quality" value={preset.graphics.shadows} />
              <SettingRow label="Texture Quality" value={preset.graphics.textures} />
              <SettingRow label="Effects Quality" value={preset.graphics.effects} />
              {preset.graphics.postProcessing && (
                <SettingRow label="Post Processing" value={preset.graphics.postProcessing} />
              )}
              {preset.graphics.renderScale && (
                <SettingRow
                  label="Render Scale / Draw Distance"
                  value={preset.graphics.renderScale}
                />
              )}
              {preset.graphics.notes && (
                <div
                  className="mt-4 p-3 rounded-lg text-xs text-amber-300 leading-relaxed"
                  style={{
                    background: 'rgba(245,158,11,0.10)',
                    border: '1px solid rgba(245,158,11,0.2)',
                  }}
                >
                  💡 {preset.graphics.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {preset.network.rateCommands && preset.network.rateCommands.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
                    Console / Launch Commands
                  </p>
                  <div className="space-y-2">
                    {preset.network.rateCommands.map((cmd, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg font-mono text-sm text-green-400"
                        style={{
                          background: 'rgba(16,185,129,0.07)',
                          border: '1px solid rgba(16,185,129,0.2)',
                        }}
                      >
                        <span className="text-gray-600">$</span>
                        {cmd}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div
                className="p-4 rounded-xl text-sm text-blue-300 leading-relaxed"
                style={{
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                }}
              >
                📡 {preset.network.notes}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  ['Use wired ethernet', true],
                  ['Disable background apps', true],
                  ['Enable QoS on router', true],
                  ['Disable Windows Update during game', true],
                ].map(([tip, _rec]) => (
                  <div
                    key={String(tip)}
                    className="flex items-start gap-2 p-3 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}` }}
                  >
                    <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-400">{String(tip)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Pro Tip */}
          {preset && (
            <div
              className="mt-5 p-4 rounded-xl"
              style={{
                background: 'rgba(109,40,217,0.08)',
                border: `1px solid rgba(109,40,217,0.25)`,
              }}
            >
              <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1.5">
                ⚡ Pro Tip
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">{preset.proTip}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── DPI Calculator ────────────────────────────────────────────────────────────
const DPICalculator = () => {
  const [dpi, setDpi] = useState(800);
  const [sens, setSens] = useState(0.4);
  const edpi = Math.round(dpi * sens);

  const level =
    edpi < 400
      ? { label: 'Ultra Low', color: '#3B82F6' }
      : edpi < 800
        ? { label: 'Low', color: '#10B981' }
        : edpi < 1600
          ? { label: 'Medium', color: '#F59E0B' }
          : { label: 'High', color: '#EF4444' };

  return (
    <DarkCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <MousePointer size={16} className="text-purple-400" />
        <h3 className="text-sm font-bold text-white">eDPI Calculator</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Mouse DPI</label>
          <input
            type="number"
            value={dpi}
            onChange={(e) => setDpi(Number(e.target.value))}
            className="w-full bg-black/40 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-600"
            style={{ borderColor: BORDER }}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">In-Game Sens</label>
          <input
            type="number"
            step="0.01"
            value={sens}
            onChange={(e) => setSens(Number(e.target.value))}
            className="w-full bg-black/40 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-600"
            style={{ borderColor: BORDER }}
          />
        </div>
      </div>
      <div
        className="rounded-xl p-3 flex items-center justify-between"
        style={{ background: 'rgba(109,40,217,0.12)', border: '1px solid rgba(109,40,217,0.25)' }}
      >
        <div>
          <p className="text-xs text-gray-500">Your eDPI</p>
          <p className="text-2xl font-black text-white">{edpi}</p>
        </div>
        <Tag color={edpi < 800 ? 'green' : edpi < 1600 ? 'amber' : 'gray'}>{level.label}</Tag>
      </div>
    </DarkCard>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NitroBuff() {
  const [mounted, setMounted] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [platform, setPlatform] = useState('Steam');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedGame, setSelectedGame] = useState<{
    name: string;
    preset: GamePreset | null;
  } | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: games = [], isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const res = await fetch('/api/games');
      if (!res.ok) throw new Error('Failed to fetch games');
      return res.json();
    },
  });

  const addGame = useMutation({
    mutationFn: async () => {
      const preset = matchGamePreset(newTitle);
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          platform,
          settings: preset ? { presetKey: newTitle } : null,
        }),
      });
      if (!res.ok) throw new Error('Failed to add game');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      setNewTitle('');
      setShowAdd(false);
      toast.success('Game linked to NitroBuff!');
    },
    onError: () => toast.error('Failed to link game'),
  });

  const optimizeGame = useMutation({
    mutationFn: async ({ id, optimized }: { id: number; optimized: boolean }) => {
      const res = await fetch(`/api/games/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optimized }),
      });
      if (!res.ok) throw new Error('Failed to optimize');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast.success('Game optimized for butter-smooth performance!');
    },
    onError: () => toast.error('Optimization failed'),
  });

  const deleteGame = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/games/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast('Game unlinked');
    },
    onError: () => toast.error('Failed to unlink game'),
  });

  if (!mounted) return null;

  const optimizedCount = games.filter((g: any) => g.optimized).length;
  const cpuPct = isBoosting ? 12 : 24;
  const ramPct = isBoosting ? 28 : 43;
  const fpsPct = isBoosting ? 97 : 82;

  const platforms = ['Steam', 'Epic Games', 'GOG', 'Battle.net', 'EA App', 'Local PC'];
  const popularGames = [
    'BloodStrike',
    'CS2',
    'Valorant',
    'Fortnite',
    'Apex Legends',
    'Overwatch 2',
    'Call of Duty: Warzone',
  ];

  return (
    <div className="min-h-screen" style={{ background: BG, color: '#F9FAFB' }}>
      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 border-b"
        style={{
          background: 'rgba(9,9,11,0.92)',
          borderColor: BORDER,
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: ACCENT, boxShadow: `0 0 16px ${GLOW}` }}
            >
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-black text-white tracking-tight text-lg">NitroBuff</span>
            <Tag color="purple">BETA</Tag>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {['Dashboard', 'Library', 'Analytics'].map((item) => (
              <button
                key={item}
                className={cn(
                  'text-sm font-medium transition-colors',
                  item === 'Dashboard' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.25)',
              color: '#10B981',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {isBoosting ? 'Boost Active' : 'Ready'}
          </div>
          <button
            onClick={() => setIsBoosting(!isBoosting)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all"
            style={{
              background: isBoosting
                ? 'linear-gradient(135deg,#F59E0B,#D97706)'
                : `linear-gradient(135deg,${ACCENT},#7C3AED)`,
              boxShadow: isBoosting ? '0 0 20px rgba(245,158,11,0.4)' : `0 0 20px ${GLOW}`,
            }}
          >
            <Flame size={14} />
            {isBoosting ? 'Boosting!' : 'Nitro Boost'}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-10">
        {/* ── Hero ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Tag color="purple">
              <Flame size={10} />
              v3.0 — Butter-Smooth Engine
            </Tag>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 leading-tight">
            Pro settings for every game.
            <br />
            <span style={{ color: ACCENT }}>Zero guesswork.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            Link your PC or Steam games and get the best sensitivity, graphics, and network settings
            used by pro players — instantly applied.
          </p>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Games Linked',
              value: games.length,
              icon: <Gauge size={16} className="text-purple-400" />,
              tag: 'Library',
            },
            {
              label: 'Optimized',
              value: optimizedCount,
              icon: <CheckCircle2 size={16} className="text-green-400" />,
              tag: 'Active',
            },
            {
              label: 'Game Presets',
              value: Object.keys(GAME_PRESETS).length,
              icon: <Star size={16} className="text-amber-400" />,
              tag: 'Built-in',
            },
            {
              label: 'Boost Status',
              value: isBoosting ? 'ON' : 'OFF',
              icon: <Zap size={16} className="text-purple-400" />,
              tag: isBoosting ? 'Active' : 'Idle',
            },
          ].map((s) => (
            <DarkCard key={s.label} className="p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(109,40,217,0.15)' }}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </DarkCard>
          ))}
        </div>

        {/* ── AI Playstyle Analyzer ── */}
        <PlaystyleAnalyzer />

        {/* ── Dashboard Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Performance Panel */}
          <div className="space-y-6">
            <DarkCard className="p-5" glowing={isBoosting}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-bold text-white">System Performance</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Real-time resource usage</p>
                </div>
                {isBoosting && (
                  <Tag color="amber">
                    <Flame size={10} />
                    Boosting
                  </Tag>
                )}
              </div>
              <div className="flex items-center justify-around mb-5">
                <Ring pct={cpuPct} label="CPU" value={`${cpuPct}%`} color="#6D28D9" />
                <Ring pct={ramPct} label="RAM" value={`${ramPct}%`} color="#F59E0B" />
                <Ring pct={fpsPct} label="Score" value={`${fpsPct}`} color="#10B981" />
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Priority Task Scheduling', active: true },
                  { label: 'GPU Buffer Cache Flush', active: isBoosting },
                  { label: 'Network Packet Prioritize', active: isBoosting },
                  { label: 'Input Lag Reduction', active: true },
                  { label: 'Thermal Throttle Bypass', active: isBoosting },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className={item.active ? 'text-gray-300' : 'text-gray-600'}>
                      {item.label}
                    </span>
                    <div
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        item.active ? 'bg-green-400' : 'bg-gray-700'
                      )}
                    />
                  </div>
                ))}
              </div>
            </DarkCard>

            {/* DPI Calculator */}
            <DPICalculator />
          </div>

          {/* Right: Game Library */}
          <div className="lg:col-span-2">
            <DarkCard className="p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-bold text-white">Game Library</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Click any game for pro settings</p>
                </div>
                <button
                  onClick={() => setShowAdd(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{
                    background: `linear-gradient(135deg,${ACCENT},#7C3AED)`,
                    boxShadow: `0 0 12px ${GLOW}`,
                  }}
                >
                  <Plus size={12} /> Link Game
                </button>
              </div>

              {/* Add Game Form */}
              {showAdd && (
                <div
                  className="rounded-xl p-4 mb-5 space-y-3"
                  style={{
                    background: 'rgba(109,40,217,0.08)',
                    border: '1px solid rgba(109,40,217,0.25)',
                  }}
                >
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Link New Game
                  </p>
                  <input
                    type="text"
                    placeholder="Game title (e.g. Valorant, CS2, Fortnite…)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && newTitle && addGame.mutate()}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-600"
                    style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${BORDER}` }}
                    autoFocus
                  />
                  {/* Quick pick popular */}
                  <div className="flex flex-wrap gap-1.5">
                    {popularGames.map((g) => (
                      <button
                        key={g}
                        onClick={() => setNewTitle(g)}
                        className="text-xs px-2.5 py-1 rounded-full transition-all"
                        style={{
                          background:
                            newTitle === g ? `rgba(109,40,217,0.4)` : 'rgba(255,255,255,0.05)',
                          border:
                            newTitle === g
                              ? '1px solid rgba(109,40,217,0.6)'
                              : `1px solid ${BORDER}`,
                          color: newTitle === g ? '#C4B5FD' : '#6B7280',
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="flex-1 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                      style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${BORDER}` }}
                    >
                      {platforms.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => newTitle && addGame.mutate()}
                      disabled={!newTitle || addGame.isPending}
                      className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-40 transition-all"
                      style={{ background: ACCENT, color: 'white' }}
                    >
                      {addGame.isPending ? '…' : 'Link'}
                    </button>
                    <button
                      onClick={() => setShowAdd(false)}
                      className="p-2 rounded-lg text-gray-500 hover:text-white transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Game List */}
              <div className="flex-1 space-y-3 overflow-y-auto" style={{ maxHeight: 480 }}>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 rounded-xl animate-pulse"
                      style={{ background: CARD }}
                    />
                  ))
                ) : games.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: 'rgba(109,40,217,0.15)' }}
                    >
                      <Zap size={24} className="text-purple-400" />
                    </div>
                    <p className="text-white font-semibold mb-1">No games linked yet</p>
                    <p className="text-xs text-gray-600 max-w-xs">
                      Link CS2, Valorant, Fortnite and more to get instant pro settings.
                    </p>
                    <button
                      onClick={() => setShowAdd(true)}
                      className="mt-4 text-xs font-bold text-purple-400 hover:text-purple-300"
                    >
                      + Link your first game
                    </button>
                  </div>
                ) : (
                  games.map((game: any) => {
                    const preset = matchGamePreset(game.title);
                    return (
                      <div
                        key={game.id}
                        className="group flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${BORDER}`,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = 'rgba(109,40,217,0.4)')
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
                        onClick={() => setSelectedGame({ name: game.title, preset })}
                      >
                        {/* Icon */}
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: 'rgba(109,40,217,0.12)' }}
                        >
                          {preset?.icon ?? '🎮'}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-bold text-white truncate">{game.title}</p>
                            {preset && <Tag color="purple">Pro Settings ✓</Tag>}
                          </div>
                          <p className="text-xs text-gray-500">
                            {game.platform} · {preset?.genre ?? 'Game'}
                          </p>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {game.optimized ? (
                            <Tag color="green">
                              <Zap size={10} />
                              {game.fps_gain ?? '+FPS'}
                            </Tag>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                optimizeGame.mutate({ id: game.id, optimized: true });
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all"
                              style={{
                                background: 'rgba(109,40,217,0.15)',
                                border: '1px solid rgba(109,40,217,0.35)',
                                color: '#A78BFA',
                              }}
                            >
                              <Zap size={10} />
                              Optimize
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGame({ name: game.title, preset });
                            }}
                            className="p-2 rounded-lg text-gray-500 hover:text-purple-400 transition-all"
                            style={{ background: 'rgba(255,255,255,0.04)' }}
                            title="View settings"
                          >
                            <Settings size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteGame.mutate(game.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-600 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </DarkCard>
          </div>
        </div>

        {/* ── Game Presets Showcase ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white">Supported Games & Pro Settings</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Click to preview settings — then link the game to your library
              </p>
            </div>
            <Tag color="purple">{Object.keys(GAME_PRESETS).length} games</Tag>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(GAME_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => setSelectedGame({ name: preset.name, preset })}
                className="group flex flex-col gap-2 p-4 rounded-xl text-left transition-all"
                style={{
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(109,40,217,0.5)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
              >
                <span className="text-2xl">{preset.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{key}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{preset.genre}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] text-purple-400 font-semibold">
                    eDPI {preset.sensitivity.edpi}
                  </span>
                  <ChevronRight
                    size={12}
                    className="text-gray-700 group-hover:text-purple-500 transition-colors"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Feature Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: <Crosshair size={20} className="text-purple-400" />,
              title: 'Sensitivity Profiles',
              desc: 'Pro-tuned DPI and in-game sensitivity for every competitive title.',
            },
            {
              icon: <Tv size={20} className="text-amber-400" />,
              title: 'Graphics Optimizer',
              desc: 'Max FPS settings that keep enemies visible and framerates sky-high.',
            },
            {
              icon: <Wifi size={20} className="text-green-400" />,
              title: 'Network Tuning',
              desc: 'Console commands and settings to eliminate lag spikes and high ping.',
            },
            {
              icon: <BarChart3 size={20} className="text-blue-400" />,
              title: 'Live Monitoring',
              desc: 'Real-time CPU, RAM and FPS tracking while Nitro Boost is active.',
            },
          ].map((f) => (
            <DarkCard key={f.title} className="p-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {f.icon}
              </div>
              <h4 className="text-sm font-bold text-white mb-2">{f.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </DarkCard>
          ))}
        </div>
      </main>

      {/* ── Settings Modal ── */}
      {selectedGame && (
        <SettingsModal
          preset={selectedGame.preset}
          gameName={selectedGame.name}
          onClose={() => setSelectedGame(null)}
        />
      )}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        body {
          background: #09090b;
        }
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #2a2a35;
          border-radius: 99px;
        }
        select option {
          background: #111115;
          color: white;
        }
        @keyframes pulse-dot {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        .animate-pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
