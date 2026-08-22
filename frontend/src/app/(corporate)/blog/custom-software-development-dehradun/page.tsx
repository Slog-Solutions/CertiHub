import type { Metadata } from "next";
import Link from "next/link";
import EnquiryForm from "@/components/EnquiryForm";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Building2,
  Lock,
} from "lucide-react";

// SEO Metadata export
export const metadata: Metadata = {
  title: "Custom Software Development in Dehradun: Why Off-the-Shelf Tools Are Holding Your Business Back",
  description:
    "Thinking about custom software development? Here's how Dehradun businesses are ditching generic SaaS tools for solutions built around how they actually work.",
  keywords: [
    "custom software development company in Dehradun",
    "software development Dehradun",
    "custom SaaS Uttarakhand",
    "IoT lab setup Dehradun",
    "Slog Solutions",
    "enterprise software Dehradun",
    "defence software Uttarakhand",
  ],
  authors: [{ name: "Slog Solutions Pvt. Ltd.", url: "https://www.slogsolutions.com" }],
  creator: "Slog Solutions Pvt. Ltd.",
  publisher: "Slog Solutions Pvt. Ltd.",
  metadataBase: new URL("https://www.slogsolutions.com"),
  alternates: {
    canonical: "/blog/custom-software-development-dehradun",
  },
  openGraph: {
    title: "Custom Software Development in Dehradun: Why Off-the-Shelf Tools Are Holding Your Business Back",
    description:
      "Thinking about custom software development? Here's how Dehradun businesses are ditching generic SaaS tools for solutions built around how they actually work.",
    url: "https://www.slogsolutions.com/blog/custom-software-development-dehradun",
    siteName: "Slog Solutions Pvt. Ltd.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Custom Software Development Company in Dehradun - Slog Solutions",
      },
    ],
    locale: "en_IN",
    type: "article",
    publishedTime: "2026-08-22T00:00:00.000Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Software Development in Dehradun: Why Off-the-Shelf Tools Are Holding Your Business Back",
    description:
      "Thinking about custom software development? Here's how Dehradun businesses are ditching generic SaaS tools for solutions built around how they actually work.",
    images: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"],
  },
};

// JSON-LD Structured Data Schema for Search Engines
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Custom Software Development in Dehradun: Why Off-the-Shelf Tools Are Holding Your Business Back",
  "description":
    "Thinking about custom software development? Here's how Dehradun businesses are ditching generic SaaS tools for solutions built around how they actually work.",
  "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  "author": {
    "@type": "Organization",
    "name": "Slog Solutions Pvt. Ltd.",
    "url": "https://www.slogsolutions.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Slog Solutions Pvt. Ltd.",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.slogsolutions.com/logo.png"
    }
  },
  "datePublished": "2026-08-22",
  "dateModified": "2026-08-22",
  "keywords": "custom software development company in Dehradun",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.slogsolutions.com/blog/custom-software-development-dehradun"
  }
};

