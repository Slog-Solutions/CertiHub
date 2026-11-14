import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, Plus, Upload, Download, Search, AlertCircle, CheckCircle2, X, Archive, FileSpreadsheet, Loader, ShieldCheck, RefreshCw, Eye, ToggleRight, ToggleLeft, Trash2, Clock, Check, XCircle, FileCheck, PenTool } from 'lucide-react';
import StatusToggle from '../components/StatusToggle';
import ActionsDropdown from '../components/ActionsDropdown';
import ExportButtons from '../components/ExportButtons';
import { API_BASE_URL } from '../config';

const Certificates = () => {
  const { api, user } = useAuth();
  const isDirector = user?.role === 'Director';
  const isAdmin = user?.role === 'Admin';
  const directorUsername = user?.username?.toLowerCase();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Tabs: 'all', 'approvals', 'signatures'
  const [activeTab, setActiveTab] = useState(
    tabParam === 'signature' || tabParam === 'signatures'
      ? 'signatures'
      : (isDirector ? 'approvals' : 'all')
  );
  
  // Lists
  const [certs, setCerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  // Pending Approvals State
  const [pendingCerts, setPendingCerts] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [selectedPendingIds, setSelectedPendingIds] = useState([]);

  // Upload modal & results state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [forceReissue, setForceReissue] = useState(false);
  const [signatureChoice, setSignatureChoice] = useState('without'); // 'without' | 'with'
  const [signatureType, setSignatureType] = useState('both'); // 'both' | 'left' | 'right'
  const [uploadResults, setUploadResults] = useState(null); // processing summary

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Signatures Management Modal State
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [sigLoading, setSigLoading] = useState(false);
  const [sigSaving, setSigSaving] = useState(false);
  const [sigError, setSigError] = useState('');
  const [leftSignName, setLeftSignName] = useState('Suraj Prasad Singh');
  const [rightSignName, setRightSignName] = useState('Kiran Bisht');
  const [leftSigPreview, setLeftSigPreview] = useState('');
  const [rightSigPreview, setRightSigPreview] = useState('');
  const [leftSigFile, setLeftSigFile] = useState(null);
  const [rightSigFile, setRightSigFile] = useState(null);
  const [cleaningLeft, setCleaningLeft] = useState(false);
  const [cleaningRight, setCleaningRight] = useState(false);

  const getPdfUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE_URL.replace(/\/api$/, '')}${cleanPath}`;
  };

  const sanitizeImageSrc = (src) => {
    if (!src || typeof src !== 'string') return '';
    const trimmed = src.trim();
    if (
      trimmed.startsWith('data:image/') ||
      trimmed.startsWith('blob:') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('/')
    ) {
      return trimmed;
    }
    return '';
  };

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/certificates', {
        params: { page, search, limit: 10 }
      });
      setCerts(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to retrieve certificates registry');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      setPendingLoading(true);
      const res = await api.get('/certificates/pending-approvals');
      setPendingCerts(res.data || []);
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    setSelectedIds([]);
    fetchCertificates();
    fetchPendingApprovals();
  }, [page]);

  useEffect(() => {
    if (activeTab === 'approvals') {
      setSelectedPendingIds([]);
      fetchPendingApprovals();
    } else if (activeTab === 'signatures') {
      fetchSignatures();
    }
  }, [activeTab]);

  useEffect(() => {
    if (tabParam === 'signature' || tabParam === 'signatures') {
      setActiveTab('signatures');
    } else if (tabParam === 'approvals') {
      setActiveTab('approvals');
    } else if (tabParam === 'all') {
      setActiveTab('all');
    }
  }, [tabParam]);

  const handleApproveSignature = async (certId, action = 'approve', side) => {
    try {
      setError('');
      setMessage('');
      const res = await api.post(`/certificates/${certId}/approve-signature`, { action, side });
      setMessage(res.data?.message || `Signature ${action}d successfully`);
      fetchPendingApprovals();
      fetchCertificates();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} signature`);
    }
  };

  const handleBulkApprove = async (action = 'approve') => {
    if (selectedPendingIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to ${action} signatures for ${selectedPendingIds.length} selected certificate(s)?`)) return;
    try {
      setError('');
      setMessage('');
      const res = await api.post('/certificates/bulk-approve-signatures', { ids: selectedPendingIds, action });
      setMessage(res.data?.message || `Processed approvals successfully`);
      setSelectedPendingIds([]);
      fetchPendingApprovals();
      fetchCertificates();
    } catch (err) {
      setError(err.response?.data?.error || 'Bulk approval failed');
    }
  };

  const handleSelectPendingAll = (e) => {
    if (e.target.checked) {
      setSelectedPendingIds(pendingCerts.map(c => c._id));
    } else {
      setSelectedPendingIds([]);
    }
  };

  const handleSelectPendingRow = (id) => {
    setSelectedPendingIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSelectedIds([]);
    fetchCertificates();
  };

  const handleDownloadExcelTemplate = async () => {
    try {
      setError('');
      // Request file buffer and save it client side
      const response = await api.get('/certificates/template-excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Certificates_Import_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download Excel template file.');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      setError('Please choose a valid Excel spreadsheet to upload.');
      return;
    }

    setUploading(true);
    setError('');
    setUploadResults(null);
    setMessage('');

    const sigOption = signatureChoice === 'without' ? 'none' : signatureType;

    const formData = new FormData();
    formData.append('excelFile', excelFile);
    formData.append('forceReissue', forceReissue);
    formData.append('signatureOption', sigOption);

    try {
      const res = await api.post('/certificates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadResults(res.data);
      setMessage(`Excel parsed successfully: ${res.data.successCount} generated, ${res.data.failureCount} failed.`);
      fetchCertificates();
      fetchPendingApprovals();
    } catch (err) {
      setError(err.response?.data?.error || 'Import pipeline failed. Please check Excel column layout.');
    } finally {
      setUploading(false);
    }
  };

  const handleStatusToggle = async (cert) => {
    try {
      setError('');
      setMessage('');
      const targetStatus = cert.status === 'Active' ? 'Revoked' : 'Active';
      const res = await api.put(`/certificates/${cert._id}`, { status: targetStatus });
      setCerts(certs.map(c => c._id === cert._id ? { ...c, status: res.data.status } : c));
      setMessage('Certificate revocation status updated');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to toggle status');
    }
  };

  const handleRegenerateCertificate = async (cert) => {
    try {
      setError('');
      setMessage('');
      const res = await api.put(`/certificates/${cert._id}`, { regenerate: true });
      setCerts(certs.map(c => c._id === cert._id ? res.data : c));
      setMessage('Certificate PDF layout successfully regenerated');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to regenerate PDF file');
    }
  };

  const handleDeleteCertificate = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this certificate record? This will also remove the PDF file from the disk.')) return;
    try {
      setError('');
      setMessage('');
      await api.delete(`/certificates/${id}`);
      setMessage('Certificate record and PDF file deleted successfully');
      fetchCertificates();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete certificate');
    }
  };

  const fetchSignatures = async () => {
    try {
      setSigLoading(true);
      setSigError('');
      const res = await api.get('/certificates/signatures');
      if (res.data) {
        setLeftSignName(res.data.leftSignName || 'Suraj Prasad Singh');
        setRightSignName(res.data.rightSignName || 'Kiran Bisht');
        setLeftSigPreview(res.data.leftSignatureUrl || '');
        setRightSigPreview(res.data.rightSignatureUrl || '');
        setLeftSigFile(null);
        setRightSigFile(null);
      }
    } catch (err) {
      setSigError(err.response?.data?.error || 'Failed to fetch signature settings');
    } finally {
      setSigLoading(false);
    }
  };

  const handleOpenSignatureModal = () => {
    setSigError('');
    setIsSignatureModalOpen(true);
    fetchSignatures();
  };

  /**
   * Automatically removes paper background from signature image,
   * extracts crisp textual ink strokes, and returns a transparent PNG File.
   */
  const removeSignatureBackground = (file) => {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const width = img.naturalWidth || img.width;
            const height = img.naturalHeight || img.height;
            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, width, height);
            const data = imgData.data;

            // Check if the image ALREADY has transparent background
            let transparentPixels = 0;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] < 20) {
                transparentPixels++;
              }
            }
            const isAlreadyTransparent = transparentPixels > ((width * height) * 0.05);

            // 1. Find darkest ink luminance in the image (among opaque pixels)
            let minLum = 255;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] > 80) {
                const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                if (lum < minLum) minLum = lum;
              }
            }

            // 2. Ink threshold strictly capped at 80 to eliminate paper shadows (>=90)
            const inkCutoff = Math.max(35, Math.min(80, minLum + 45));
            const edgeBand = 15;

            let minX = width, maxX = 0, minY = height, maxY = 0;
            let inkCount = 0;

            for (let i = 0; i < data.length; i += 4) {
              const a = data[i + 3];

              // CRITICAL: NEVER turn a transparent pixel into opaque!
              if (a < 20) {
                data[i + 3] = 0;
                continue;
              }

              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              const pixelIdx = i / 4;
              const px = pixelIdx % width;
              const py = Math.floor(pixelIdx / width);

              // If the image is ALREADY transparent, preserve the clean transparent signature
              if (isAlreadyTransparent) {
                data[i] = Math.min(r, 40);
                data[i + 1] = Math.min(g, 40);
                data[i + 2] = Math.min(b, 55);

                if (a > 40) {
                  if (px < minX) minX = px;
                  if (px > maxX) maxX = px;
                  if (py < minY) minY = py;
                  if (py > maxY) maxY = py;
                  inkCount++;
                }
                continue;
              }

              if (lum >= inkCutoff) {
                // Completely transparent paper and shadow
                data[i + 3] = 0;
              } else {
                // Smooth anti-aliased edge
                let alpha = 255;
                if (lum > inkCutoff - edgeBand) {
                  const factor = (inkCutoff - lum) / edgeBand;
                  alpha = Math.round(255 * Math.max(0, Math.min(1, factor)));
                }
                data[i + 3] = alpha;

                // Crisp authentic pen ink color (deep blue-black)
                data[i] = Math.min(r, 40);
                data[i + 1] = Math.min(g, 40);
                data[i + 2] = Math.min(b, 55);

                if (alpha > 40) {
                  if (px < minX) minX = px;
                  if (px > maxX) maxX = px;
                  if (py < minY) minY = py;
                  if (py > maxY) maxY = py;
                  inkCount++;
                }
              }
            }

            ctx.putImageData(imgData, 0, 0);

            // Auto-crop to content bounding box with comfortable padding
            let finalCanvas = canvas;
            if (maxX > minX && maxY > minY) {
              const pad = 24;
              const cropX = Math.max(0, minX - pad);
              const cropY = Math.max(0, minY - pad);
              const cropW = Math.min(width - cropX, (maxX - minX) + (pad * 2));
              const cropH = Math.min(height - cropY, (maxY - minY) + (pad * 2));

              const cropCanvas = document.createElement('canvas');
              cropCanvas.width = cropW;
              cropCanvas.height = cropH;
              const cropCtx = cropCanvas.getContext('2d');
              cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
              finalCanvas = cropCanvas;
            }

            finalCanvas.toBlob((blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const cleanFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "_transparent.png", {
                type: 'image/png',
                lastModified: Date.now()
              });
              resolve(cleanFile);
            }, 'image/png');
          } catch (procErr) {
            console.warn('Canvas background removal fallback:', procErr);
            resolve(file);
          }
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleLeftSigChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCleaningLeft(true);
      try {
        const cleanedFile = await removeSignatureBackground(file);
        setLeftSigFile(cleanedFile);
        setLeftSigPreview(URL.createObjectURL(cleanedFile));
      } catch (_) {
        setLeftSigFile(file);
        setLeftSigPreview(URL.createObjectURL(file));
      } finally {
        setCleaningLeft(false);
      }
    }
  };

  const handleRightSigChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCleaningRight(true);
      try {
        const cleanedFile = await removeSignatureBackground(file);
        setRightSigFile(cleanedFile);
        setRightSigPreview(URL.createObjectURL(cleanedFile));
      } catch (_) {
        setRightSigFile(file);
        setRightSigPreview(URL.createObjectURL(file));
      } finally {
        setCleaningRight(false);
      }
    }
  };

  const handleSaveSignatures = async (e) => {
    if (e) e.preventDefault();
    try {
      setSigSaving(true);
      setSigError('');
      const formData = new FormData();
      if (leftSigFile) formData.append('leftSignature', leftSigFile);
      if (rightSigFile) formData.append('rightSignature', rightSigFile);
      if (leftSignName) formData.append('leftSignName', leftSignName.trim());
      if (rightSignName) formData.append('rightSignName', rightSignName.trim());

      await api.post('/certificates/signatures', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Director signatures and names updated successfully!');
      setLeftSigFile(null);
      setRightSigFile(null);
      fetchSignatures();
      setIsSignatureModalOpen(false);
    } catch (err) {
      setSigError(err.response?.data?.error || 'Failed to save signature changes');
    } finally {
      setSigSaving(false);
    }
  };

  const handleSaveLeftSignature = async (e) => {
    if (e) e.preventDefault();
    try {
      setSigSaving(true);
      setSigError('');
      const formData = new FormData();
      if (leftSigFile) formData.append('leftSignature', leftSigFile);
      if (leftSignName) formData.append('leftSignName', leftSignName.trim());

      await api.post('/certificates/signatures', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Suraj Prasad Singh (Left) signature and profile updated successfully!');
      setLeftSigFile(null);
      fetchSignatures();
      setIsSignatureModalOpen(false);
    } catch (err) {
      setSigError(err.response?.data?.error || 'Failed to save left signature');
    } finally {
      setSigSaving(false);
    }
  };

  const handleSaveRightSignature = async (e) => {
    if (e) e.preventDefault();
    try {
      setSigSaving(true);
      setSigError('');
      const formData = new FormData();
      if (rightSigFile) formData.append('rightSignature', rightSigFile);
      if (rightSignName) formData.append('rightSignName', rightSignName.trim());

      await api.post('/certificates/signatures', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Kiran Bisht (Right) signature and profile updated successfully!');
      setRightSigFile(null);
      fetchSignatures();
      setIsSignatureModalOpen(false);
    } catch (err) {
      setSigError(err.response?.data?.error || 'Failed to save right signature');
    } finally {
      setSigSaving(false);
    }
  };

  const handleDownloadZip = (batchId) => {
    if (!batchId) return;
    setError('');
    const downloadUrl = `/certificates/batch/${batchId}/download-zip`;
    
    // Download zip blob
    api.get(downloadUrl, { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Certificates_Batch_${batchId.substring(0, 8)}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        // Automatically close modal after download starts
        setIsUploadOpen(false);
        setUploadResults(null);
        setMessage('Batch certificates ZIP downloaded successfully.');
      })
      .catch((err) => {
        setError('ZIP extraction failed. Please try again.');
      });
  };

  const handleDownloadAllZip = () => {
    setError('');
    setMessage('Packaging all active certificates into ZIP, please wait...');
    api.get('/certificates/download-all-zip', { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'All_Certificates.zip');
        document.body.appendChild(link);
        link.click();
        link.remove();
        setMessage('ZIP archive of all certificates downloaded successfully.');
      })
      .catch((err) => {
        setError('Failed to package certificates. Make sure active certificates exist.');
        setMessage('');
      });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(certs.map(c => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (certId) => {
    setSelectedIds(prev =>
      prev.includes(certId)
        ? prev.filter(id => id !== certId)
        : [...prev, certId]
    );
  };

  const handleBulkToggle = async (targetActive) => {
    const statusVal = targetActive ? 'Active' : 'Revoked';
    if (selectedIds.length > 0) {
      if (!window.confirm(`Are you sure you want to toggle status to ${statusVal} for ${selectedIds.length} selected certificate(s)?`)) return;
      try {
        setLoading(true);
        setError('');
        setMessage('');
        await api.post('/certificates/bulk-toggle', {
          ids: selectedIds,
          status: statusVal
        });
        setMessage(`Successfully updated status for ${selectedIds.length} certificate(s)`);
        setSelectedIds([]);
        fetchCertificates();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to update selection');
        setLoading(false);
      }
    } else {
      const confirmMsg = search
        ? `Are you sure you want to toggle status to ${statusVal} for all certificate records matching the search filter "${search}"?`
        : `Are you sure you want to toggle status to ${statusVal} for ALL certificate records in the database?`;
        
      if (!window.confirm(confirmMsg)) return;

      try {
        setLoading(true);
        setError('');
        setMessage('');
        await api.post('/certificates/bulk-toggle', {
          search,
          status: statusVal
        });
        setMessage(`Successfully updated status for all matching certificate records.`);
        fetchCertificates();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to update matching records');
        setLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete the ${selectedIds.length} selected certificate records and their PDF files? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');
      await api.post('/certificates/bulk-delete', { ids: selectedIds });
      setMessage(`Successfully deleted ${selectedIds.length} certificate records.`);
      setSelectedIds([]);
      fetchCertificates();
    } catch (err) {
      setError(err.response?.data?.error || 'Bulk delete operation failed.');
      setLoading(false);
    }
  };

  const exportColumns = [
    { header: 'Cert ID', accessor: c => c.certificateId },
    { header: 'Reg No', accessor: c => c.studentId?.registrationNo },
    { header: 'Candidate Name', accessor: c => c.studentId?.name },
    { header: 'Course Stream', accessor: c => c.courseDetailId?.technologyId?.name },
    { header: 'Issue Date', accessor: c => c.issueDate ? new Date(c.issueDate).toLocaleDateString() : '' },
    { header: 'Signature Status', accessor: c => c.signatureApprovalStatus || 'NotRequired' },
    { header: 'Status', accessor: c => c.status }
  ];

  return (
    <div className="flex-1 bg-[var(--bg-cream)] transition-colors duration-300 p-8 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-color)] pb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-dark)]">Certificates</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Audit issued credentials, view verifications, or upload bulk Excel cert sheets.</p>
        </div>
        
        <div className="flex gap-3">
          {isAdmin && (
            <button
              onClick={handleDownloadExcelTemplate}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] text-[var(--text-dark)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-cream)] hover:text-[var(--text-dark)] transition"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              Download Excel Template
            </button>
          )}
          
          <button
            onClick={handleDownloadAllZip}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] text-[var(--text-dark)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-cream)] hover:text-[var(--text-dark)] transition"
          >
            <Archive className="h-4 w-4 text-emerald-400" />
            Download ZIP
          </button>
          
          {(isAdmin || isDirector) && (
            <button
              onClick={() => {
                setActiveTab('signatures');
                setSearchParams({ tab: 'signature' });
                fetchSignatures();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-sm ${
                activeTab === 'signatures'
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-dark)] hover:bg-[var(--bg-cream)]'
              }`}
              title="Upload new signature images and update director names"
            >
              <PenTool className="h-4 w-4 text-emerald-400" />
              {isDirector ? 'My Digital Signature' : 'Digital Signatures'}
            </button>
          )}
          
          {isAdmin && (
            <button
              onClick={() => {
                setUploadResults(null);
                setExcelFile(null);
                setIsUploadOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10"
            >
              <Upload className="h-4 w-4" />
              Upload Excel & Issue
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition shadow-md shadow-rose-600/10"
              title="Select checkboxes in the table below to delete certificate records"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* View Mode Navigation Tabs */}
      <div className="flex border-b border-[var(--border-color)] gap-6">
        <button
          type="button"
          onClick={() => { setActiveTab('all'); setSearchParams({}); }}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'all'
              ? 'border-emerald-500 text-emerald-500'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-dark)]'
          }`}
        >
          <Award className="h-4 w-4" />
          All Certificates ({total})
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('approvals'); setSearchParams({ tab: 'approvals' }); }}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'approvals'
              ? 'border-emerald-500 text-emerald-500'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-dark)]'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Director Signature Approvals
          {pendingCerts.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
              {pendingCerts.length}
            </span>
          )}
        </button>

        {(isAdmin || isDirector) && (
          <button
            type="button"
            onClick={() => { setActiveTab('signatures'); setSearchParams({ tab: 'signature' }); }}
            className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'signatures'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-dark)]'
            }`}
          >
            <PenTool className="h-4 w-4" />
            {isDirector ? 'My Digital Signature' : 'Digital Signatures'}
          </button>
        )}
      </div>

      {activeTab === 'approvals' ? (
        /* ================= PENDING APPROVALS TAB ================= */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-dark)] flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Pending Director Signature Approvals ({pendingCerts.length})
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {isDirector
                  ? `Logged in as Director (${user?.name || user?.username}). Review and approve/reject your signature below.`
                  : 'Certificates awaiting signature approval from Directors (Suraj Prasad Singh / Kiran Bisht).'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleBulkApprove('approve')}
                disabled={selectedPendingIds.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                <Check className="h-3.5 w-3.5" />
                Approve Selected {selectedPendingIds.length > 0 ? `(${selectedPendingIds.length})` : ''}
              </button>

              <button
                onClick={() => handleBulkApprove('reject')}
                disabled={selectedPendingIds.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                <X className="h-3.5 w-3.5" />
                Reject Selected {selectedPendingIds.length > 0 ? `(${selectedPendingIds.length})` : ''}
              </button>

              <button
                onClick={fetchPendingApprovals}
                className="p-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-dark)] rounded-lg transition"
                title="Refresh Approvals"
              >
                <RefreshCw className={`h-4 w-4 ${pendingLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden">
            {pendingLoading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                <Loader className="h-8 w-8 animate-spin text-emerald-500" />
                <span className="text-xs text-[var(--text-muted)]">Loading pending signature requests...</span>
              </div>
            ) : pendingCerts.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[var(--text-dark)]">No pending signature approvals</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">All certificates with requested signatures have been approved or none are pending.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] uppercase bg-[var(--bg-card)]/40">
                      <th className="py-4 px-6 w-12">
                        <input
                          type="checkbox"
                          checked={pendingCerts.length > 0 && selectedPendingIds.length === pendingCerts.length}
                          onChange={handleSelectPendingAll}
                          className="rounded border-[var(--border-color)] text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-4 px-6">Certificate ID</th>
                      <th className="py-4 px-6">Candidate</th>
                      <th className="py-4 px-6">Reg No</th>
                      <th className="py-4 px-6">Course Stream</th>
                      <th className="py-4 px-6">Signatures</th>
                      <th className="py-4 px-6">Left Signature (Suraj)</th>
                      <th className="py-4 px-6">Right Signature (Kiran)</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/60">
                    {pendingCerts.map((cert) => {
                      const canApproveLeft = isAdmin || (isDirector && directorUsername === 'suraj');
                      const canApproveRight = isAdmin || (isDirector && directorUsername === 'kiran');

                      return (
                        <tr key={cert._id} className="hover:bg-[var(--bg-cream)]/20 transition-colors">
                          <td className="py-4 px-6 w-12">
                            <input
                              type="checkbox"
                              checked={selectedPendingIds.includes(cert._id)}
                              onChange={() => handleSelectPendingRow(cert._id)}
                              className="rounded border-[var(--border-color)] text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-4 px-6 font-mono text-emerald-400 font-bold whitespace-nowrap">{cert.certificateId}</td>
                          <td className="py-4 px-6 font-semibold text-[var(--text-dark)]">{cert.studentId?.name || cert.userId?.name || 'Candidate'}</td>
                          <td className="py-4 px-6 font-mono text-[var(--text-dark)]">{cert.studentId?.registrationNo || cert.userId?.username || '—'}</td>
                          <td className="py-4 px-6 text-[var(--text-dark)]">
                            <h4>{cert.courseDetailId?.technologyId?.name || cert.batchId?.name || 'Course'}</h4>
                          </td>
                          <td className="py-4 px-6 font-medium capitalize text-[var(--text-muted)]">
                            {cert.signatureOption === 'both' ? 'Both' : `${cert.signatureOption} only`}
                          </td>
                          <td className="py-4 px-6">
                            {cert.leftApproval?.status === 'Approved' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                                <Check className="h-3 w-3" /> Approved
                              </span>
                            ) : cert.leftApproval?.status === 'Pending' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                <Clock className="h-3 w-3" /> Pending (Suraj)
                              </span>
                            ) : (
                              <span className="text-[10px] text-[var(--text-muted)]">Not Required</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {cert.rightApproval?.status === 'Approved' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                                <Check className="h-3 w-3" /> Approved
                              </span>
                            ) : cert.rightApproval?.status === 'Pending' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                <Clock className="h-3 w-3" /> Pending (Kiran)
                              </span>
                            ) : (
                              <span className="text-[10px] text-[var(--text-muted)]">Not Required</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end gap-1.5 items-center">
                              {/* Download Unsigned Preview */}
                              <a
                                href={getPdfUrl(cert.pdfUrlUnsigned || cert.pdfUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1 bg-[var(--bg-cream)] hover:bg-[var(--bg-cream)] text-[var(--text-dark)] rounded border border-[var(--border-color)] text-[10px] font-semibold transition"
                                title="Download / Preview without Signature"
                              >
                                <Download className="h-3 w-3" />
                                Without Sign
                              </a>

                              {/* Approve Button */}
                              {canApproveLeft && cert.leftApproval?.status === 'Pending' && (
                                <button
                                  onClick={() => handleApproveSignature(cert._id, 'approve', 'left')}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded text-[10px] font-bold shadow-sm"
                                  title="Approve Suraj's Left Signature"
                                >
                                  <Check className="h-3 w-3" />
                                  Approve (Suraj)
                                </button>
                              )}

                              {canApproveRight && cert.rightApproval?.status === 'Pending' && (
                                <button
                                  onClick={() => handleApproveSignature(cert._id, 'approve', 'right')}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded text-[10px] font-bold shadow-sm"
                                  title="Approve Kiran's Right Signature"
                                >
                                  <Check className="h-3 w-3" />
                                  Approve (Kiran)
                                </button>
                              )}

                              {/* Reject Button */}
                              <button
                                onClick={() => handleApproveSignature(cert._id, 'reject')}
                                className="p-1 hover:bg-rose-500/10 text-rose-500 rounded border border-rose-500/20 transition"
                                title="Reject Signature"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'signatures' ? (
        /* ================= DIGITAL SIGNATURES MANAGEMENT TAB ================= */
        <div className="space-y-6 animate-in">
          {/* Header banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <PenTool className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-dark)]">
                    {isDirector ? 'My Digital Signature & Signatory Profile' : 'Director Digital Signatures & Signatory Profiles'}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-2xl">
                    {isDirector
                      ? `Logged in as Director (${user?.name || user?.username}). Upload your signature file below so it is officially embedded on student certificates upon approval.`
                      : 'Manage digital signature assets and titles for Directors Suraj Prasad Singh (Left) and Kiran Bisht (Right).'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchSignatures}
                disabled={sigLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-cream)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-dark)] rounded-xl text-xs font-semibold transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${sigLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {sigLoading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl">
              <Loader className="h-8 w-8 text-emerald-500 animate-spin" />
              <p className="text-xs text-[var(--text-muted)] font-semibold">Loading signature profiles...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SURAJ PRASAD SINGH (LEFT SIGNATORY) */}
              <div className={`p-6 rounded-2xl bg-[var(--bg-card)] border transition shadow-sm space-y-5 ${
                directorUsername === 'suraj'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-[var(--border-color)]'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <h4 className="text-sm font-bold text-[var(--text-dark)]">Suraj Prasad Singh</h4>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Left Signatory on Certificates</span>
                  </div>
                  {directorUsername === 'suraj' ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Your Profile (Logged in)
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-cream)] px-2.5 py-1 rounded-full border border-[var(--border-color)]">
                      Director
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                    Signatory Name (Printed on Certificate)
                  </label>
                  <input
                    type="text"
                    value={leftSignName}
                    onChange={(e) => setLeftSignName(e.target.value)}
                    disabled={directorUsername === 'kiran'}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--bg-cream)] border border-[var(--border-color)] text-[var(--text-dark)] focus:outline-none focus:border-emerald-500 disabled:opacity-60 transition font-medium"
                    placeholder="Suraj Prasad Singh"
                  />
                  <span className="text-[10px] text-[var(--text-muted)] block mt-1">Title: <strong>Director, SLOG Solutions Private Limited</strong></span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                      Active Signature Preview
                    </label>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {leftSigFile ? '● New file selected' : (leftSigPreview ? '● Currently deployed' : '○ Not configured')}
                    </span>
                  </div>
                  <div className="h-36 rounded-xl border border-[var(--border-color)] bg-white/95 flex flex-col items-center justify-center p-3 relative overflow-hidden shadow-inner group">
                    {cleaningLeft ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-center p-4">
                        <Loader className="h-6 w-6 text-emerald-500 animate-spin" />
                        <span className="text-xs font-semibold text-emerald-600">Extracting signature strokes & removing background...</span>
                        <span className="text-[10px] text-zinc-500">Creating transparent digital signature</span>
                      </div>
                    ) : sanitizeImageSrc(leftSigPreview) ? (
                      <>
                        <img
                          src={sanitizeImageSrc(leftSigPreview)}
                          alt="Suraj Prasad Singh Signature"
                          className="max-h-full max-w-full object-contain filter drop-shadow"
                        />
                        <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                          {leftSigFile ? '✨ Clean Transparent Preview' : 'Saved Signature'}
                        </span>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <PenTool className="h-6 w-6 text-zinc-300 mx-auto mb-1" />
                        <span className="text-xs text-zinc-400 font-semibold block">No signature file uploaded yet</span>
                        <span className="text-[10px] text-zinc-400">Upload a PNG or JPG file below</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload & Save Section */}
                {(isAdmin || directorUsername === 'suraj') ? (
                  <div className="space-y-3 pt-3 border-t border-[var(--border-color)]">
                    <div>
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                        Upload New Signature File
                      </span>
                      <label className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-cream)] border border-dashed border-[var(--border-color)] rounded-xl cursor-pointer hover:border-emerald-500 hover:text-emerald-400 text-xs text-[var(--text-muted)] transition">
                        <Upload className="h-4 w-4 text-emerald-500" />
                        <span className="truncate font-semibold">
                          {leftSigFile ? `Selected: ${leftSigFile.name}` : 'Click to choose signature image (PNG, JPG)'}
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleLeftSigChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1.5">
                        ✨ <strong>Auto-Ink Extraction:</strong> Paper background is automatically removed to produce a clean, transparent digital signature.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveLeftSignature}
                      disabled={sigSaving}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/10 cursor-pointer"
                    >
                      {sigSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      {directorUsername === 'suraj' ? 'Save My Signature' : "Save Suraj's Signature"}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[var(--bg-cream)] border border-[var(--border-color)] text-[11px] text-[var(--text-muted)] text-center">
                    🔒 Managed by Director Suraj Prasad Singh or Super Admin.
                  </div>
                )}
              </div>

              {/* KIRAN BISHT (RIGHT SIGNATORY) */}
              <div className={`p-6 rounded-2xl bg-[var(--bg-card)] border transition shadow-sm space-y-5 ${
                directorUsername === 'kiran'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-[var(--border-color)]'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <h4 className="text-sm font-bold text-[var(--text-dark)]">Kiran Bisht</h4>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Right Signatory on Certificates</span>
                  </div>
                  {directorUsername === 'kiran' ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Your Profile (Logged in)
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-cream)] px-2.5 py-1 rounded-full border border-[var(--border-color)]">
                      Director
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                    Signatory Name (Printed on Certificate)
                  </label>
                  <input
                    type="text"
                    value={rightSignName}
                    onChange={(e) => setRightSignName(e.target.value)}
                    disabled={directorUsername === 'suraj'}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--bg-cream)] border border-[var(--border-color)] text-[var(--text-dark)] focus:outline-none focus:border-emerald-500 disabled:opacity-60 transition font-medium"
                    placeholder="Kiran Bisht"
                  />
                  <span className="text-[10px] text-[var(--text-muted)] block mt-1">Title: <strong>Director, SLOG Solutions Private Limited</strong></span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                      Active Signature Preview
                    </label>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {rightSigFile ? '● New file selected' : (rightSigPreview ? '● Currently deployed' : '○ Not configured')}
                    </span>
                  </div>
                  <div className="h-36 rounded-xl border border-[var(--border-color)] bg-white/95 flex flex-col items-center justify-center p-3 relative overflow-hidden shadow-inner group">
                    {cleaningRight ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-center p-4">
                        <Loader className="h-6 w-6 text-emerald-500 animate-spin" />
                        <span className="text-xs font-semibold text-emerald-600">Extracting signature strokes & removing background...</span>
                        <span className="text-[10px] text-zinc-500">Creating transparent digital signature</span>
                      </div>
                    ) : sanitizeImageSrc(rightSigPreview) ? (
                      <>
                        <img
                          src={sanitizeImageSrc(rightSigPreview)}
                          alt="Kiran Bisht Signature"
                          className="max-h-full max-w-full object-contain filter drop-shadow"
                        />
                        <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                          {rightSigFile ? '✨ Clean Transparent Preview' : 'Saved Signature'}
                        </span>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <PenTool className="h-6 w-6 text-zinc-300 mx-auto mb-1" />
                        <span className="text-xs text-zinc-400 font-semibold block">No signature file uploaded yet</span>
                        <span className="text-[10px] text-zinc-400">Upload a PNG or JPG file below</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload & Save Section */}
                {(isAdmin || directorUsername === 'kiran') ? (
                  <div className="space-y-3 pt-3 border-t border-[var(--border-color)]">
                    <div>
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                        Upload New Signature File
                      </span>
                      <label className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-cream)] border border-dashed border-[var(--border-color)] rounded-xl cursor-pointer hover:border-emerald-500 hover:text-emerald-400 text-xs text-[var(--text-muted)] transition">
                        <Upload className="h-4 w-4 text-emerald-500" />
                        <span className="truncate font-semibold">
                          {rightSigFile ? `Selected: ${rightSigFile.name}` : 'Click to choose signature image (PNG, JPG)'}
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleRightSigChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1.5">
                        ✨ <strong>Auto-Ink Extraction:</strong> Paper background is automatically removed to produce a clean, transparent digital signature.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveRightSignature}
                      disabled={sigSaving}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/10 cursor-pointer"
                    >
                      {sigSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      {directorUsername === 'kiran' ? 'Save My Signature' : "Save Kiran's Signature"}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[var(--bg-cream)] border border-[var(--border-color)] text-[11px] text-[var(--text-muted)] text-center">
                    🔒 Managed by Director Kiran Bisht or Super Admin.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= ALL CERTIFICATES TAB ================= */
        <div className="space-y-6">
          {/* Toolbar actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search by student name, cert id..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] transition-colors duration-300 py-1.5 pl-9 pr-3 text-xs text-[var(--text-dark)] placeholder-[var(--text-muted)] opacity-60 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
              <button type="submit" className="absolute left-3 top-2 text-[var(--text-muted)] hover:text-[var(--text-dark)]">
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkToggle(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition duration-150 border bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-500/10 cursor-pointer"
                title="Bulk toggle status on for selected certificates or all matching records"
              >
                <ToggleRight className="h-3.5 w-3.5 text-white" />
                {selectedIds.length > 0
                  ? `Bulk Toggle On (${selectedIds.length})`
                  : `Bulk Toggle On (All ${total})`}
              </button>
              <button
                onClick={() => handleBulkToggle(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition duration-150 border bg-rose-500 hover:bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/10 cursor-pointer"
                title="Bulk toggle status off for selected certificates or all matching records"
              >
                <ToggleLeft className="h-3.5 w-3.5 text-white" />
                {selectedIds.length > 0
                  ? `Bulk Toggle Off (${selectedIds.length})`
                  : `Bulk Toggle Off (All ${total})`}
              </button>
              <ExportButtons data={certs.filter(c => c.status === 'Active')} columns={exportColumns} filename="issued_certificates_list" />
            </div>
          </div>

          {/* Table view */}
          <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden animate-fade-in">
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                <Loader className="h-8 w-8 animate-spin text-emerald-500" />
                <span className="text-xs text-[var(--text-muted)]">Querying credentials list...</span>
              </div>
            ) : certs.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-[var(--bg-cream)] flex items-center justify-center text-[var(--text-muted)]">
                  <Award className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[var(--text-dark)]">No certificates generated</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">Import student sheets to generate verified PDF credentials.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-[10px] font-bold text-[var(--text-muted)] uppercase bg-[var(--bg-card)] transition-colors duration-300/40">
                      <th className="py-4 px-6 w-12">
                        <input
                          type="checkbox"
                          checked={certs.length > 0 && selectedIds.length === certs.length}
                          onChange={handleSelectAll}
                          className="rounded border-[var(--border-color)] text-emerald-500 focus:ring-emerald-500 bg-[var(--bg-card)] cursor-pointer"
                        />
                      </th>
                      <th className="py-4 px-6">Certificate ID</th>
                      <th className="py-4 px-6">Candidate Name</th>
                      <th className="py-4 px-6">Reg No</th>
                      <th className="py-4 px-6">Course stream</th>
                      <th className="py-4 px-6">Issue Date</th>
                      <th className="py-4 px-6">Signature Status</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/60">
                    {certs.map((item) => (
                      <tr key={item._id} className="hover:bg-[var(--bg-cream)]/20 transition-colors duration-150">
                        <td className="py-4 px-6 w-12">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item._id)}
                            onChange={() => handleSelectRow(item._id)}
                            className="rounded border-[var(--border-color)] text-emerald-500 focus:ring-emerald-500 bg-[var(--bg-card)] cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-6 font-mono text-emerald-400 font-bold whitespace-nowrap">{item.certificateId}</td>
                        <td className="py-4 px-6 font-semibold text-[var(--text-dark)]">{item.studentId?.name}</td>
                        <td className="py-4 px-6 font-mono text-[var(--text-dark)]">{item.studentId?.registrationNo}</td>
                        <td className="py-4 px-6 text-[var(--text-dark)]">
                          <h4>{item.courseDetailId?.technologyId?.name}</h4>
                          <span className="text-[10px] text-[var(--text-muted)] font-medium">
                            {item.courseDetailId?.durationId?.value} {item.courseDetailId?.durationId?.unit}(s)
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[var(--text-muted)] font-mono">
                          {item.issueDate ? new Date(item.issueDate).toLocaleDateString() : '—'}
                        </td>

                        {/* Signature Status Column */}
                        <td className="py-4 px-6">
                          {item.signatureOption === 'none' || item.signatureApprovalStatus === 'NotRequired' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                              Without Signature
                            </span>
                          ) : item.signatureApprovalStatus === 'Pending' ? (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/25">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Pending Approval
                              </span>
                              <span className="text-[9px] text-[var(--text-muted)]">
                                {item.signatureOption === 'both'
                                  ? (item.leftApproval?.status === 'Approved' ? 'Needs Kiran (Right)' : item.rightApproval?.status === 'Approved' ? 'Needs Suraj (Left)' : 'Needs Suraj & Kiran')
                                  : item.signatureOption === 'left' ? 'Needs Suraj (Left)' : 'Needs Kiran (Right)'}
                              </span>
                            </div>
                          ) : item.signatureApprovalStatus === 'Approved' ? (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="h-3 w-3" />
                                Signed & Approved
                              </span>
                              <span className="text-[9px] text-[var(--text-muted)]">
                                {item.signatureOption === 'both' ? 'Suraj & Kiran' : item.signatureOption === 'left' ? 'Suraj (Left)' : 'Kiran (Right)'}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              Signature Rejected
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <StatusToggle isActive={item.status === 'Active'} onToggle={() => handleStatusToggle(item)} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            {/* Option to download without signature */}
                            {(item.pdfUrlUnsigned || (item.signatureApprovalStatus === 'Pending' && item.pdfUrl)) && (
                              <a
                                href={getPdfUrl(item.pdfUrlUnsigned || item.pdfUrl)}
                                target="_blank"
                                rel="noreferrer"
                                download={`Certificate_Unsigned_${item.certificateId}.pdf`}
                                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded border border-amber-500/30 text-[10px] font-semibold transition"
                                title="Download certificate without signature"
                              >
                                <Download className="h-3 w-3" />
                                Without Sign
                              </a>
                            )}

                            {/* Download signed / official certificate */}
                            {item.status === 'Active' && item.pdfUrl && item.signatureApprovalStatus !== 'Pending' && (
                              <a
                                href={getPdfUrl(item.pdfUrl)}
                                target="_blank"
                                rel="noreferrer"
                                download={`Certificate_${item.certificateId}.pdf`}
                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-500/30 text-[10px] font-semibold transition"
                                title="Download certificate"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </a>
                            )}

                            {item.status === 'Active' && item.pdfUrl && (
                              <a
                                href={getPdfUrl(item.pdfUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-[var(--bg-cream)] hover:bg-[var(--bg-cream)] text-[var(--text-dark)] rounded border border-[var(--border-color)] transition"
                                title="Preview PDF"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <ActionsDropdown
                              onEdit={() => handleRegenerateCertificate(item)}
                              onDelete={() => handleDeleteCertificate(item._id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {total > 10 && (
            <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-4">
              <span className="text-[10px] text-[var(--text-muted)] font-semibold">Showing 10 records per page</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-lg text-[10px] text-[var(--text-muted)] font-bold hover:text-[var(--text-dark)] transition disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={certs.length < 10}
                  className="px-3 py-1.5 bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-lg text-[10px] text-[var(--text-muted)] font-bold hover:text-[var(--text-dark)] transition disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Excel Upload & bulk issuance modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-cream)] transition-colors duration-300/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] transition-colors duration-300 border border-[var(--border-color)] rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-scale-up">
            <button
              onClick={() => {
                setIsUploadOpen(false);
                setUploadResults(null);
              }}
              className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-dark)] z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 border-b border-[var(--border-color)]">
              <h3 className="text-sm font-bold text-[var(--text-dark)] flex items-center gap-2">
                <Upload className="h-4.5 w-4.5 text-emerald-500" />
                Upload Excel spreadsheet & Generate bulk Certificates
              </h3>
            </div>

            {!uploadResults ? (
              <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
                {/* Spreadsheet Guidelines */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-[var(--text-muted)] space-y-2">
                  <span className="font-bold text-emerald-400 block text-[10px] uppercase tracking-wider">Spreadsheet Layout Guidelines</span>
                  <p className="text-[11px] leading-relaxed">
                    You can directly upload the exported registered student list. Only the following headers are parsed:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                    <li>
                      <strong className="text-[var(--text-dark)]">Reg No</strong> (or <code className="bg-[var(--bg-cream)] px-1 py-0.5 rounded text-[10px]">RegistrationNo</code> / <code className="bg-[var(--bg-cream)] px-1 py-0.5 rounded text-[10px]">Registration No</code>) — <span className="text-emerald-400 font-bold">Required</span> to match database records.
                    </li>
                    <li>
                      <strong className="text-[var(--text-dark)]">CourseCompletionDate</strong> (or <code className="bg-[var(--bg-cream)] px-1 py-0.5 rounded text-[10px]">Completion Date</code>) — <span className="text-[var(--text-muted)] font-medium">Optional</span> (defaults to today if not provided).
                    </li>
                  </ul>
                  <p className="text-[10px] italic leading-relaxed pt-1 border-t border-[var(--border-color)]/30">
                    Note: Other columns like Candidate Name, Phone, Email, College, and Course will be ignored, as candidate information is fetched automatically from the database.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Select Excel SpreadSheet (.xlsx, .xls, .csv)</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border border-[var(--border-color)] border-dashed rounded-lg bg-[var(--bg-cream)] border-[var(--border-color)] hover:bg-[var(--bg-cream)] cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-dark)] transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        <FileSpreadsheet className="w-8 h-8 text-emerald-500/80 mb-2" />
                        <p className="text-xs font-semibold">
                          {excelFile ? `Selected: ${excelFile.name}` : 'Click to select spreadsheet'}
                        </p>
                        <p className="text-[9px] text-[var(--text-muted)] mt-1">Columns parsed: Reg No (Required), CourseCompletionDate (Optional)</p>
                      </div>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => setExcelFile(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Signature Selection Options */}
                <div className="space-y-3 p-4 rounded-xl bg-[var(--bg-cream)]/70 border border-[var(--border-color)]">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                    Signature Option
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                      signatureChoice === 'without'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                        : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-dark)]'
                    }`}>
                      <input
                        type="radio"
                        name="signatureChoice"
                        value="without"
                        checked={signatureChoice === 'without'}
                        onChange={() => setSignatureChoice('without')}
                        className="text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                      />
                      <span className="text-xs">Without Signature</span>
                    </label>

                    <label className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                      signatureChoice === 'with'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                        : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-dark)]'
                    }`}>
                      <input
                        type="radio"
                        name="signatureChoice"
                        value="with"
                        checked={signatureChoice === 'with'}
                        onChange={() => setSignatureChoice('with')}
                        className="text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                      />
                      <span className="text-xs">With Signature</span>
                    </label>
                  </div>

                  {signatureChoice === 'with' && (
                    <div className="pt-2 pl-3 border-l-2 border-emerald-500 space-y-2.5 animate-in">
                      <span className="text-[10px] font-semibold text-[var(--text-muted)] block uppercase tracking-wider">
                        Select Signatories Required:
                      </span>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-dark)]">
                          <input
                            type="radio"
                            name="signatureType"
                            value="both"
                            checked={signatureType === 'both'}
                            onChange={() => setSignatureType('both')}
                            className="text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5"
                          />
                          <span>Both Signatures (Suraj Prasad Singh & Kiran Bisht)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-dark)]">
                          <input
                            type="radio"
                            name="signatureType"
                            value="left"
                            checked={signatureType === 'left'}
                            onChange={() => setSignatureType('left')}
                            className="text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5"
                          />
                          <span>Left Signature Only (Suraj Prasad Singh)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-dark)]">
                          <input
                            type="radio"
                            name="signatureType"
                            value="right"
                            checked={signatureType === 'right'}
                            onChange={() => setSignatureType('right')}
                            className="text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5"
                          />
                          <span>Right Signature Only (Kiran Bisht)</span>
                        </label>
                      </div>

                      <div className="text-[10px] text-amber-500 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 leading-relaxed">
                        ⚠️ <strong>Approval Workflow:</strong> Certificates will remain in <strong>Pending</strong> status until approved by the respective Director(s). Candidates and Staff can download the <em>Without Signature</em> version in the meantime.
                      </div>
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[var(--text-muted)] select-none">
                  <input
                    type="checkbox"
                    checked={forceReissue}
                    onChange={(e) => setForceReissue(e.target.checked)}
                    className="rounded border-[var(--border-color)] bg-[var(--bg-cream)] transition-colors duration-300 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Force Reissue (regenerate and overwrite existing certificates for selected registrations)</span>
                </label>

                <div className="pt-4 border-t border-[var(--border-color)] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-dark)] rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold"
                  >
                    {uploading ? <Loader className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Confirm Upload
                  </button>
                </div>
              </form>
            ) : (
              /* RESULTS DISPLAY SECTION */
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-[var(--bg-cream)] border-[var(--border-color)] p-3.5 border border-[var(--border-color)] rounded-xl">
                    <span className="text-[9px] font-bold text-[var(--text-muted)] block uppercase">Total Rows</span>
                    <strong className="text-lg font-bold text-[var(--text-dark)] block mt-1">{uploadResults.totalRows}</strong>
                  </div>
                  <div className="bg-emerald-500/5 p-3.5 border border-emerald-500/10 rounded-xl">
                    <span className="text-[9px] font-bold text-emerald-400 block uppercase">Succeeded</span>
                    <strong className="text-lg font-bold text-emerald-400 block mt-1">{uploadResults.successCount}</strong>
                  </div>
                  <div className="bg-rose-500/5 p-3.5 border border-rose-500/10 rounded-xl">
                    <span className="text-[9px] font-bold text-rose-450 block uppercase">Failed</span>
                    <strong className="text-lg font-bold text-rose-400 block mt-1">{uploadResults.failureCount}</strong>
                  </div>
                </div>

                {/* Batch ZIP Downloader */}
                {uploadResults.successCount > 0 && (
                  <div className="p-4 bg-[var(--bg-cream)] border-[var(--border-color)] border border-[var(--border-color)] rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-[var(--text-dark)] flex items-center gap-1.5">
                        <Archive className="h-4 w-4 text-emerald-400" /> Batch PDF Pack
                      </h4>
                      <p className="text-[9px] text-[var(--text-muted)]">Download all generated PDF credentials as one compressed ZIP archive.</p>
                    </div>
                    <button
                      onClick={() => handleDownloadZip(uploadResults.batchId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-lg transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download ZIP
                    </button>
                  </div>
                )}

                {/* Failures list panel */}
                {uploadResults.failureCount > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Failed rows details</h4>
                    <div className="border border-[var(--border-color)] rounded-xl overflow-hidden max-h-[30vh] overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="bg-[var(--bg-cream)] border-[var(--border-color)] border-b border-[var(--border-color)] font-bold text-[var(--text-muted)]">
                            <th className="py-2.5 px-4 w-12">Row</th>
                            <th className="py-2.5 px-4">Reg No</th>
                            <th className="py-2.5 px-4">Reason / Warning</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]/40">
                          {uploadResults.failures.map((fail, index) => (
                            <tr key={index} className="text-[var(--text-dark)] hover:bg-[var(--bg-cream)] border-[var(--border-color)]/40">
                              <td className="py-2.5 px-4 font-mono">{fail.row}</td>
                              <td className="py-2.5 px-4 font-mono font-semibold text-rose-400">{fail.registrationNo}</td>
                              <td className="py-2.5 px-4 text-[var(--text-muted)]">{fail.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-[var(--border-color)] flex justify-end">
                  <button
                    onClick={() => {
                      setIsUploadOpen(false);
                      setUploadResults(null);
                    }}
                    className="px-4 py-2 bg-[var(--bg-cream)] hover:bg-[var(--bg-cream)] text-[var(--text-dark)] rounded-lg text-xs font-semibold"
                  >
                    Close Results
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Signature Management Modal */}
      {isSignatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden animate-scale-up">
            <button
              onClick={() => setIsSignatureModalOpen(false)}
              className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-dark)] z-10 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 border-b border-[var(--border-color)]">
              <h3 className="text-base font-bold text-[var(--text-dark)] flex items-center gap-2">
                <PenTool className="h-5 w-5 text-emerald-500" />
                Manage Director Signatures & Names
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Upload new digital signature image files and update signatory names for Suraj Prasad Singh (Left) and Kiran Bisht (Right).
              </p>
            </div>

            {sigLoading ? (
              <div className="p-12 flex flex-col items-center justify-center space-y-3">
                <Loader className="h-7 w-7 text-emerald-500 animate-spin" />
                <p className="text-xs text-[var(--text-muted)]">Loading signatures...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveSignatures} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {sigError && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{sigError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Signatory Card */}
                  <div className="p-4 rounded-xl bg-[var(--bg-cream)]/70 border border-[var(--border-color)] space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                      <span className="text-xs font-bold text-[var(--text-dark)] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Left Signatory (Suraj)
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Director</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                        Signatory Name
                      </label>
                      <input
                        type="text"
                        value={leftSignName}
                        onChange={(e) => setLeftSignName(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-dark)] focus:outline-none focus:border-emerald-500 transition"
                        placeholder="e.g. Suraj Prasad Singh"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                        Signature Image Preview
                      </label>
                      <div className="h-28 rounded-lg border border-[var(--border-color)] bg-white/90 flex items-center justify-center p-2 overflow-hidden shadow-inner">
                        {cleaningLeft ? (
                          <div className="flex flex-col items-center justify-center gap-1 text-center">
                            <Loader className="h-4 w-4 text-emerald-500 animate-spin" />
                            <span className="text-[10px] font-semibold text-emerald-600">Removing background...</span>
                          </div>
                        ) : sanitizeImageSrc(leftSigPreview) ? (
                          <img src={sanitizeImageSrc(leftSigPreview)} alt="Left Signature Preview" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <div className="text-center text-[10px] text-zinc-400">
                            No signature image found
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                          Upload New Signature Image
                        </span>
                        <label className="flex items-center justify-center gap-2 px-3 py-2 bg-[var(--bg-card)] border border-dashed border-[var(--border-color)] rounded-lg cursor-pointer hover:border-emerald-500 hover:text-emerald-400 text-xs text-[var(--text-muted)] transition">
                          <Upload className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="truncate">{leftSigFile ? leftSigFile.name : 'Choose PNG/JPG file'}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleLeftSigChange}
                            className="hidden"
                          />
                        </label>
                      </label>
                      <p className="text-[9px] text-[var(--text-muted)] mt-1">✨ Auto-clean: Paper background is automatically made transparent</p>
                    </div>
                  </div>

                  {/* Right Signatory Card */}
                  <div className="p-4 rounded-xl bg-[var(--bg-cream)]/70 border border-[var(--border-color)] space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                      <span className="text-xs font-bold text-[var(--text-dark)] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Right Signatory (Kiran)
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Director</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                        Signatory Name
                      </label>
                      <input
                        type="text"
                        value={rightSignName}
                        onChange={(e) => setRightSignName(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-dark)] focus:outline-none focus:border-emerald-500 transition"
                        placeholder="e.g. Kiran Bisht"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                        Signature Image Preview
                      </label>
                      <div className="h-28 rounded-lg border border-[var(--border-color)] bg-white/90 flex items-center justify-center p-2 overflow-hidden shadow-inner">
                        {cleaningRight ? (
                          <div className="flex flex-col items-center justify-center gap-1 text-center">
                            <Loader className="h-4 w-4 text-emerald-500 animate-spin" />
                            <span className="text-[10px] font-semibold text-emerald-600">Removing background...</span>
                          </div>
                        ) : sanitizeImageSrc(rightSigPreview) ? (
                          <img src={sanitizeImageSrc(rightSigPreview)} alt="Right Signature Preview" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <div className="text-center text-[10px] text-zinc-400">
                            No signature image found
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                          Upload New Signature Image
                        </span>
                        <label className="flex items-center justify-center gap-2 px-3 py-2 bg-[var(--bg-card)] border border-dashed border-[var(--border-color)] rounded-lg cursor-pointer hover:border-emerald-500 hover:text-emerald-400 text-xs text-[var(--text-muted)] transition">
                          <Upload className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="truncate">{rightSigFile ? rightSigFile.name : 'Choose PNG/JPG file'}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleRightSigChange}
                            className="hidden"
                          />
                        </label>
                      </label>
                      <p className="text-[9px] text-[var(--text-muted)] mt-1">✨ Auto-clean: Paper background is automatically made transparent</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-color)] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSignatureModalOpen(false)}
                    className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-dark)] rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sigSaving}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    {sigSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {isDirector ? 'Save My Signature' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
