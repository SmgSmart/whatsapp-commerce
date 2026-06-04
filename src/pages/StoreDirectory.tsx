import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, ExternalLink, Search, Zap, Shield, ChevronRight, Star, TrendingUp, Store, Sparkles } from 'lucide-react';
import { publicApi } from '../lib/api';
import type { BusinessInfo } from '../lib/types';

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant WhatsApp Checkout',
    desc: 'Browse products and order directly via WhatsApp — no accounts needed.',
    gradient: 'from-amber-400 to-orange-500',
    glow: 'shadow-orange-500/20',
  },
  {
    icon: Shield,
    title: 'Verified Local Stores',
    desc: 'Every store is real and operated by verified business owners near you.',
    gradient: 'from-emerald-400 to-teal-500',
    glow: 'shadow-emerald-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Zero Commission Sales',
    desc: 'Sellers keep 100% of their revenue — no hidden fees, ever.',
    gradient: 'from-violet-400 to-purple-600',
    glow: 'shadow-violet-500/20',
  },
];

const STORE_GRADIENTS = [
  'from-indigo-500 to-violet-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-purple-600',
];

export function StoreDirectory() {
  const [stores, setStores] = useState<BusinessInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchStores() {
      try {
        const data = await publicApi.getAllStores();
        setStores(data);
      } catch (error) {
        console.error('Failed to fetch stores:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return stores;
    return stores.filter(
      (s) =>
        s.business_name.toLowerCase().includes(q) ||
        (s.location || '').toLowerCase().includes(q) ||
        (s.tagline || '').toLowerCase().includes(q),
    );
  }, [stores, search]);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="animate-pulse-slow absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div
            className="animate-pulse-slow absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px]"
            style={{ animationDelay: '3s' }}
          />
          <div
            className="animate-pulse-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-pink-600/10 blur-[100px]"
            style={{ animationDelay: '6s' }}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Sticky Nav */}
        <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Cartsy
            </span>
          </div>
          <Link
            to="/admin/login"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-sm font-semibold transition-all duration-200 backdrop-blur-sm"
          >
            <Store className="w-4 h-4" />
            Open Your Store
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {stores.length > 0 ? `${stores.length} verified stores and growing` : 'WhatsApp-powered commerce'}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            <span className="text-white">Shop local.</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Order on WhatsApp.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Discover verified local stores, browse their products, and checkout instantly via WhatsApp — no app downloads, no sign-ups needed.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="store-search"
              type="text"
              placeholder="Search stores by name or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/8 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 backdrop-blur-sm text-base"
            />
          </div>
        </div>

        {/* Hero bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-slate-950 pointer-events-none" />
      </section>

      {/* ─── STORES GRID ──────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 animate-spin border-t-indigo-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-28">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {search ? 'No stores match your search' : 'No stores yet'}
            </h3>
            <p className="text-slate-500">
              {search ? 'Try a different keyword.' : 'Check back soon — new stores are opening every day.'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/20 transition-all"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-slate-500 text-sm mb-8">
              {search
                ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"`
                : `${filtered.length} store${filtered.length !== 1 ? 's' : ''} available`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((store, i) => {
                const gradient = STORE_GRADIENTS[i % STORE_GRADIENTS.length];
                return (
                  <Link
                    key={store.slug}
                    to={`/store/${store.slug}`}
                    className="group relative rounded-3xl overflow-hidden border border-white/8 bg-white/4 hover:bg-white/7 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-900/30 flex flex-col backdrop-blur-sm"
                  >
                    {/* Banner */}
                    <div className="relative h-44 overflow-hidden">
                      {store.hero_banner_url ? (
                        <img
                          src={store.hero_banner_url}
                          alt={store.business_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradient} opacity-80`}>
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-white/20" />
                          </div>
                        </div>
                      )}
                      {/* Gradient overlay on banner */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />

                      {/* Live badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-300 text-xs font-semibold">Open</span>
                      </div>

                      {/* Logo Avatar */}
                      <div className="absolute bottom-4 left-4">
                        <div className="w-14 h-14 rounded-2xl shadow-xl border-2 border-white/10 overflow-hidden">
                          {store.logo_url ? (
                            <img
                              src={store.logo_url}
                              alt={store.business_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                              <span className="text-white font-black text-xl">
                                {store.business_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Store Info */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h2 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-tight">
                          {store.business_name}
                        </h2>
                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0 mt-0.5" />
                      </div>

                      {store.tagline && (
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed italic">
                          "{store.tagline}"
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[120px]">{store.location || 'Online Store'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="font-semibold">New</span>
                        </div>
                      </div>
                    </div>

                    {/* Hover gradient glow */}
                    <div className="absolute inset-0 rounded-3xl ring-1 ring-indigo-500/0 group-hover:ring-indigo-500/20 transition-all duration-300 pointer-events-none" />
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Why{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              sellers & shoppers
            </span>{' '}
            love Cartsy
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            The simplest way to run a store and the fastest way to shop locally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`relative rounded-3xl p-7 bg-white/4 border border-white/8 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${f.glow} overflow-hidden group`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              {/* Subtle gradient glow in corner */}
              <div className={`absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br ${f.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-300`} />
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="relative max-w-4xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden p-10 sm:p-14 text-center">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/15 to-pink-600/10 border border-white/10 rounded-3xl" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/8 border border-white/10 text-slate-300 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Free to start • No credit card required
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ready to launch your store?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">
              Set up your WhatsApp store in under 5 minutes and start selling to local customers today.
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-lg shadow-xl shadow-indigo-900/50 hover:shadow-indigo-900/70 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]"
            >
              <Store className="w-5 h-5" />
              Create Your Free Store
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-white/8 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">Cartsy</span>
          </div>
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} Cartsy. WhatsApp E-commerce Platform.
          </p>
          <Link
            to="/admin/login"
            className="text-slate-500 hover:text-indigo-400 text-sm transition-colors"
          >
            Seller Portal →
          </Link>
        </div>
      </footer>
    </div>
  );
}
