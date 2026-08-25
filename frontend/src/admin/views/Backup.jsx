import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, Plus, Trash2, Download, RefreshCw, Clock, HardDrive, CheckCircle2, AlertTriangle, Loader } from 'lucide-react';

const Backup = () => {
  const { api } = useAuth();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchBackups = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/backup/list');
      setBackups(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch backup logs from disk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleTriggerBackup = async () => {
    setActionLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await api.post('/backup/trigger');
      setMessage(res.data.message);
      fetchBackups();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to trigger database dump');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBackup = async (filename) => {
    if (!window.confirm(`Are you sure you want to permanently delete backup point ${filename}?`)) {
      return;
    }
    setActionLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await api.delete(`/backup/${filename}`);
      setMessage(res.data.message);
      fetchBackups();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete backup file');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadBackup = (filename) => {
    // Standard file download trigger by injecting temporary download anchor
    const downloadUrl = `/api/backup/download/${filename}`;
    const token = localStorage.getItem('token');
    
    // We can fetch the file as blob or directly open it with token
    // Since it's protected by Admin, opening it directly requires token.
    // The easiest and cleanest way to download is by fetching via API blob and saving it:
    api.get(downloadUrl, { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => {
        setError('Download failed. Session might have expired.');
      });
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 bg-[var(--bg-cream)] transition-colors duration-300 p-8 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-dark)]">Daily Backup</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Export local MongoDB collections JSON files manually or check automated rotation retention.</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={fetchBackups}
            disabled={loading || actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] text-[var(--text-dark)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-cream)] hover:text-[var(--text-dark)] transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={handleTriggerBackup}
            disabled={loading || actionLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10 disabled:opacity-50"
          >
            {actionLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Backup Now
          </button>
        </div>
      </div>

      {/* Info Status Banners */}
      {message && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="text-xs text-[var(--text-muted)]">Reading backups folder...</span>
          </div>
        ) : backups.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-[var(--bg-cream)] flex items-center justify-center text-[var(--text-muted)]">
              <Database className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-[var(--text-dark)]">No backup records found</h4>
              <p className="text-[10px] text-[var(--text-muted)]">Click "Backup Now" to trigger a manual snapshot of current models.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] uppercase bg-[var(--bg-card)] transition-colors duration-300/40">
                  <th className="py-4 px-6">File Name</th>
                  <th className="py-4 px-6">File Size</th>
                  <th className="py-4 px-6">Created On</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60">
                {backups.map((backup) => (
                  <tr key={backup.filename} className="text-xs hover:bg-[var(--bg-cream)]/20 transition-colors duration-150">
                    <td className="py-4 px-6 font-medium text-[var(--text-dark)]">
                      <div className="flex items-center gap-2.5">
                        <HardDrive className="h-4 w-4 text-emerald-400" />
                        <span className="font-mono">{backup.filename}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[var(--text-dark)] font-medium">
                      {formatBytes(backup.sizeBytes)}
                    </td>
                    <td className="py-4 px-6 text-[var(--text-muted)] font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                        <span>{new Date(backup.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDownloadBackup(backup.filename)}
                          className="p-1.5 bg-[var(--bg-cream)] border-[var(--border-color)] hover:bg-[var(--bg-cream)] border border-[var(--border-color)]/60 rounded-md text-emerald-400 hover:text-emerald-300 transition"
                          title="Download Backup"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.filename)}
                          className="p-1.5 bg-[var(--bg-cream)] border-[var(--border-color)] hover:bg-[var(--bg-cream)] border border-[var(--border-color)]/60 rounded-md text-rose-400 hover:text-rose-300 transition"
                          title="Delete Backup"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Backup;
