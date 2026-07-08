import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Award, CheckCircle, AlertTriangle, XCircle, Calendar, BookOpen, ShieldCheck, Download, Loader } from 'lucide-react';

const VerifyCertificate = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        setError('');
        const res = await axios.get(`/api/certificates/verify/${id}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Verification Failed: Certificate ID not found or invalid');
      } finally {
        setLoading(false);
      }
    };
    fetchVerification();
  }, [id]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-cream)] transition-colors duration-300 px-4 py-12">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-teal-500/5 blur-3xl" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
            <Award className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-[var(--text-dark)]">Certificate Verification</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Credentials Authentication Portal</p>
        </div>

        <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl p-8 shadow-xl shadow-slate-950/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="text-xs text-[var(--text-muted)]">Verifying credential ID...</span>
            </div>
          ) : error ? (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                <XCircle className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-rose-400">Invalid Certificate</h3>
                <p className="text-xs text-[var(--text-muted)] px-4 leading-relaxed">{error}</p>
              </div>
              <div className="pt-4">
                <a
                  href="/"
                  className="inline-flex justify-center rounded-lg bg-[var(--bg-cream)] px-4 py-2 text-xs font-semibold text-[var(--text-dark)] hover:bg-[var(--bg-cream)] transition"
                >
                  Return to Portal
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="text-center pb-4 border-b border-[var(--border-color)]">
                {data.status === 'Active' ? (
                  <>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <CheckCircle className="h-7 w-7" />
                    </div>
                    <h3 className="mt-3 text-base font-bold text-emerald-400">Verified Authentic</h3>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">This certificate is genuine and active</p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
                      <AlertTriangle className="h-7 w-7" />
                    </div>
                    <h3 className="mt-3 text-base font-bold text-rose-400">Revoked / Suspended</h3>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">This certificate is no longer active or valid</p>
                  </>
                )}
              </div>

              {/* Certificate Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-[var(--border-color)]/40 text-xs">
                  <span className="text-[var(--text-muted)] font-medium">Certificate ID</span>
                  <span className="col-span-2 text-[var(--text-dark)] font-mono font-bold">{data.certificateId}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-[var(--border-color)]/40 text-xs">
                  <span className="text-[var(--text-muted)] font-medium">Student Name</span>
                  <span className="col-span-2 text-[var(--text-dark)]">{data.studentName}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-[var(--border-color)]/40 text-xs">
                  <span className="text-[var(--text-muted)] font-medium">Registration No</span>
                  <span className="col-span-2 text-[var(--text-dark)] font-mono">{data.registrationNo}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-[var(--border-color)]/40 text-xs">
                  <span className="text-[var(--text-muted)] font-medium">Course Stream</span>
                  <span className="col-span-2 text-[var(--text-dark)] flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
                    {data.courseName}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-[var(--border-color)]/40 text-xs">
                  <span className="text-[var(--text-muted)] font-medium">Duration</span>
                  <span className="col-span-2 text-[var(--text-dark)]">{data.duration}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-[var(--border-color)]/40 text-xs">
                  <span className="text-[var(--text-muted)] font-medium">Issued Date</span>
                  <span className="col-span-2 text-[var(--text-dark)] flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                    {new Date(data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              {data.status === 'Active' && (
                <div className="pt-4 flex gap-3">
                  <a
                    href={data.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-400 transition"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF Certificate
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer branding */}
        <div className="flex justify-center items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/60" />
          <span>Slog Solutions Automated Encryption Secured System</span>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