export default function CustomSoftwareBlogPage() {
  return (
    <article className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 text-gray-800">
      {/* Inject JSON-LD Schema for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HEADER / HERO BANNER ───────────────────────────────────── */}
      <header className="relative pt-28 pb-20 bg-gradient-to-r from-teal-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMGFiYjEiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9zdmc+')] opacity-30" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-teal-300 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to All Articles
          </Link>

          <div className="space-y-4">
            <span className="px-3.5 py-1 bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold rounded-full uppercase tracking-wider">
              SOFTWARE ENGINEERING & DEHRADUN INDUSTRY
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Custom Software Development in Dehradun: Why Off-the-Shelf Tools Are Holding Your Business Back
            </h1>

            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-blue-200 border-t border-teal-500/30">
              <span className="flex items-center gap-1.5 font-semibold">
                <User className="h-4 w-4 text-teal-400" /> Slog Engineering Team
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-teal-400" /> August 22, 2026
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-teal-400" /> 6 min read
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ─────────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-xl border border-gray-100 space-y-8 leading-relaxed text-gray-700 text-base">
          
          {/* Featured Software Development Image */}
          <div className="relative h-[320px] sm:h-[420px] rounded-2xl overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"
              alt="Custom Software Development Company in Dehradun - Slog Solutions"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white text-xs">
              <p className="font-bold text-teal-300">Custom Software Engineering in Dehradun</p>
              <p className="text-[11px] text-gray-300">Building tailored digital systems & IoT infrastructure for local enterprises.</p>
            </div>
          </div>

          {/* Intro Paragraphs */}
          <div className="space-y-4 text-gray-700">
            <p className="text-lg font-medium text-gray-900 leading-relaxed">
              If you&apos;ve ever tried to force a generic SaaS tool to fit your business, you already know the drill. You sign up, you&apos;re excited for the first two weeks, and then reality sets in — the tool does 70% of what you need, and that missing 30% ends up costing you more in workarounds than the subscription itself.
            </p>

            <p>
              This is the quiet tax a lot of growing businesses in Dehradun and across Uttarakhand are paying without realizing it. Spreadsheets bolted onto CRMs. WhatsApp groups doing the job of a proper inventory system. Three different apps that don&apos;t talk to each other, and a team member whose actual job has quietly become &quot;manually copy data from Tool A into Tool B.&quot;
            </p>

            <p>
              At some point, the math stops working in favor of &quot;just buying software off the shelf.&quot; That&apos;s usually when <strong className="text-teal-700">custom software development in Dehradun</strong> starts to make sense.
            </p>
          </div>

          {/* Callout Quote Box */}
          <div className="p-6 bg-teal-50 border-l-4 border-teal-600 rounded-r-2xl space-y-2">
            <p className="text-sm font-bold text-teal-900 italic">
              &quot;The common thread of custom development is that software is shaped around how your team actually works, instead of forcing your team to work around the software.&quot;
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-4 pt-4">
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span className="p-2 bg-teal-100 text-teal-700 rounded-lg text-lg"><Layers className="h-5 w-5" /></span>
              What &quot;Custom Software&quot; Actually Means (It&apos;s Not as Scary as It Sounds)
            </h2>

            <p>
              There&apos;s a common misconception that custom software is only for large enterprises with massive budgets and six-month timelines. In practice, custom development today is a lot more accessible — and a lot more targeted — than that.
            </p>

            <p>
              It doesn&apos;t have to mean building an entire platform from scratch. As a leading <strong className="text-teal-700">custom software development company in Dehradun</strong>, we see custom software built as:
            </p>

            <ul className="space-y-2 border-l-2 border-teal-200 pl-4 py-2">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-1" />
                <span><strong>A single internal tool</strong> that automates one painful, repetitive operational process.</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-1" />
                <span><strong>An integration add-on</strong> that connects two systems that currently don&apos;t talk to each other.</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-1" />
                <span><strong>A full digital product</strong> built around a workflow that&apos;s genuinely unique to your business model.</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-1" />
                <span><strong>A lab setup or embedded solution</strong> paired with hardware, for teams working in robotics, IoT, or manufacturing.</span>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span className="p-2 bg-teal-100 text-teal-700 rounded-lg text-lg"><ShieldCheck className="h-5 w-5" /></span>
              Signs Your Business Has Outgrown Generic Tools
            </h2>

            <p>
              You don&apos;t need to overhaul everything at once. But a few warning signs are worth paying attention to:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <h3 className="font-bold text-gray-900 text-sm">1. Paying for unused features while missing critical ones</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Most SaaS pricing tiers are built for an average customer. If you&apos;re a manufacturing unit, a training institute, or a defence-adjacent operation in Uttarakhand, &quot;average&quot; rarely describes you.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <h3 className="font-bold text-gray-900 text-sm">2. Your team has built a workaround culture</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Manual exports, duplicate data entry, someone who &quot;just remembers&quot; to update three systems every evening — these are symptoms of software that doesn&apos;t fit.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <h3 className="font-bold text-gray-900 text-sm">3. Your data lives in disconnected silos</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  If your inventory system, your billing, and your customer records can&apos;t see each other, you&apos;re not running one business — you&apos;re running three disconnected ones sharing a bank account.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <h3 className="font-bold text-gray-900 text-sm">4. Security or compliance requirements are non-negotiable</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  This matters immensely for defence-sector work, government projects, and sensitive data. Off-the-shelf platforms generalize security rather than tailoring to your specific risk profile.
                </p>
              </div>
            </div>
          </section>

          {/* Mid-Article Image Feature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
            <div className="relative h-60 rounded-2xl overflow-hidden shadow-md">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
                alt="IoT and Robotics Hardware Software Setup Dehradun"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 p-2 rounded-lg text-white text-[10px]">
                Embedded Hardware & Robotics Software Integration
              </div>
            </div>
            <div className="relative h-60 rounded-2xl overflow-hidden shadow-md">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
                alt="Enterprise Analytics Software Application Dehradun"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 p-2 rounded-lg text-white text-[10px]">
                Enterprise Software Dashboard & Workflow System
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span className="p-2 bg-teal-100 text-teal-700 rounded-lg text-lg"><Cpu className="h-5 w-5" /></span>
              Custom Software vs. IoT and Robotics Integration: Where They Overlap
            </h2>

            <p>
              For businesses working in hardware — robotics, embedded systems, automated lab setups — custom software isn&apos;t really optional. Off-the-shelf tools are built for generic business processes, not for talking to sensors, actuators, or proprietary hardware.
            </p>

            <p>
              This is where software and physical infrastructure need to be designed together from day one. A robotics lab, for instance, isn&apos;t just about the hardware sitting on a bench. The training software, the monitoring dashboard, and the data logging system all need to work as one system, not three separate purchases stitched together after the fact.
            </p>

            <p>
              Teams that treat software as an afterthought to hardware setup usually end up rebuilding it within a year. Teams that plan both together tend to get systems that actually scale with them.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span className="p-2 bg-teal-100 text-teal-700 rounded-lg text-lg"><Zap className="h-5 w-5" /></span>
              What a Good Custom Development Process Looks Like
            </h2>

            <p>
              A lot of hesitation around custom software comes from horror stories — projects that ran over budget, took twice as long as promised, or delivered something nobody on the team actually wanted to use. Those stories are usually the result of skipping steps, not a problem with custom development itself.
            </p>

            <p>
              A process that actually works tends to follow a predictable shape:
            </p>

            <ol className="space-y-3 list-decimal list-inside text-sm font-medium text-gray-800 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <li>
                <strong>Understanding the workflow before writing any code:</strong> Sitting with the people who&apos;ll actually use the software, not just the person signing off on the budget.
              </li>
              <li>
                <strong>Building in stages, not one giant reveal:</strong> Small, testable pieces let you catch mismatches early when they&apos;re cheap to fix.
              </li>
              <li>
                <strong>Planning for scale from the start:</strong> A system that works for 10 users should be built so it doesn&apos;t collapse at 500 — even if you&apos;re not there yet.
              </li>
              <li>
                <strong>Training and handover, not just deployment:</strong> Software that nobody knows how to use properly is just an expensive way of recreating old problems in a new interface.
              </li>
            </ol>
          </section>

          {/* Section 5 */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Is Custom Software Right for You?
            </h2>

            <p>
              Not every business needs it, and that&apos;s fine. If your workflows genuinely match what a mainstream tool offers, there&apos;s no reason to build something custom just for the sake of it.
            </p>

            <p>
              But if you&apos;ve read this far and recognized your own team in the &quot;workaround culture&quot; section, it&apos;s worth having a conversation about what a tailored solution would actually look like — and what it would cost compared to the workarounds you&apos;re already paying for, just less visibly.
            </p>

            <p>
              <strong className="text-teal-700">Slog Solutions</strong> works with businesses, training institutes, and government and defence-sector teams across Uttarakhand to build custom software, IoT and robotics lab setups, and product development that&apos;s designed around real workflows from the start — not retrofitted after the fact.
            </p>
          </section>

          {/* CTA Box */}
          <div className="bg-gradient-to-r from-teal-800 to-blue-900 rounded-3xl p-8 text-white space-y-4 shadow-xl">
            <h3 className="text-2xl font-bold">Ready to Ditch Generic SaaS Tools?</h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              If you&apos;re weighing custom development against another off-the-shelf subscription, get in touch with Slog Solutions to talk through what a system built for your actual workflow could look like.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <EnquiryForm
                courseInterested="Custom Software Development in Dehradun"
                triggerButton={
                  <button className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full text-xs shadow-lg transition-colors">
                    Talk to Our Software Directors →
                  </button>
                }
              />
              <Link
                href="/development"
                className="px-6 py-3 border border-white/40 text-white font-bold rounded-full text-xs hover:bg-white/10 transition-colors"
              >
                Explore Built Projects
              </Link>
            </div>
          </div>

        </div>
      </div>
    </article>
  );
}
