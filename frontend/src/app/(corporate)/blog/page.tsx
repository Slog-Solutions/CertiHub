"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, Tag, Search, BookOpen, User, ArrowRight } from "lucide-react";

/* ─── Official SEO Blog Posts with Software Development Images ─── */
const blogs = [
  {
    id: "how-to-turn-a-business-idea-into-software",
    title: "How to Turn a Business Idea Into Software: 8 Key Steps",
    excerpt:
      "Learn how to turn a business idea into successful software through validation, MVP development, UI/UX design, testing, launch, and scaling.",
    category: "Startup & Product Strategy",
    date: "August 22, 2026",
    readTime: "7 min",
    href: "/blog/how-to-turn-a-business-idea-into-software",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    icon: "🚀",
    author: "Slog Engineering Team",
  },
  {
    id: "custom-software-dehradun",
    title: "Custom Software Development in Dehradun: Why Off-the-Shelf Tools Are Holding Your Business Back",
    excerpt:
      "Thinking about custom software development? Here's how Dehradun businesses are ditching generic SaaS tools for solutions built around how they actually work.",
    category: "Software Development",
    date: "August 22, 2026",
    readTime: "6 min",
    href: "/blog/custom-software-development-dehradun",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    icon: "💻",
    author: "Slog Engineering Team",
  },
];

const categories = ["All", "Software Development", "Startup & Product Strategy"];

export default function BlogPage() {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const filtered = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || b.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#0a1628]">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute top-10 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div
          className={`relative transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            <BookOpen className="h-3.5 w-3.5" />
            Slog Solutions Official Blog
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
            Insights, Engineering &amp;{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Software Development
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
            Stay updated with the latest in custom software development, startup MVP building, IoT lab setups, and digital innovation from SLOG Solutions in Dehradun.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl pl-11 pr-5 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition"
            />
          </div>
        </div>
      </section>

      {/* ── Category Filter ── */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
                activeCategory === cat
                  ? "bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-cyan-500/40 hover:text-white"
              }`}
            >
              <Tag className="h-3 w-3" />
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Blog Grid ── */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-medium">No articles found.</p>
              <p className="text-sm mt-1">Try searching for &quot;custom software&quot; or &quot;idea into software&quot;.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filtered.map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-cyan-500/40 hover:shadow-2xl transition-all duration-300 justify-between"
                >
                  <div>
                    {/* Image Header */}
                    <div className="h-56 relative overflow-hidden bg-slate-900">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-teal-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        {post.category}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-3 text-xs text-cyan-400 font-medium">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" /> {post.author}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {post.readTime}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                        <Link href={post.href}>{post.title}</Link>
                      </h2>

                      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      href={post.href}
                      className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors group-hover:translate-x-1 duration-200"
                    >
                      Read Full Guide <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-cyan-600/20 to-teal-600/20 border border-cyan-500/20 rounded-2xl p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to Turn Your Business Idea Into Software?
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-xl mx-auto">
            Get in touch with Slog Solutions to discuss custom software development, MVP building, IoT lab setups, and product development tailored to your team&apos;s vision.
          </p>
          <Link
            href="/development"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors shadow-lg shadow-cyan-500/20"
          >
            Explore Development Services
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
