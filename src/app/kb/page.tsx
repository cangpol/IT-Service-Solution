'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { KnowledgeArticle } from '@/lib/types';
import { 
  BookOpen, 
  Search, 
  ChevronDown, 
  ThumbsUp, 
  Eye, 
  Tag, 
  ArrowRight,
  HelpCircle,
  Sparkles
} from 'lucide-react';

function KnowledgeBaseContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(1); // Open first article by default
  const [helpfulArticles, setHelpfulArticles] = useState<number[]>([]);

  const categories = [
    'ALL',
    'Jaringan & WiFi',
    'Sistem Akademik',
    'Akun & Software',
    'Multimedia',
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set('search', searchQuery);
        if (selectedCategory && selectedCategory !== 'ALL') queryParams.set('category', selectedCategory);

        const res = await fetch(`/api/kb?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success) {
          setArticles(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchArticles();
  }, [searchQuery, selectedCategory]);

  const toggleAccordion = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleHelpfulClick = (id: number) => {
    if (!helpfulArticles.includes(id)) {
      setHelpfulArticles([...helpfulArticles, id]);
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, helpfulCount: a.helpfulCount + 1 } : a))
      );
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Knowledge Base & Solusi Mandiri</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Pusat Bantuan Sivitas UPITRA
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Temukan solusi mandiri secara cepat untuk kendala WiFi kampus, aktivasi Office 365, reset sandi SIAKAD, dan fasilitas multimedia tanpa perlu antre tiket.
        </p>

        {/* Search Bar */}
        <div className="relative pt-2">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari solusi kendala (misal: wifi, reset password, office 365, proyektor)..."
            className="w-full text-xs sm:text-sm pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 shadow-xs focus:ring-2 focus:ring-upitra-navy focus:outline-hidden"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-upitra-navy text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Accordion List */}
      <div className="space-y-4">
        {articles.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-soft space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">
              Tidak ada artikel yang cocok dengan pencarian Anda
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Coba gunakan kata kunci umum lainnya atau ajukan tiket bantuan baru ke tim teknisi BTIK UPITRA.
            </p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-upitra-navy hover:bg-upitra-blue text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors mt-2"
            >
              <span>Ajukan Tiket Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          articles.map((art) => {
            const isExpanded = expandedId === art.id;
            const isVoted = helpfulArticles.includes(art.id);

            return (
              <div
                key={art.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleAccordion(art.id)}
                  className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {art.category}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {art.views} dilihat
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" /> {art.helpfulCount} terbantu
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 pt-1">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className={`p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0 transition-transform ${isExpanded ? 'rotate-180 bg-slate-200' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-6">
                    <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {art.content}
                    </div>

                    {art.tags && (
                      <div className="flex items-center gap-2 flex-wrap pt-2">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        {art.tags.split(',').map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono"
                          >
                            #{t.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Was this helpful? */}
                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <span className="text-slate-600 font-medium">
                        Apakah panduan ini membantu menyelesaikan kendala Anda?
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleHelpfulClick(art.id)}
                          disabled={isVoted}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                            isVoted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                          <span>{isVoted ? 'Terima kasih!' : 'Ya, Sangat Membantu'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still need help? CTA Banner */}
      <section className="bg-gradient-to-br from-upitra-navy to-upitra-blue text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-white/10 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kendala Belum Terpecahkan?</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Butuh Bantuan Langsung dari Teknisi BTIK?
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Sampaikan kendala Anda melalui formulir tiket agar petugas IT dapat langsung datang ke ruangan Anda atau menangani kendala akun di server.
          </p>
        </div>

        <Link
          href="/submit"
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-950/40 transition-all shrink-0 flex items-center gap-2"
        >
          <span>Buat Tiket Bantuan</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}

export default function KnowledgeBasePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Memuat panduan knowledge base...</div>}>
        <KnowledgeBaseContent />
      </Suspense>
    </div>
  );
}

