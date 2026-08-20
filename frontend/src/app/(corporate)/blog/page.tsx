"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, Tag, Search, BookOpen } from "lucide-react";

/* ─── Static blog posts – swap for an API call when a CMS is ready ─── */
const blogs = [
  {
    id: 1,
    title: "How AI & Machine Learning Are Reshaping Corporate Training",
    excerpt:
      "Discover how SLOG is integrating AI-driven personalised learning paths to help organisations upskill their workforce faster and more effectively.",
    category: "AI & ML",
    date: "August 12, 2026",
    readTime: "5 min",
    href: "https://www.slogsolutions.com/blog",
    gradient: "from-cyan-500 to-blue-600",
    icon: "🤖",
  },
  {
    id: 2,
    title: "Outbound Training: Why Teams That Play Together Stay Together",
    excerpt:
      "Explore the psychology behind experiential learning and how SLOG's outbound programs have transformed team dynamics across 50+ corporate clients.",
    category: "Team Building",
    date: "August 5, 2026",
    readTime: "4 min",
    href: "https://www.slogsolutions.com/blog",
    gradient: "from-teal-500 to-emerald-600",
    icon: "🏕️",
  },
  {
    id: 3,
    title: "GeM Portal Onboarding: A Step-by-Step Guide for MSMEs",
    excerpt:
      "SLOG Solutions is a registered GeM vendor. This guide walks MSMEs through vendor registration, catalogue listing, and winning their first order.",
    category: "Government",
    date: "July 28, 2026",
    readTime: "6 min",
    href: "https://www.slogsolutions.com/blog",
    gradient: "from-violet-500 to-purple-600",
    icon: "🏛️",
  },
  {
    id: 4,
    title: "Top 5 Civil CAD Skills Every Engineering Student Needs in 2026",
    excerpt:
      "From AutoCAD to BIM modelling – our trainers break down the most in-demand CAD skills that recruiters are looking for right now.",
    category: "Student Training",
    date: "July 20, 2026",
    readTime: "3 min",
    href: "https://www.slogsolutions.com/blog",
    gradient: "from-orange-500 to-amber-600",
    icon: "📐",
  },
  {
    id: 5,
    title: "Defence Technology: SLOG's Role in Modernising the Indian Army",
    excerpt:
      "An inside look at how SLOG has delivered software and lab infrastructure solutions to defence establishments across Uttarakhand.",
    category: "Defence",
    date: "July 10, 2026",
    readTime: "7 min",
    href: "https://www.slogsolutions.com/blog",
    gradient: "from-slate-500 to-gray-700",
    icon: "🛡️",
  },
  {
    id: 6,
    title: "Digital Marketing in 2026: What the Numbers Actually Say",
    excerpt:
      "SLOG's digital marketing trainers analyse the latest trends – short-form video, AI-driven SEO, and hyper-personalisation – and what they mean for your career.",
    category: "Digital Marketing",
    date: "June 30, 2026",
    readTime: "5 min",
    href: "https://www.slogsolutions.com/blog",
    gradient: "from-pink-500 to-rose-600",
    icon: "📊",
  },
];

const categories = ["All", ...Array.from(new Set(blogs.map((b) => b.category)))];

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
            Slog Solutions Blog
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
            Insights, Ideas &amp;{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Industry News
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
            Stay updated with the latest from the world of training, technology, and
            innovation — straight from the SLOG team in Dehradun.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search articles…"
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
        <div className="max-w-6xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-medium">No articles found.</p>
              <p className="text-sm mt-1">Try a different search term or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post, i) => (
                <article
                  key={post.id}
                  style={{ transitionDelay: `${i * 60}ms` }}
                  className={`group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                >
                  {/* Card header gradient */}
                  <div
                    className={`h-36 bg-gradient-to-br ${post.gradient} flex items-center justify-center text-5xl select-none`}
                  >
                    {post.icon}
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-[11px] text-gray-500">
                      <span className="bg-cyan-500/10 text-cyan-400 font-semibold px-2 py-0.5 rounded-full">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime} read
                      </span>
                      <span>{post.date}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-sm font-bold text-white leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Read more */}
                    <Link
                      href={post.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Read Article
                      <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
            Want to write for us?
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-xl mx-auto">
            Are you an expert in technology, training, or industry trends? We&apos;d love
            to feature your insights on the SLOG Blog.
          </p>
          <a
            href="mailto:info@slogsolutions.com"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors shadow-lg shadow-cyan-500/20"
          >
            Get in Touch
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}
