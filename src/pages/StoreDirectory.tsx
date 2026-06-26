import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, ExternalLink, Search, Zap, Shield, ChevronRight, Star, TrendingUp, Store, Sparkles } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { publicApi } from '../lib/api';
import type { BusinessInfo } from '../lib/types';

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant WhatsApp Checkout',
    desc: 'Browse products and order directly via WhatsApp — no accounts needed.',
    gradient: 'from-brand-bronze to-brand-cream',
    glow: 'shadow-brand-cream/15',
  },
  {
    icon: Shield,
    title: 'Verified Local Stores',
    desc: 'Every store is real and operated by verified business owners near you.',
    gradient: 'from-brand-steel to-brand-slate',
    glow: 'shadow-brand-steel/15',
  },
  {
    icon: TrendingUp,
    title: 'Zero Commission Sales',
    desc: 'Sellers keep 100% of their revenue — no hidden fees, ever.',
    gradient: 'from-brand-slate to-brand-bronze',
    glow: 'shadow-brand-bronze/15',
  },
];

const STORE_GRADIENTS = [
  'from-brand-steel to-brand-slate',
  'from-brand-bronze to-brand-cream',
  'from-brand-dark to-brand-steel',
  'from-brand-slate to-brand-bronze',
  'from-brand-steel to-brand-cream',
  'from-brand-dark to-brand-bronze',
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
    <div className="min-h-screen bg-brand-dark text-brand-gray overflow-x-hidden">
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="animate-pulse-slow absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-brand-steel/20 blur-[120px]" />
          <div
            className="animate-pulse-slow absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-bronze/20 blur-[120px]"
            style={{ animationDelay: '3s' }}
          />
          <div
            className="animate-pulse-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-brand-cream/10 blur-[100px]"
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-bronze to-brand-cream flex items-center justify-center shadow-lg shadow-brand-cream/20">
              <ShoppingBag className="w-5 h-5 text-brand-dark" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-header to-brand-header/70 bg-clip-text text-transparent">
              Cartsy
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/admin/login"
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-steel/10 hover:bg-brand-steel/20 border border-brand-steel/15 hover:border-brand-steel/25 text-sm font-semibold transition-all duration-200 backdrop-blur-sm text-brand-header"
            >
              <Store className="w-4 h-4 text-brand-cream" />
              Open Your Store
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-brand-cream/10 border border-brand-cream/20 text-brand-cream text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {stores.length > 0 ? `${stores.length} verified stores and growing` : 'WhatsApp-powered commerce'}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            <span className="text-brand-header">Shop local.</span>
            <br />
            <span className="bg-gradient-to-r from-brand-cream via-brand-bronze to-brand-slate bg-clip-text text-transparent">
              Order on WhatsApp.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-brand-slate max-w-2xl mx-auto mb-12 leading-relaxed">
            Discover verified local stores, browse their products, and checkout instantly via WhatsApp — no app downloads, no sign-ups needed.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-slate" />
            <input
              id="store-search"
              type="text"
              placeholder="Search stores by name or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-brand-steel/10 border border-brand-steel/15 text-brand-header placeholder-brand-slate/60 focus:outline-none focus:border-brand-cream/60 focus:bg-brand-steel/20 focus:ring-2 focus:ring-brand-cream/20 transition-all duration-200 backdrop-blur-sm text-base"
            />
          </div>
        </div>

        {/* Hero bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-brand-dark pointer-events-none" />
      </section>

      {/* ─── STORES GRID ──────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-brand-steel/20 animate-spin border-t-brand-cream" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-brand-slate" />
              </div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-28">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-brand-steel" />
            </div>
            <h3 className="text-xl font-bold text-brand-header mb-2">
              {search ? 'No stores match your search' : 'No stores yet'}
            </h3>
            <p className="text-brand-slate">
              {search ? 'Try a different keyword.' : 'Check back soon — new stores are opening every day.'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-6 px-6 py-2.5 rounded-xl bg-brand-cream/10 border border-brand-cream/20 text-brand-cream text-sm font-medium hover:bg-brand-cream/20 transition-all"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-brand-slate text-sm mb-8">
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
                    className="group relative rounded-3xl overflow-hidden border border-brand-steel/15 bg-brand-steel/10 hover:bg-brand-steel/20 hover:border-brand-steel/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-dark/50 flex flex-col backdrop-blur-sm"
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
                        <div className={`w-full h-full bg-gradient-to-br ${gradient} opacity-85`}>
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-white/20" />
                          </div>
                        </div>
                      )}
                      {/* Gradient overlay on banner */}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />

                      {/* Live badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-cream/25 border border-brand-cream/35 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-cream animate-pulse" />
                        <span className="text-brand-cream text-xs font-bold">Open</span>
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
                    <div className="p-5 flex-1 flex flex-col bg-brand-dark/40">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h2 className="text-base font-bold text-brand-header group-hover:text-brand-cream transition-colors leading-tight">
                          {store.business_name}
                        </h2>
                        <ExternalLink className="w-4 h-4 text-brand-slate group-hover:text-brand-cream transition-colors shrink-0 mt-0.5" />
                      </div>

                      {store.tagline && (
                        <p className="text-brand-slate text-sm mb-4 line-clamp-2 leading-relaxed italic">
                          "{store.tagline}"
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-brand-steel/10">
                        <div className="flex items-center gap-1.5 text-brand-slate text-xs">
                          <MapPin className="w-3.5 h-3.5 text-brand-bronze" />
                          <span className="truncate max-w-[120px]">{store.location || 'Online Store'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-brand-cream">
                          <Star className="w-3.5 h-3.5 fill-brand-cream text-brand-cream" />
                          <span className="font-semibold">New</span>
                        </div>
                      </div>
                    </div>

                    {/* Hover gradient glow */}
                    <div className="absolute inset-0 rounded-3xl ring-1 ring-brand-cream/0 group-hover:ring-brand-cream/20 transition-all duration-300 pointer-events-none" />
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
          <h2 className="text-3xl sm:text-4xl font-black text-brand-header mb-4">
            Why{' '}
            <span className="bg-gradient-to-r from-brand-cream to-brand-bronze bg-clip-text text-transparent">
              sellers & shoppers
            </span>{' '}
            love Cartsy
          </h2>
          <p className="text-brand-slate text-lg max-w-xl mx-auto">
            The simplest way to run a store and the fastest way to shop locally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`relative rounded-3xl p-7 bg-brand-steel/10 border border-brand-steel/15 hover:border-brand-steel/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${f.glow} overflow-hidden group`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className="w-6 h-6 text-brand-dark" />
              </div>
              <h3 className="text-lg font-bold text-brand-header mb-2">{f.title}</h3>
              <p className="text-brand-slate text-sm leading-relaxed">{f.desc}</p>
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
          <div className="absolute inset-0 bg-gradient-to-br from-brand-steel/30 via-brand-bronze/10 to-brand-cream/5 border border-brand-steel/15 rounded-3xl" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-steel/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-bronze/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-brand-steel/10 border border-brand-steel/15 text-brand-slate text-sm font-medium">
              <Sparkles className="w-4 h-4 text-brand-cream" />
              Free to start • No credit card required
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-header mb-4">
              Ready to launch your store?
            </h2>
            <p className="text-brand-slate text-lg mb-10 max-w-lg mx-auto">
              Set up your WhatsApp store in under 5 minutes and start selling to local customers today.
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-bronze to-brand-cream text-brand-dark font-bold text-lg shadow-xl shadow-brand-cream/10 hover:shadow-brand-cream/20 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]"
            >
              <Store className="w-5 h-5" />
              Create Your Free Store
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-brand-steel/20 bg-brand-dark/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-bronze to-brand-cream flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-brand-dark" />
            </div>
            <span className="text-brand-header font-bold text-sm">Cartsy</span>
          </div>
          <p className="text-brand-slate text-sm">
            © {new Date().getFullYear()} Cartsy. WhatsApp E-commerce Platform.
          </p>
          <Link
            to="/admin/login"
            className="text-brand-slate hover:text-brand-cream text-sm transition-colors"
          >
            Seller Portal →
          </Link>
        </div>
      </footer>
    </div>
  );
}
