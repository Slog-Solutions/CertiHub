"use client";

import React, { useState, useEffect } from "react";
import { Award, CheckCircle, AlertTriangle, XCircle, Calendar, BookOpen, ShieldCheck, Download, Loader, Search } from "lucide-react";

type CertificateData = {
  certificateId: string;
  studentName: string;
  registrationNo: string;
  courseName: string;
  duration: string;
  issueDate: string;
  status: string;
  pdfUrl?: string;
};

export default function VerifyCertificatePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CertificateData | null>(null);
  const [error, setError] = useState("");
  const [searchId, setSearchId] = useState("");
  const [certificateId, setCertificateId] = useState("");

  // Extract ID from path (e.g. /verify/STP-XXXX-XX) or query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const parts = pathname.split("/").filter(Boolean);
      // If path is /verify/ID, parts will be ["verify", "ID"]
      if (parts.length > 1 && parts[0] === "verify") {
        setCertificateId(parts[1]);
      } else {
        // Fallback to query param ?id=XXX if any
        const searchParams = new URLSearchParams(window.location.search);
        const qId = searchParams.get("id");
        if (qId) {
          setCertificateId(qId);
        } else {
          setLoading(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!certificateId) {
      setData(null);
      setError("");
      setLoading(false);
      return;
    }

    const fetchVerification = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/certificates/verify/${certificateId}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Certificate ID not found or invalid");
        }
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || "Verification Failed: Certificate ID not found or invalid");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [certificateId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      // Update state and window URL history without reloading the page
      setCertificateId(searchId.trim());
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", `/verify/${searchId.trim()}`);
      }
    }
  };

  const handleReset = () => {
    setCertificateId("");
    setSearchId("");
    setData(null);
    setError("");
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/verify");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-r from-teal-950 via-slate-900 to-blue-950 transition-colors duration-300 px-4 py-32 relative min-h-screen text-slate-100 font-sans">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-8 relative z-10">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white shadow-xl shadow-teal-500/20">
            <Award className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-3xl font-extrabold text-white tracking-tight">Certificate Verification</h2>
          <p className="text-sm text-teal-400/80 mt-2 font-medium tracking-wide uppercase">Credentials Authentication Portal</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-teal-500/25 rounded-2xl p-8 shadow-2xl text-left">
          {!certificateId ? (
            /* Search Form Screen */
            <div className="space-y-6">
              <p className="text-sm text-slate-300 text-center leading-relaxed">
                Enter your unique Slog Solutions Registration Number or Certificate ID below to verify its authenticity and check credentials.
              </p>
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400" />
                  <input
                    type="text"
                    required
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Enter Registration No (e.g. STP-YYYY-...)"
                    className="w-full rounded-xl border border-teal-500/20 bg-slate-950/80 pl-12 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 transition-all duration-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white py-3 text-sm font-semibold shadow-lg shadow-teal-900/30 transition-all duration-300 transform hover:scale-[1.01]"
                >
                  Verify Credentials
                </button>
              </form>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader className="h-10 w-10 animate-spin text-teal-400" />
              <span className="text-sm text-teal-400/80 font-medium">Verifying credential ID...</span>
            </div>
          ) : error ? (
            <div className="text-center py-6 space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <XCircle className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-rose-400">Invalid Certificate</h3>
                <p className="text-sm text-slate-400 px-4 leading-relaxed">{error}</p>
              </div>
              <div className="pt-4 flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 inline-flex justify-center rounded-xl bg-slate-950 border border-teal-500/20 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-900 transition-all"
                >
                  Search Again
                </button>
                <button
                  onClick={() => { if (typeof window !== "undefined") window.location.href = "/"; }}
                  className="flex-1 inline-flex justify-center rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-3 text-sm font-semibold hover:from-teal-400 hover:to-emerald-400 transition-all"
                >
                  Return Home
                </button>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="text-center pb-6 border-b border-teal-500/15">
                {data.status === "Active" ? (
                  <>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-emerald-400">Verified Authentic</h3>
                    <p className="text-xs text-slate-400 mt-1">This certificate is genuine and active</p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-rose-400">Revoked / Suspended</h3>
                    <p className="text-xs text-slate-400 mt-1">This certificate is no longer active or valid</p>
                  </>
                )}
              </div>

              {/* Certificate Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-teal-500/5 text-sm">
                  <span className="text-slate-400 font-medium">Certificate ID</span>
                  <span className="col-span-2 text-white font-mono font-bold tracking-wider">{data.certificateId}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-b border-teal-500/5 text-sm">
                  <span className="text-slate-400 font-medium">Student Name</span>
                  <span className="col-span-2 text-slate-100 font-semibold">{data.studentName}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-b border-teal-500/5 text-sm">
                  <span className="text-slate-400 font-medium">Registration No</span>
                  <span className="col-span-2 text-slate-200 font-mono">{data.registrationNo}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-b border-teal-500/5 text-sm">
                  <span className="text-slate-400 font-medium">Course Stream</span>
                  <span className="col-span-2 text-slate-200 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-teal-400 flex-shrink-0" />
                    {data.courseName}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-b border-teal-500/5 text-sm">
                  <span className="text-slate-400 font-medium">Duration</span>
                  <span className="col-span-2 text-slate-200">{data.duration}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-b border-teal-500/5 text-sm">
                  <span className="text-slate-400 font-medium">Issued Date</span>
                  <span className="col-span-2 text-slate-200 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-400 flex-shrink-0" />
                    {new Date(data.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 inline-flex justify-center rounded-xl bg-slate-950 border border-teal-500/20 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-900 transition-all"
                >
                  Verify Another
                </button>
                {data.status === "Active" && data.pdfUrl && (
                  <a
                    href={`/api/certificates/verify/${data.certificateId}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:from-teal-400 hover:to-emerald-400 shadow-lg shadow-teal-900/30 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer branding */}
        <div className="flex justify-center items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-teal-400/80" />
          <span>Slog Solutions Automated Encryption Secured System</span>
        </div>
      </div>
    </div>
  );
}
